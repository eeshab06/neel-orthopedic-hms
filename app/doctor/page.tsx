"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

interface Appointment {
  appt_id: number; token_number: number; status: string;
  patient: { name: string; phone: string; dob: string };
  slot: { start_time: string; end_time: string; slot_date: string };
}
interface Holiday { id?: number; from_date: string; to_date: string; reason: string; }
interface EmergencyStatus { id: number; is_active: boolean; delay_minutes: number; message: string; }

export default function DoctorPortal() {
  const { user, loading: authLoading, signOut } = useAuth("/doctor");
  const [tab, setTab] = useState<"today" | "holidays" | "surgery">("today");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHoliday, setNewHoliday] = useState({ from_date: "", to_date: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Emergency state
  const [emergency, setEmergency] = useState<EmergencyStatus | null>(null);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [selectedDelay, setSelectedDelay] = useState(30);

  const today = new Date().toISOString().split("T")[0];

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from("appointment")
      .select(`appt_id, token_number, status, patient:patient_id (name, phone, dob), slot:slot_id (start_time, end_time, slot_date)`)
      .neq("status", "cancelled")
      .order("token_number", { ascending: true });
    // Filter today client-side
    const todayData = (data || []).filter(
      (a: any) => (a.slot as any)?.slot_date === today
    );
    setAppointments(todayData as any);
    setLoading(false);
  };

  const fetchHolidays = async () => {
    const { data } = await supabase.from("doctor_holiday").select("*").eq("doctor_id", 5).gte("to_date", today).order("from_date", { ascending: true });
    if (data) setHolidays(data);
  };

  const fetchEmergency = async () => {
    const { data } = await supabase.from("emergency_status").select("*").eq("id", 1).single();
    if (data) setEmergency(data);
  };

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
    fetchHolidays();
    fetchEmergency();
    const channel = supabase.channel("doctor_appointments_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment" }, fetchAppointments)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const activateEmergency = async () => {
    setEmergencyLoading(true);
    const msg = `🚨 OPD delayed by ${selectedDelay} minutes due to an emergency case. We apologize for the inconvenience.`;
    await supabase.from("emergency_status").update({
      is_active: true,
      delay_minutes: selectedDelay,
      message: msg,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    await fetchEmergency();
    setShowEmergencyPanel(false);
    setEmergencyLoading(false);
  };

  const deactivateEmergency = async () => {
    setEmergencyLoading(true);
    await supabase.from("emergency_status").update({
      is_active: false,
      delay_minutes: 0,
      message: "",
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    await fetchEmergency();
    setEmergencyLoading(false);
  };

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

  const bookedAppointments = appointments.filter(a => a.token_number <= 144);
  const walkIns = appointments.filter(a => a.token_number >= 145);

  const filteredBooked = bookedAppointments.filter(a => {
    const q = search.toLowerCase();
    if (!q) return true;
    const p = a.patient as any;
    return p?.name?.toLowerCase().includes(q) || String(a.token_number).includes(q);
  });

  const filteredWalkIns = walkIns.filter(a => {
    const q = search.toLowerCase();
    if (!q) return true;
    const p = a.patient as any;
    return p?.name?.toLowerCase().includes(q) || String(a.token_number).includes(q);
  });

  const stats = {
    total: appointments.length,
    booked: bookedAppointments.length,
    walkIn: walkIns.length,
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

  const getDelayedTime = (delayMins: number) => {
    const start = new Date();
    start.setHours(10, 0, 0, 0);
    start.setMinutes(start.getMinutes() + delayMins);
    return start.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const PatientTable = ({ patients, isWalkIn }: { patients: Appointment[]; isWalkIn: boolean }) => (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #f0f4ff" }}>
          {["Token", "Patient", "Age", "Phone", "Time", "Status"].map(h => (
            <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#9ca3af", letterSpacing: "1px", fontFamily: "'Inter',sans-serif" }}>{h.toUpperCase()}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {patients.map((a, i) => (
          <tr key={a.appt_id} style={{ borderBottom: "1px solid #f8f9fc", background: i % 2 === 0 ? "white" : "#fafbff" }}>
            <td style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: 40, height: 40, background: isWalkIn ? "linear-gradient(135deg,#92400e,#f59e0b)" : "linear-gradient(135deg,#0f2d6b,#1a56db)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "14px", fontFamily: "'Inter',sans-serif" }}>
                  {a.token_number}
                </div>
                {isWalkIn && <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "6px", fontFamily: "'Inter',sans-serif", letterSpacing: "0.5px" }}>WALK-IN</span>}
              </div>
            </td>
            <td style={{ padding: "14px 16px", fontWeight: "700", color: "#030a1e", fontSize: "15px", fontFamily: "'Inter',sans-serif" }}>{(a.patient as any)?.name}</td>
            <td style={{ padding: "14px 16px", color: "#6b7280", fontFamily: "'Inter',sans-serif" }}>{calcAge((a.patient as any)?.dob)} yrs</td>
            <td style={{ padding: "14px 16px", color: "#6b7280", fontSize: "14px", fontFamily: "'Inter',sans-serif" }}>{(a.patient as any)?.phone}</td>
            <td style={{ padding: "14px 16px", color: "#6b7280", fontSize: "14px", fontFamily: "'Inter',sans-serif" }}>
              {(a.slot as any)?.start_time ? formatTime((a.slot as any).start_time) : "—"}
            </td>
            <td style={{ padding: "14px 16px" }}>
              <span style={{
                padding: "5px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", fontFamily: "'Inter',sans-serif",
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
  );

  if (authLoading || !user) return <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", color: "#0a2463", fontSize: "18px" }}>Loading…</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        input,select,textarea{color:#030a1e!important;font-size:15px!important;font-family:'Inter',sans-serif!important;}
        input::placeholder{color:#9ca3af!important;}
        input:focus,select:focus{border-color:#1a56db!important;outline:none!important;}
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 24px 0" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Total Today", value: stats.total, bg: "linear-gradient(135deg,#0f2d6b,#1a56db)" },
            { label: "OPD Booked", value: stats.booked, bg: "linear-gradient(135deg,#0c4a6e,#0ea5e9)" },
            { label: "Walk-ins", value: stats.walkIn, bg: "linear-gradient(135deg,#92400e,#f59e0b)" },
            { label: "Completed", value: stats.completed, bg: "linear-gradient(135deg,#064e3b,#10b981)" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 16, padding: "22px 24px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", color: "white" }}>
              <div style={{ fontSize: "14px", opacity: 0.75, marginBottom: "8px", fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: "44px", fontWeight: "900", fontFamily: "'Playfair Display',serif", letterSpacing: "-2px", lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* EMERGENCY MODE BANNER */}
        {emergency?.is_active ? (
          <div style={{ background: "linear-gradient(135deg, #7f1d1d, #dc2626)", borderRadius: 16, padding: "20px 28px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(220,38,38,0.4)", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 28, animation: "pulse 1.5s infinite" }}>🚨</div>
              <div>
                <div style={{ color: "white", fontWeight: 800, fontSize: 17, fontFamily: "'Playfair Display',serif" }}>Emergency Mode Active — OPD Delayed by {emergency.delay_minutes} mins</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 3 }}>Token screen is showing delay notice to all patients</div>
              </div>
            </div>
            <button onClick={deactivateEmergency} disabled={emergencyLoading}
              style={{ background: "white", color: "#dc2626", border: "none", padding: "11px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {emergencyLoading ? "Updating..." : "✅ Clear Emergency"}
            </button>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 16, padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(10,36,99,0.07)", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 22 }}>🚨</div>
              <div>
                <div style={{ fontWeight: 700, color: "#030a1e", fontSize: 15 }}>Emergency Mode</div>
                <div style={{ color: "#9ca3af", fontSize: 13 }}>Activate if OPD needs to be delayed due to an emergency case</div>
              </div>
            </div>
            <button onClick={() => setShowEmergencyPanel(!showEmergencyPanel)}
              style={{ background: "linear-gradient(135deg,#7f1d1d,#dc2626)", color: "white", border: "none", padding: "11px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(220,38,38,0.3)" }}>
              🚨 Activate Emergency Mode
            </button>
          </div>
        )}

        {/* Emergency panel */}
        {showEmergencyPanel && !emergency?.is_active && (
          <div style={{ background: "#fff1f2", border: "1.5px solid #fecdd3", borderRadius: 16, padding: "24px 28px", marginBottom: 20, boxShadow: "0 4px 16px rgba(220,38,38,0.1)" }}>
            <div style={{ fontWeight: 800, color: "#dc2626", fontSize: 17, marginBottom: 16, fontFamily: "'Playfair Display',serif" }}>🚨 Select Delay Duration</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[15, 30, 45, 60].map(mins => (
                <button key={mins} onClick={() => setSelectedDelay(mins)}
                  style={{ padding: "12px 24px", borderRadius: 10, border: `2px solid ${selectedDelay === mins ? "#dc2626" : "#fecdd3"}`, background: selectedDelay === mins ? "#dc2626" : "white", color: selectedDelay === mins ? "white" : "#dc2626", fontWeight: 700, fontSize: 16, cursor: "pointer", transition: "all 0.2s" }}>
                  {mins} mins
                </button>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 10, padding: "14px 18px", marginBottom: 20, border: "1px solid #fecdd3" }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 6, fontWeight: 600 }}>PREVIEW — What patients will see:</div>
              <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 15 }}>🚨 OPD delayed by {selectedDelay} minutes due to an emergency case. We apologize for the inconvenience.</div>
              <div style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>Please arrive <strong>{selectedDelay} minutes later</strong> than your scheduled appointment time.</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={activateEmergency} disabled={emergencyLoading}
                style={{ background: "linear-gradient(135deg,#7f1d1d,#dc2626)", color: "white", border: "none", padding: "13px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(220,38,38,0.3)" }}>
                {emergencyLoading ? "Activating..." : "🚨 Confirm Emergency Mode"}
              </button>
              <button onClick={() => setShowEmergencyPanel(false)}
                style={{ background: "white", color: "#6b7280", border: "1.5px solid #e5e7eb", padding: "13px 24px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: 22 }}>
          {[{ key: "today", label: "🏥 Today's Patients" }, { key: "holidays", label: "🏖️ Holidays & Leave" }, { key: "surgery", label: "🔬 Surgery Schedule" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              style={{ padding: "11px 22px", borderRadius: "12px", border: "none", background: tab === t.key ? "linear-gradient(135deg,#0f2d6b,#1a56db)" : "white", color: tab === t.key ? "white" : "#6b7280", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TODAY TAB */}
        {tab === "today" && (
          <div>
            <div style={{ background: "white", borderRadius: "18px", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>
              <input type="text" placeholder="🔍  Search by name or token..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "11px 16px", border: "1.5px solid #e0e7ff", borderRadius: 10, fontSize: 15, outline: "none", fontFamily: "'Inter',sans-serif", boxSizing: "border-box" as const, color: "#030a1e" }} />
            </div>

            {loading ? (
              <div style={{ background: "white", borderRadius: "18px", padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: 16, boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div style={{ background: "white", borderRadius: "18px", padding: "60px", textAlign: "center", boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏥</div>
                <div style={{ fontWeight: "900", color: "#030a1e", fontSize: "22px", marginBottom: "8px", fontFamily: "'Playfair Display',serif" }}>No appointments today</div>
                <div style={{ color: "#9ca3af", fontSize: "15px" }}>Patients will appear here once booked</div>
              </div>
            ) : (
              <>
                {filteredBooked.length > 0 && (
                  <div style={{ background: "white", borderRadius: "18px", padding: "28px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "2px solid #f0f4ff" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#1a56db", boxShadow: "0 0 8px #1a56db" }} />
                      <h3 style={{ margin: 0, color: "#030a1e", fontSize: "18px", fontWeight: "800", fontFamily: "'Playfair Display',serif" }}>OPD Appointments</h3>
                      <span style={{ background: "#eff6ff", color: "#1a56db", borderRadius: "20px", padding: "3px 12px", fontSize: "13px", fontWeight: "700" }}>{filteredBooked.length} patients</span>
                    </div>
                    <PatientTable patients={filteredBooked} isWalkIn={false} />
                  </div>
                )}
                {filteredWalkIns.length > 0 && (
                  <div style={{ background: "white", borderRadius: "18px", padding: "28px", boxShadow: "0 2px 12px rgba(10,36,99,0.07)", border: "1.5px solid #fde68a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "2px solid #fef3c7" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px #f59e0b" }} />
                      <h3 style={{ margin: 0, color: "#030a1e", fontSize: "18px", fontWeight: "800", fontFamily: "'Playfair Display',serif" }}>Walk-in Patients</h3>
                      <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: "20px", padding: "3px 12px", fontSize: "13px", fontWeight: "700" }}>{filteredWalkIns.length} walk-ins</span>
                    </div>
                    <PatientTable patients={filteredWalkIns} isWalkIn={true} />
                  </div>
                )}
                {filteredBooked.length === 0 && filteredWalkIns.length === 0 && (
                  <div style={{ background: "white", borderRadius: "18px", padding: "60px", textAlign: "center", boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                    <div style={{ color: "#9ca3af", fontSize: "16px" }}>No patients found for "{search}"</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* HOLIDAYS TAB */}
        {tab === "holidays" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "white", borderRadius: "18px", padding: "32px", boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>
              <h3 style={{ color: "#030a1e", fontSize: "22px", fontWeight: "900", marginBottom: "24px", fontFamily: "'Playfair Display',serif", letterSpacing: "-0.5px" }}>Mark Holiday / Leave</h3>
              {[
                { label: "From Date *", key: "from_date", type: "date", min: today },
                { label: "To Date *", key: "to_date", type: "date", min: newHoliday.from_date || today },
                { label: "Reason *", key: "reason", type: "text", placeholder: "e.g. Conference, Personal leave" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>{f.label}</label>
                  <input type={f.type} placeholder={(f as any).placeholder || ""} min={(f as any).min || ""}
                    value={newHoliday[f.key as keyof typeof newHoliday]}
                    onChange={e => setNewHoliday({ ...newHoliday, [f.key]: e.target.value })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #e0e7ff", fontSize: "15px", fontFamily: "'Inter',sans-serif", boxSizing: "border-box" as const, color: "#030a1e" }} />
                </div>
              ))}
              <div style={{ background: "#fffbeb", borderRadius: "10px", padding: "12px 16px", marginBottom: "18px", fontSize: "14px", color: "#92400e", border: "1px solid #fde68a" }}>
                ⚠️ This will block all appointment slots and show "Doctor unavailable — [reason]" to patients trying to book.
              </div>
              <button onClick={addHoliday} disabled={saving || !newHoliday.from_date || !newHoliday.to_date || !newHoliday.reason}
                style={{ width: "100%", padding: "14px", background: saving ? "#e5e7eb" : "linear-gradient(135deg,#0f2d6b,#1a56db)", color: saving ? "#9ca3af" : "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(26,86,219,0.3)" }}>
                {saving ? "Saving..." : "Mark as Holiday →"}
              </button>
            </div>
            <div style={{ background: "white", borderRadius: "18px", padding: "32px", boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>
              <h3 style={{ color: "#030a1e", fontSize: "22px", fontWeight: "900", marginBottom: "24px", fontFamily: "'Playfair Display',serif", letterSpacing: "-0.5px" }}>Upcoming Holidays</h3>
              {holidays.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏖️</div>
                  <div style={{ color: "#9ca3af", fontSize: "15px" }}>No upcoming holidays marked</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {holidays.map((h, i) => (
                    <div key={i} style={{ background: "#fffbeb", borderRadius: "14px", padding: "20px", border: "1px solid #fde68a", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div>
                        <div style={{ fontWeight: "800", color: "#030a1e", fontSize: "16px", marginBottom: "4px" }}>{h.reason}</div>
                        <div style={{ color: "#6b7280", fontSize: "14px" }}>
                          {new Date(h.from_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {new Date(h.to_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <button onClick={() => removeHoliday(h)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 18px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", flexShrink: 0 }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SURGERY TAB */}
        {tab === "surgery" && (
          <div style={{ background: "white", borderRadius: "18px", padding: "32px", boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>
            <div style={{ textAlign: "center", padding: "60px" }}>
              <div style={{ fontSize: "56px", marginBottom: "20px" }}>🔬</div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#030a1e", marginBottom: "10px", fontFamily: "'Playfair Display',serif", letterSpacing: "-0.5px" }}>Surgery Schedule</div>
              <div style={{ fontSize: "16px", color: "#9ca3af", marginBottom: "24px" }}>Use the IPD page to schedule and manage surgeries</div>
              <a href="/ipd" style={{ display: "inline-block", background: "linear-gradient(135deg,#0f2d6b,#1a56db)", color: "white", padding: "14px 32px", borderRadius: "14px", textDecoration: "none", fontSize: "16px", fontWeight: "700", boxShadow: "0 4px 16px rgba(26,86,219,0.3)" }}>
                Go to IPD & Surgery →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}