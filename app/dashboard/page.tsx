"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface MonthlyStats {
  total_patients: number;
  total_appointments: number;
  total_surgeries: number;
  total_inpatients: number;
  total_discharged: number;
  low_stock_medicines: number;
  low_stock_implants: number;
  pending_stock_alerts: number;
}

interface RecentSurgery {
  surgery_id: number;
  surgery_date: string;
  surgery_type: string;
  status: string;
  patient?: { name: string };
}

interface StockAlert {
  alert_id: number;
  item_name: string;
  alert_type: string;
  current_qty: number;
  alert_date: string;
  resolved: boolean;
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth("/dashboard");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [recentSurgeries, setRecentSurgeries] = useState<RecentSurgery[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayAppts, setTodayAppts] = useState(0);
  const [currentInpatients, setCurrentInpatients] = useState(0);

  const fetchDashboard = async () => {
    setLoading(true);
    const [statsRes, surgeriesRes, alertsRes, ipdRes] = await Promise.all([
      supabase.rpc("get_monthly_stats", { p_month: month, p_year: year }),
      supabase.from("surgery").select("surgery_id, surgery_date, surgery_type, status, patient:patient_id(name)").order("surgery_date", { ascending: false }).limit(5),
      supabase.from("stock_alert").select("*").eq("resolved", false).order("alert_date", { ascending: false }).limit(10),
      supabase.from("ipd_record").select("ipd_id", { count: "exact" }).eq("status", "admitted"),
    ]);
    if (statsRes.data && statsRes.data.length > 0) setStats(statsRes.data[0] as MonthlyStats);
    if (surgeriesRes.data) setRecentSurgeries(surgeriesRes.data as RecentSurgery[]);
    if (alertsRes.data) setStockAlerts(alertsRes.data as StockAlert[]);
    if (ipdRes.count !== null) setCurrentInpatients(ipdRes.count);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchDashboard(); }, [user, month, year]);

  const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    "Scheduled":   { bg: "#dbeafe", color: "#1e40af" },
    "In Progress": { bg: "#fef9c3", color: "#854d0e" },
    "Completed":   { bg: "#dcfce7", color: "#16a34a" },
    "Cancelled":   { bg: "#fee2e2", color: "#dc2626" },
  };

  if (authLoading || !user) {
    return <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", color: "#0a2463" }}>Loading…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>
      <StaffNavbar user={user} onSignOut={signOut} />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, color: "#0a2463", fontSize: 22, fontWeight: 700 }}>📊 Hospital Dashboard</h1>
            <p style={{ margin: "2px 0 0", color: "#888", fontSize: 13 }}>Live Overview — Neel Orthopaedic Hospital</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #dbeafe", fontFamily: "Georgia, serif", fontSize: 13 }}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #dbeafe", fontFamily: "Georgia, serif", fontSize: 13 }}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={fetchDashboard} style={{ background: "#1a73e8", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>Refresh</button>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <p style={{ color: "#666", fontSize: 13, margin: "0 0 12px", fontWeight: 600 }}>📅 TODAY — LIVE</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Current Inpatients", value: currentInpatients, color: "#7c3aed", icon: "🛏️" },
              { label: "Pending Stock Alerts", value: stockAlerts.length, color: "#dc2626", icon: "⚠️" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(10,36,99,0.07)", borderTop: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: "#666", fontSize: 13, margin: "0 0 12px", fontWeight: 600 }}>
          📆 {MONTHS[month - 1].toUpperCase()} {year} — FROM STORED PROCEDURE
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#888" }}>Loading stats…</div>
        ) : stats ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Unique Patients",    value: stats.total_patients,      color: "#0a2463", icon: "👥" },
              { label: "OPD Appointments",   value: stats.total_appointments,  color: "#1a73e8", icon: "📋" },
              { label: "Surgeries",          value: stats.total_surgeries,     color: "#7c3aed", icon: "🔬" },
              { label: "IPD Admissions",     value: stats.total_inpatients,    color: "#0891b2", icon: "🛏️" },
              { label: "Discharged",         value: stats.total_discharged,    color: "#16a34a", icon: "✅" },
              { label: "Low Stock Medicines",value: stats.low_stock_medicines, color: "#dc2626", icon: "💊" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(10,36,99,0.07)", borderTop: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{s.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>No data for this period.</div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(10,36,99,0.07)" }}>
            <h3 style={{ margin: "0 0 16px", color: "#0a2463", fontSize: 16 }}>🔬 Recent Surgeries</h3>
            {recentSurgeries.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#aaa", fontSize: 13 }}>No surgeries yet.</div>
            ) : recentSurgeries.map(s => {
              const sc = STATUS_COLORS[s.status] || { bg: "#f1f5f9", color: "#333" };
              return (
                <div key={s.surgery_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f4ff" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0a2463", fontSize: 13 }}>{(s.patient as any)?.name || "—"}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{s.surgery_type} · {s.surgery_date}</div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.status}</span>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(10,36,99,0.07)" }}>
            <h3 style={{ margin: "0 0 16px", color: "#0a2463", fontSize: 16 }}>⚠️ Unresolved Stock Alerts</h3>
            {stockAlerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#16a34a", fontSize: 13 }}>✅ All stock levels OK!</div>
            ) : stockAlerts.map(a => (
              <div key={a.alert_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f4ff" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#0a2463", fontSize: 13 }}>{a.item_name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{a.alert_type} · Qty: {a.current_qty}</div>
                </div>
                <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>LOW</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}