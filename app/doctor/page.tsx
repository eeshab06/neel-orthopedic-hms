"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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
  // ── ALL HOOKS FIRST ──────────────────────────────────────
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<"today" | "holidays" | "surgery">("today");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHoliday, setNewHoliday] = useState({ from_date: "", to_date: "", reason: "" });
  const [saving, setSaving] = useState(false);
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
    if (authenticated) {
      fetchAppointments();
      fetchHolidays();
    }
  }, [authenticated]);

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

  // ── PIN SCREEN (after all hooks) ─────────────────────────
  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "360px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", background: "#0a2463", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "24px", fontWeight: "800", margin: "0 auto 20px" }}>N</div>
          <h2 style={{ color: "#0a2463", fontSize: "20px", marginBottom: "8px" }}>Doctor Portal</h2>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "28px" }}>Enter your PIN to continue</p>
          <input
            type="password"
            placeholder="••••"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                if (pin === "1001") setAuthenticated(true);
                else alert("Wrong PIN!");
              }
            }}
            style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1.5px solid #e0e7ff", fontSize: "24px", textAlign: "center", letterSpacing: "8px", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: "16px" }}
          />
          <button
            onClick={() => { if (pin === "1001") setAuthenticated(true); else alert("Wrong PIN!"); }}
            style={{ width: "100%", padding: "14px", background: "#0a2463", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}
          >Enter →</button>
        </div>
      </div>
    );
  }

  // ── MAIN PORTAL ──────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>

      <div style={{ background: "#0a2463", padding: "0 5%", height: "65px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>Dr. G.K. Boob — Doctor Portal</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link href="/token" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "13px" }}>Reception Screen</Link>
          <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "13px" }}>← Website</Link>
        </div>
      </div>

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
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>Loading...</div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#999" }}>No appointments today</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f0f4ff" }}>
                    {["Token", "Patient Name", "Age", "Phone", "Session", "Status"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#888", letterSpacing: "0.5px" }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a, i) => (
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
                ⚠️ This will block all slots for selected dates. Patients will see "Doctor not available".
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
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔧</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#0a2463", marginBottom: "8px" }}>Surgery Schedule</div>
              <div style={{ fontSize: "14px" }}>Coming soon — Kamya's module</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}