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

type ViewMode = "today" | "month";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth("/dashboard");
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [recentSurgeries, setRecentSurgeries] = useState<RecentSurgery[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentInpatients, setCurrentInpatients] = useState(0);
  const [todayOPD, setTodayOPD] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(0);
  const [todayNewPatients, setTodayNewPatients] = useState(0);
  const [todaySurgeries, setTodaySurgeries] = useState(0);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const todayDisplay = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

  const fetchDashboard = async () => {
    setLoading(true);
    const [statsRes, surgeriesRes, alertsRes, ipdRes, todayOPDRes, todayCompletedRes, todayPatientsRes, todaySurgRes] = await Promise.all([
      supabase.rpc("get_monthly_stats", { p_month: month, p_year: year }),
      supabase.from("surgery").select("surgery_id, surgery_date, surgery_type, status, patient:patient_id!inner(name)").order("surgery_date", { ascending: false }).limit(5),
      supabase.from("stock_alert").select("*").eq("resolved", false).order("alert_date", { ascending: false }).limit(10),
      supabase.from("ipd_record").select("ipd_id", { count: "exact" }).eq("status", "admitted"),
      supabase.from("appointment").select("appt_id, slot:slot_id!inner(slot_date)", { count: "exact", head: true }).eq("slot.slot_date" as any, today),
      supabase.from("appointment").select("appt_id, slot:slot_id!inner(slot_date)", { count: "exact", head: true }).eq("status", "completed").eq("slot.slot_date" as any, today),
      supabase.from("patient").select("patient_id", { count: "exact", head: true }).gte("created_at", today),
      supabase.from("surgery").select("surgery_id", { count: "exact", head: true }).eq("surgery_date", today),
    ]);
    if (statsRes.data && statsRes.data.length > 0) setStats(statsRes.data[0] as MonthlyStats);
    if (surgeriesRes.data) setRecentSurgeries(surgeriesRes.data as any[]);
    if (alertsRes.data) setStockAlerts(alertsRes.data as StockAlert[]);
    if (ipdRes.count !== null) setCurrentInpatients(ipdRes.count);
    if (todayOPDRes.count !== null) setTodayOPD(todayOPDRes.count);
    if (todayCompletedRes.count !== null) setTodayCompleted(todayCompletedRes.count);
    if (todayPatientsRes.count !== null) setTodayNewPatients(todayPatientsRes.count);
    if (todaySurgRes.count !== null) setTodaySurgeries(todaySurgRes.count);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchDashboard(); }, [user, month, year]);

  const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
    "Scheduled":   { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
    "In Progress": { bg: "#fffbeb", color: "#854d0e", border: "#fde68a" },
    "Completed":   { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
    "Cancelled":   { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3" },
    "scheduled":   { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
    "in_progress": { bg: "#fffbeb", color: "#854d0e", border: "#fde68a" },
    "completed":   { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
    "cancelled":   { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3" },
  };

  if (authLoading || !user) {
    return <div style={{ minHeight: "100vh", background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: "#0a2463" }}>Loading…</div>;
  }

  const StatCard = ({ label, value, border }: { label: string; value: number; border: string }) => (
    <div style={{ background: "#fafcff", borderRadius: 12, padding: "22px 24px", border: "1px solid #e3e6ef", borderLeft: `4px solid ${border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 44, fontWeight: 700, color: "#0a2463", lineHeight: 1 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#eef4ff", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        select, button { font-family: 'DM Sans', sans-serif !important; }
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, color: "#0a2463", fontSize: 24, fontWeight: 700, letterSpacing: "-0.3px" }}>Hospital Dashboard</h1>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 14 }}>Neel Orthopaedic Multispeciality Hospital</p>
          </div>

          {/* View toggle + controls */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <div style={{ display: "flex", background: "white", border: "1px solid #e3e6ef", borderRadius: 10, padding: 4, gap: 4 }}>
              {(["today", "month"] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  style={{ padding: "7px 20px", borderRadius: 7, border: "none", background: viewMode === v ? "#0a2463" : "transparent", color: viewMode === v ? "white" : "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
                  {v === "today" ? "Today" : "Monthly"}
                </button>
              ))}
            </div>
            {viewMode === "month" && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e3e6ef", fontSize: 13, color: "#1e293b", background: "white", cursor: "pointer" }}>
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select value={year} onChange={e => setYear(parseInt(e.target.value))}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e3e6ef", fontSize: 13, color: "#1e293b", background: "white", cursor: "pointer" }}>
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={fetchDashboard}
                  style={{ background: "#0a2463", color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Go
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8", fontSize: 15 }}>Loading…</div>
        ) : viewMode === "today" ? (
          <>
            {/* Today date */}
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 14px", fontWeight: 600, letterSpacing: "0.5px" }}>{todayDisplay.toUpperCase()}</p>

            {/* Today stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
              <StatCard label="OPD Appointments Today" value={todayOPD} border="#93c5fd" />
              <StatCard label="Completed Today" value={todayCompleted} border="#86efac" />
              <StatCard label="New Patients Today" value={todayNewPatients} border="#c4b5fd" />
              <StatCard label="Current Inpatients" value={currentInpatients} border="#93c5fd" />
              <StatCard label="Surgeries Today" value={todaySurgeries} border="#c4b5fd" />
              <StatCard label="Pending Stock Alerts" value={stockAlerts.length} border="#fca5a5" />
            </div>

            {/* Bottom grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#fafcff", borderRadius: 12, padding: 24, border: "1px solid #e3e6ef", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 18px", color: "#0a2463", fontSize: 15, fontWeight: 600 }}>Recent Surgeries</h3>
                {recentSurgeries.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 }}>No surgeries yet.</div>
                ) : recentSurgeries.map(s => {
                  const sc = STATUS_STYLE[s.status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
                  return (
                    <div key={s.surgery_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #eef4ff" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{(s.patient as any)?.name || "—"}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{s.surgery_type} · {s.surgery_date}</div>
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{s.status}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ background: "#fafcff", borderRadius: 12, padding: 24, border: "1px solid #e3e6ef", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 18px", color: "#0a2463", fontSize: 15, fontWeight: 600 }}>Unresolved Stock Alerts</h3>
                {stockAlerts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#166534", fontSize: 13 }}>All stock levels OK</div>
                ) : stockAlerts.map(a => (
                  <div key={a.alert_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #eef4ff" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{a.item_name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{a.alert_type} · Qty: {a.current_qty}</div>
                    </div>
                    <span style={{ background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>Low</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Monthly date */}
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 14px", fontWeight: 600, letterSpacing: "0.5px" }}>{MONTHS[month - 1].toUpperCase()} {year}</p>

            {/* Monthly stats */}
            {stats ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
                <StatCard label="Unique Patients" value={stats.total_patients} border="#93c5fd" />
                <StatCard label="OPD Appointments" value={stats.total_appointments} border="#93c5fd" />
                <StatCard label="Surgeries" value={stats.total_surgeries} border="#c4b5fd" />
                <StatCard label="IPD Admissions" value={stats.total_inpatients} border="#93c5fd" />
                <StatCard label="Discharged" value={stats.total_discharged} border="#86efac" />
                <StatCard label="Low Stock Medicines" value={stats.low_stock_medicines} border="#fca5a5" />
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>No data for this period.</div>
            )}

            {/* Bottom grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#fafcff", borderRadius: 12, padding: 24, border: "1px solid #e3e6ef", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 18px", color: "#0a2463", fontSize: 15, fontWeight: 600 }}>Recent Surgeries</h3>
                {recentSurgeries.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 }}>No surgeries yet.</div>
                ) : recentSurgeries.map(s => {
                  const sc = STATUS_STYLE[s.status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
                  return (
                    <div key={s.surgery_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #eef4ff" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{(s.patient as any)?.name || "—"}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{s.surgery_type} · {s.surgery_date}</div>
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{s.status}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ background: "#fafcff", borderRadius: 12, padding: 24, border: "1px solid #e3e6ef", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 18px", color: "#0a2463", fontSize: 15, fontWeight: 600 }}>Unresolved Stock Alerts</h3>
                {stockAlerts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#166534", fontSize: 13 }}>All stock levels OK</div>
                ) : stockAlerts.map(a => (
                  <div key={a.alert_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #eef4ff" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{a.item_name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{a.alert_type} · Qty: {a.current_qty}</div>
                    </div>
                    <span style={{ background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>Low</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}