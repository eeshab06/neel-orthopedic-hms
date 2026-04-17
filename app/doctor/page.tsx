"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

interface Appointment {
  appt_id: number;
  token_number: number;
  status: string;
  patient: { name: string; phone: string; dob: string };
  slot: { start_time: string; end_time: string; slot_date: string };
}

interface Holiday {
  id?: number;
  from_date: string;
  to_date: string;
  reason: string;
}

export default function DoctorPortal() {
  const { user, loading: authLoading, signOut } = useAuth("/doctor");
  const [tab, setTab] = useState<"today" | "holidays" | "surgery">("today");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHoliday, setNewHoliday] = useState({ from_date: "", to_date: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from("appointment")
      .select(`appt_id, token_number, status, patient:patient_id (name, phone, dob), slot:slot_id (start_time, end_time, slot_date)`)
      .eq("slot.slot_date", today)
      .neq("status", "cancelled")
      .order("token_number", { ascending: true });
    if (data) setAppointments(data as any);
    setLoading(false);
  };

  const fetchHolidays = async () => {
    const { data } = await supabase
      .from("doctor_holiday")
      .select("*")
      .eq("doctor_id", 5)
      .gte("to_date", today)
      .order("from_date", { ascending: true });
    if (data) setHolidays(data);
  };

  useEffect(() => {
    if (!user) return;

    fetchAppointments();
    fetchHolidays();

    // Real-time: auto-update when new bookings come in
    const channel = supabase
      .channel("doctor_appointments_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment" }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const addHoliday = async () => {
    if (!newHoliday.from_date || !newHoliday.to_date || !newHoliday.reason) return;
    setSaving(true);
    await supabase.from("slot").update({ is_available: false }).eq("doctor_id", 5).gte("slot_date", newHoliday.from_date).lte("slot_date", newHoliday.to_date);
    await supabase.from("doctor_holiday").insert({ doctor_id: 5, ...newHoliday });
    setNewHoliday({ from_date: "", to_date: "", reason: "" });
    fetchHolidays();
    setSaving(false);
    alert("Holiday marked! Slots blocked.");
  };

  const removeHoliday = async (holiday: Holiday) => {
    if (!confirm("Remove this holiday and re-enable slots?")) return;
    await supabase.from("slot").update({ is_available: true }).eq("doctor_id", 5).gte("slot_date", holiday.from_date).lte("slot_date", holiday.to_date);
    await supabase.from("doctor_holiday").delete().eq("id", holiday.id);
    fetchHolidays();
  };

  const stats = {
    total: appointments.length,
    waiting: appointments.filter(a => a.status === "booked").length,
    inProgress: appointments.filter(a => a.status === "checked_in").length,
    completed: appointments.filter(a => a.status === "completed").length,
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const calcAge = (dob: string) => {
    if (!dob) return "—";
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365));
  };

  const filteredAppointments = appointments.filter(a => {
    const q = search.toLowerCase();
    if (!q) return true;
    const p = a.patient as any;
    return p?.name?.toLowerCase().includes(q) || String(a.token_number).includes(q);
  });

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", color: "#0a2463" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>
      <StaffNavbar user={user} onSignOut={signOut} />

      <div style={{ padding: "24px 5% 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Today", value: stats.total, color: "#0a2463" },
            { label: "Waiting", value: stats.waiting, color: "#f59e0b" },
            { label: "In Progress", value: stats.inProgress, color: "#1a73e8" },
            { label: "Completed", value: stats.completed, color: "#16a34a" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontSize: "36px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {[
            { key: "today", label: "Today's Patients" },
            { key: "holidays", label: "Holidays & Leave" },
            { key: "surgery", label: "Surgery Schedule" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: tab === t.key ? "#0a2463" : "white", color: tab === t.key ? "white" : "#666", fontWeight: "600", fontSize: "14px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "today" && (
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <input type="text" placeholder="🔍  Search by name or token..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 16px", border: "1.5px solid #e0e7ff", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 16 }} />
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>Loading...</div>
            ) : filteredAppointments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#999" }}>No appointments found</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f0f4ff" }}>
                    {["Token", "Patient Name", "Age", "Phone", "Session", "Status", "Action"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#888", letterSpacing: "0.5px" }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((a, i) => (
                    <tr key={a.appt_id} style={{ borderBottom: "1px solid #f8f9fc", background: i % 2 === 0 ? "white" : "#fafbff" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ width: "36px", height: "36px", background: "#0a2463", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "14px" }}>{a.token_number}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: "600", color: "#0a2463" }}>{(a.patient as any)?.name}</td>
                      <td style={{ padding: "14px 16px", color: "#666" }}>{calcAge((a.patient as any)?.dob)} yrs</td>
                      <td style={{ padding: "14px 16px", color: "#666", fontSize: "13px" }}>{(a.patient as any)?.phone}</td>
                      <td style={{ padding: "14px 16px", color: "#666", fontSize: "13px" }}>{(a.slot as any)?.start_time ? formatTime((a.slot as any).start_time) : "—"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                          background: a.status === "completed" ? "#dcfce7" : a.status === "checked_in" ? "#dbeafe" : "#fef3c7",
                          color: a.status === "completed" ? "#16a34a" : a.status === "checked_in" ? "#1e40af" : "#92400e"
                        }}>
                          {a.status === "booked" ? "Waiting" : a.status === "checked_in" ? "In Progress" : "Completed"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button onClick={() => { setTab("surgery"); }}
                          style={{ background: "#0a2463", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif", whiteSpace: "nowrap" }}>
                          🔬 Surgery
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "holidays" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#0a2463", fontSize: "18px", marginBottom: "20px" }}>Mark Holiday / Leave</h3>
              {[
                { label: "From Date *", key: "from_date", type: "date", min: today },
                { label: "To Date *", key: "to_date", type: "date", min: newHoliday.from_date || today },
                { label: "Reason *", key: "reason", type: "text", placeholder: "e.g. Conference, Personal leave" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>{f.label}</label>
                  <input type={f.type} placeholder={(f as any).placeholder || ""} min={(f as any).min || ""}
                    value={newHoliday[f.key as keyof typeof newHoliday]}
                    onChange={e => setNewHoliday({ ...newHoliday, [f.key]: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e7ff", fontSize: "15px", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ background: "#fff8e1", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#795548" }}>
                ⚠️ This will block all slots for selected dates.
              </div>
              <button onClick={addHoliday} disabled={saving || !newHoliday.from_date || !newHoliday.to_date || !newHoliday.reason}
                style={{ width: "100%", padding: "12px", background: saving ? "#94a3b8" : "#0a2463", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : "Mark as Holiday"}
              </button>
            </div>
            <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#0a2463", fontSize: "18px", marginBottom: "20px" }}>Upcoming Holidays</h3>
              {holidays.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#999", fontSize: "14px" }}>No upcoming holidays marked</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {holidays.map((h, i) => (
                    <div key={i} style={{ background: "#fff8e1", borderRadius: "10px", padding: "16px", border: "1px solid #ffe082", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "14px" }}>{h.reason}</div>
                        <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>
                          {new Date(h.from_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {new Date(h.to_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <button onClick={() => removeHoliday(h)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "surgery" && (
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ textAlign: "center", padding: "60px", color: "#999" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔬</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#0a2463", marginBottom: "8px" }}>Surgery Schedule</div>
              <div style={{ fontSize: "14px" }}>Use the IPD page to schedule and manage surgeries</div>
              <a href="/ipd" style={{ display: "inline-block", marginTop: "16px", background: "#0a2463", color: "white", padding: "10px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                Go to IPD & Surgery →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}