"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STAFF_PIN = "1001";

const TEAM = {
  anaesthetist: { name: "Dr. Vijay Rangani", role: "Anaesthetist", phone: "919999999991" },
  physio:       { name: "Dr. Jay Pathak",    role: "Physiotherapist", phone: "919999999992" },
  cardio:       { name: "Dr. Chetan Bhambure", role: "Physician & Cardiologist", phone: "919999999993" },
};

const SURGERY_TYPES = [
  "Total Knee Replacement (TKR)", "Total Hip Replacement (THR)", "Partial Knee Replacement (PKR)",
  "Revision Knee Replacement", "Revision Hip Replacement", "Lumbar Spine Fusion",
  "Cervical Spine Surgery", "Discectomy", "Laminectomy", "Rotator Cuff Repair",
  "Shoulder Arthroplasty", "ACL Reconstruction", "Fracture Fixation - Femur",
  "Fracture Fixation - Tibia", "Fracture Fixation - Hip (PFNA)", "Fracture Fixation - Forearm",
  "Ankle Fusion", "Arthroscopy - Knee", "Arthroscopy - Shoulder", "Carpal Tunnel Release",
  "Bone Grafting", "Implant Removal", "Other",
];

const OT_NUMBERS = ["OT-1", "OT-2", "OT-3"];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "Scheduled":   { bg: "#dbeafe", color: "#1e40af" },
  "In Progress": { bg: "#fef9c3", color: "#854d0e" },
  "Completed":   { bg: "#dcfce7", color: "#16a34a" },
  "Cancelled":   { bg: "#fee2e2", color: "#dc2626" },
};

type TabType = "board" | "schedule" | "inpatients";

interface Surgery {
  surgery_id: number; patient_id: number; doctor_id: number;
  surgery_date: string; surgery_time: string | null; surgery_type: string;
  ot_number: string; anaesthesia_dr: string; assistant_dr: string;
  implant_id: number | null; status: string; notes: string | null;
  physio_booked: boolean; cardio_cleared: boolean;
  patient?: { name: string; uhid: string; phone: string };
  doctor?: { name: string }; implant?: { name: string };
}
interface Patient { patient_id: number; name: string; uhid: string; phone: string; }
interface Doctor  { doctor_id: number; name: string; }
interface Implant { implant_id: number; name: string; manufacturer: string; quantity_in_stock: number; unit_price: number; }
interface IPDRecord {
  ipd_id: number; patient_id: number; admit_date: string; room_number: string; status: string;
  patient?: { name: string; uhid: string; phone: string };
}

function waLink(phone: string, msg: string) { return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`; }
function buildWAMessage(surgery: Surgery, recipient: string) {
  const date = surgery.surgery_date;
  const time = surgery.surgery_time ? surgery.surgery_time.slice(0, 5) : "TBD";
  const patient = surgery.patient?.name || "Patient";
  const uhid = surgery.patient?.uhid || "";
  const type = surgery.surgery_type;
  const ot = surgery.ot_number;
  return `🏥 *Neel Orthopaedic Hospital*\n\nDear ${recipient},\n\nYou are requested for the following surgery:\n\n👤 *Patient:* ${patient} (UHID: ${uhid})\n🔬 *Procedure:* ${type}\n📅 *Date:* ${date}\n⏰ *Time:* ${time}\n🏠 *OT:* ${ot}\n\nKindly confirm your availability.\n\n— Dr. G.K. Boob\nNeel Orthopaedic Hospital\n📞 7021094941`;
}

export default function IPDPage() {
  const { user, loading: authLoading, signOut } = useAuth("/ipd");
  const [activeTab, setActiveTab] = useState<TabType>("board");

  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [implants, setImplants] = useState<Implant[]>([]);
  const [inpatients, setInpatients] = useState<IPDRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [boardFilter, setBoardFilter] = useState("all");
  const [boardSearch, setBoardSearch] = useState("");

  const [form, setForm] = useState({
    patient_id: "", doctor_id: "5",
    surgery_date: new Date().toISOString().split("T")[0],
    surgery_time: "08:00", surgery_type: "", ot_number: "OT-1",
    anaesthesia_dr: "Dr. Vijay Rangani", assistant_dr: "", implant_id: "", notes: "",
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scheduledSurgery, setScheduledSurgery] = useState<Surgery | null>(null);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [sRes, pRes, dRes, iRes, ipdRes] = await Promise.all([
      supabase.from("surgery")
        .select("*, patient:patient_id(name,uhid,phone), doctor:doctor_id(name), implant:implant_id(name)")
        .order("surgery_date", { ascending: false })
        .order("surgery_time", { ascending: true }),
      supabase.from("patient").select("patient_id,name,uhid,phone").order("name"),
      supabase.from("doctor").select("doctor_id,name"),
      supabase.from("implant").select("*").order("name"),
      supabase.from("ipd_record")
        .select("*, patient:patient_id(name,uhid,phone)")
        .eq("status", "admitted")
        .order("admit_date", { ascending: false }),
    ]);
    if (sRes.data)   setSurgeries(sRes.data as Surgery[]);
    if (pRes.data)   setPatients(pRes.data as Patient[]);
    if (dRes.data)   setDoctors(dRes.data as Doctor[]);
    if (iRes.data)   setImplants(iRes.data as Implant[]);
    if (ipdRes.data) setInpatients(ipdRes.data as IPDRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  useEffect(() => {
    if (patientSearch.length < 2) { setPatientResults([]); return; }
    setPatientResults(
      patients.filter(p =>
        p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        (p.uhid || "").toLowerCase().includes(patientSearch.toLowerCase()) ||
        (p.phone || "").includes(patientSearch)
      ).slice(0, 6)
    );
  }, [patientSearch, patients]);

  const handleSchedule = async () => {
    setFormError(""); setFormSuccess("");
    if (!form.patient_id)    { setFormError("Please select a patient."); return; }
    if (!form.surgery_type)  { setFormError("Please select surgery type."); return; }
    if (!form.surgery_date)  { setFormError("Please select date."); return; }
    if (!form.surgery_time)  { setFormError("Please select time."); return; }
    if (!form.anaesthesia_dr.trim()) { setFormError("Anaesthetist name required."); return; }
    setSubmitting(true);
    const { data, error } = await supabase.from("surgery").insert({
      patient_id:    parseInt(form.patient_id),
      doctor_id:     parseInt(form.doctor_id),
      surgery_date:  form.surgery_date,
      surgery_time:  form.surgery_time,
      surgery_type:  form.surgery_type,
      ot_number:     form.ot_number,
      anaesthesia_dr: form.anaesthesia_dr.trim(),
      assistant_dr:  form.assistant_dr.trim() || null,
      implant_id:    form.implant_id ? parseInt(form.implant_id) : null,
      notes:         form.notes.trim() || null,
      status:        "Scheduled",
      physio_booked: false,
      cardio_cleared: false,
    }).select("*, patient:patient_id(name,uhid,phone), doctor:doctor_id(name), implant:implant_id(name)").single();
    if (error) {
      setFormError("Failed to schedule: " + error.message);
    } else {
      setFormSuccess("✅ Surgery scheduled! Send WhatsApp notifications below.");
      setScheduledSurgery(data as Surgery);
      await fetchAll();
      setForm({ patient_id: "", doctor_id: "5", surgery_date: new Date().toISOString().split("T")[0], surgery_time: "08:00", surgery_type: "", ot_number: "OT-1", anaesthesia_dr: "Dr. Vijay Rangani", assistant_dr: "", implant_id: "", notes: "" });
      setSelectedPatient(null); setPatientSearch("");
    }
    setSubmitting(false);
  };

  const updateStatus = async (surgery_id: number, status: string) => {
    setUpdatingId(surgery_id);
    await supabase.from("surgery").update({ status }).eq("surgery_id", surgery_id);
    await fetchAll();
    setUpdatingId(null);
  };

  const getDaysSince = (d: string) => Math.ceil((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));

  const filteredSurgeries = surgeries.filter(s => {
    const matchStatus = boardFilter === "all" || s.status === boardFilter;
    const q = boardSearch.toLowerCase();
    const matchSearch = !q || s.patient?.name?.toLowerCase().includes(q) || s.patient?.uhid?.toLowerCase().includes(q) || s.surgery_type?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const scheduled  = surgeries.filter(s => s.status === "Scheduled").length;
  const inProgress = surgeries.filter(s => s.status === "In Progress").length;
  const completed  = surgeries.filter(s => s.status === "Completed").length;
  const todaySurgeries = surgeries.filter(s => s.surgery_date === new Date().toISOString().split("T")[0]).length;

  if (authLoading || !user) return <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", color: "#0a2463", fontSize: 18 }}>Loading…</div>;

  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", border: "1.5px solid #dbeafe", borderRadius: 10, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "'Inter',sans-serif", background: "#fff", color: "#030a1e" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 600, fontFamily: "'Inter',sans-serif" };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        input,select,textarea{color:#030a1e!important;font-size:15px!important;font-family:'Inter',sans-serif!important;}
        input::placeholder,textarea::placeholder{color:#9ca3af!important;}
        input:focus,select:focus,textarea:focus{border-color:#1a56db!important;outline:none!important;}
        button{font-family:'Inter',sans-serif!important;}
        th,td{font-family:'Inter',sans-serif;font-size:14px;}
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      {/* Premium header */}
      <div style={{ background: "linear-gradient(135deg,#0a1628,#1a2f6e)", padding: "20px 32px" }}>
        <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 900, fontFamily: "'Playfair Display',serif", letterSpacing: "-0.5px" }}>🏥 IPD & Surgery Management</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: "4px 0 0", fontSize: 14 }}>Neel Orthopaedic Hospital — Operation Theatre & Inpatient</p>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>
        {/* Gradient stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Today's Surgeries", value: todaySurgeries, bg: "linear-gradient(135deg,#0f2d6b,#1a56db)", icon: "📅" },
            { label: "Scheduled",         value: scheduled,      bg: "linear-gradient(135deg,#0c4a6e,#0ea5e9)", icon: "🗓️" },
            { label: "In Progress",       value: inProgress,     bg: "linear-gradient(135deg,#92400e,#f59e0b)", icon: "⚡" },
            { label: "Completed",         value: completed,      bg: "linear-gradient(135deg,#064e3b,#10b981)", icon: "✅" },
            { label: "Current Inpatients",value: inpatients.length, bg: "linear-gradient(135deg,#1e1b4b,#7c3aed)", icon: "🛏️" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "20px 22px", color: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "'Playfair Display',serif", letterSpacing: "-2px", lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(10,36,99,0.07)" }}>
          <div style={{ display: "flex", borderBottom: "2px solid #e8eef8", padding: "0 16px" }}>
            {([
              { key: "board",      label: "📋 Surgery Board" },
              { key: "schedule",   label: "➕ Schedule Surgery" },
              { key: "inpatients", label: `🛏️ Inpatients (${inpatients.length})` },
            ] as { key: TabType; label: string }[]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ padding: "16px 22px", border: "none", background: "transparent", fontSize: 15, fontWeight: activeTab === t.key ? 700 : 500, color: activeTab === t.key ? "#030a1e" : "#9ca3af", borderBottom: activeTab === t.key ? "3px solid #1a56db" : "3px solid transparent", cursor: "pointer", marginBottom: -2, whiteSpace: "nowrap", transition: "all 0.2s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── SURGERY BOARD ── */}
          {activeTab === "board" && (
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <input type="text" placeholder="🔍 Search patient, UHID, surgery..." value={boardSearch} onChange={e => setBoardSearch(e.target.value)} style={{ ...inp, flex: 1, minWidth: 220 }} />
                <select value={boardFilter} onChange={e => setBoardFilter(e.target.value)} style={{ ...inp, width: "auto" }}>
                  <option value="all">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#888", fontSize: 15 }}>Loading…</div>
              ) : filteredSurgeries.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔬</div>
                  <p style={{ fontSize: 15 }}>No surgeries found. Use Schedule Surgery tab to add one.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filteredSurgeries.map(s => {
                    const sc = STATUS_STYLE[s.status] || { bg: "#f1f5f9", color: "#333" };
                    const isToday = s.surgery_date === new Date().toISOString().split("T")[0];
                    return (
                      <div key={s.surgery_id} style={{ background: isToday ? "#f0f9ff" : "#fafafa", border: `1.5px solid ${isToday ? "#bfdbfe" : "#e8eef8"}`, borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 800, color: "#030a1e", fontSize: 17 }}>{s.patient?.name || "—"}</span>
                            <span style={{ fontSize: 13, color: "#888" }}>UHID: {s.patient?.uhid || "—"}</span>
                            {isToday && <span style={{ background: "#fef9c3", color: "#854d0e", fontSize: 12, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>TODAY</span>}
                          </div>
                          <div style={{ fontSize: 15, color: "#030a1e", fontWeight: 700, marginBottom: 4 }}>{s.surgery_type}</div>
                          <div style={{ fontSize: 14, color: "#666", display: "flex", gap: 16, flexWrap: "wrap" }}>
                            <span>📅 {s.surgery_date}</span>
                            {s.surgery_time && <span>⏰ {s.surgery_time.slice(0, 5)}</span>}
                            <span>🏠 {s.ot_number}</span>
                            <span>👨‍⚕️ {s.doctor?.name || "—"}</span>
                            {s.implant?.name && <span>🦴 {s.implant.name}</span>}
                          </div>
                          {s.anaesthesia_dr && <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Anaesthetist: {s.anaesthesia_dr}</div>}
                          {s.notes && <div style={{ fontSize: 13, color: "#666", marginTop: 4, fontStyle: "italic" }}>📝 {s.notes}</div>}
                          {/* Physio & Cardio toggles */}
                          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            <button onClick={async () => { await supabase.from("surgery").update({ physio_booked: !s.physio_booked }).eq("surgery_id", s.surgery_id); fetchAll(); }}
                              style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: s.physio_booked ? "#dcfce7" : "#f1f5f9", color: s.physio_booked ? "#16a34a" : "#6b7280", transition: "all 0.2s" }}>
                              {s.physio_booked ? "✅ Physio Booked" : "☐ Physio Booked"}
                            </button>
                            <button onClick={async () => { await supabase.from("surgery").update({ cardio_cleared: !s.cardio_cleared }).eq("surgery_id", s.surgery_id); fetchAll(); }}
                              style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: s.cardio_cleared ? "#dcfce7" : "#f1f5f9", color: s.cardio_cleared ? "#16a34a" : "#6b7280", transition: "all 0.2s" }}>
                              {s.cardio_cleared ? "✅ Cardio Cleared" : "☐ Cardio Cleared"}
                            </button>
                          </div>
                          {/* WhatsApp team notifications */}
                          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            {Object.entries(TEAM).map(([key, t]) => (
                              <a key={key} href={waLink(t.phone, buildWAMessage(s, t.name))} target="_blank" rel="noreferrer"
                                style={{ background: "#25D366", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                💬 {t.role}
                              </a>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, minWidth: 160 }}>
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13 }}>{s.status}</span>
                          <select value={s.status} disabled={updatingId === s.surgery_id}
                            onChange={e => updateStatus(s.surgery_id, e.target.value)}
                            style={{ padding: "8px 10px", border: "1.5px solid #dbeafe", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'Inter',sans-serif", background: "#fff", color: "#030a1e" }}>
                            <option>Scheduled</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                          </select>
                          <div style={{ fontSize: 12, color: "#aaa" }}>#{s.surgery_id}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SCHEDULE SURGERY ── */}
          {activeTab === "schedule" && (
            <div style={{ padding: 32, maxWidth: 860 }}>
              <h3 style={{ margin: "0 0 6px", color: "#030a1e", fontSize: 22, fontWeight: 900, fontFamily: "'Playfair Display',serif", letterSpacing: "-0.5px" }}>Schedule New Surgery</h3>
              <p style={{ margin: "0 0 28px", color: "#9ca3af", fontSize: 14 }}>Fill in all details. WhatsApp notifications will be available after scheduling.</p>

              <div style={{ marginBottom: 20, position: "relative" }}>
                <label style={lbl}>Patient * — Search by name or UHID</label>
                {selectedPatient ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0f9ff", border: "1.5px solid #1a73e8", borderRadius: 10, padding: "13px 16px" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: "#030a1e", fontSize: 16 }}>{selectedPatient.name}</div>
                      <div style={{ fontSize: 13, color: "#666" }}>UHID: {selectedPatient.uhid} | 📞 {selectedPatient.phone}</div>
                    </div>
                    <button onClick={() => { setSelectedPatient(null); setPatientSearch(""); setForm(f => ({ ...f, patient_id: "" })); }}
                      style={{ marginLeft: "auto", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Change</button>
                  </div>
                ) : (
                  <>
                    <input type="text" placeholder="Type name, UHID, or phone..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} style={inp} />
                    {patientResults.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1.5px solid #dbeafe", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 100, marginTop: 4 }}>
                        {patientResults.map(p => (
                          <div key={p.patient_id} onClick={() => { setSelectedPatient(p); setForm(f => ({ ...f, patient_id: String(p.patient_id) })); setPatientSearch(""); setPatientResults([]); }}
                            style={{ padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #f0f4ff", fontSize: 14 }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                            <span style={{ fontWeight: 700, color: "#030a1e" }}>{p.name}</span>
                            <span style={{ fontSize: 13, color: "#888", marginLeft: 8 }}>UHID: {p.uhid}</span>
                            <span style={{ fontSize: 13, color: "#888", marginLeft: 8 }}>📞 {p.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={lbl}>Surgery Type *</label>
                  <select value={form.surgery_type} onChange={e => setForm(f => ({ ...f, surgery_type: e.target.value }))} style={inp}>
                    <option value="">Select surgery type</option>
                    {SURGERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Surgeon *</label>
                  <select value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))} style={inp}>
                    {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Surgery Date *</label>
                  <input type="date" value={form.surgery_date} onChange={e => setForm(f => ({ ...f, surgery_date: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Surgery Time *</label>
                  <input type="time" value={form.surgery_time} onChange={e => setForm(f => ({ ...f, surgery_time: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Operation Theatre</label>
                  <select value={form.ot_number} onChange={e => setForm(f => ({ ...f, ot_number: e.target.value }))} style={inp}>
                    {OT_NUMBERS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Anaesthetist *</label>
                  <input type="text" value={form.anaesthesia_dr} onChange={e => setForm(f => ({ ...f, anaesthesia_dr: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Assistant Doctor</label>
                  <input type="text" placeholder="Optional" value={form.assistant_dr} onChange={e => setForm(f => ({ ...f, assistant_dr: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Implant (if any)</label>
                  <select value={form.implant_id} onChange={e => setForm(f => ({ ...f, implant_id: e.target.value }))} style={inp}>
                    <option value="">No implant</option>
                    {implants.map(i => (
                      <option key={i.implant_id} value={i.implant_id}>
                        {i.name} — {i.manufacturer} (Stock: {i.quantity_in_stock}) — ₹{Number(i.unit_price).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={lbl}>Notes / Instructions</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Pre-op instructions, special requirements..." rows={3}
                    style={{ ...inp, resize: "vertical" }} />
                </div>
              </div>

              {formError && <p style={{ color: "#dc2626", fontSize: 14, margin: "0 0 12px", background: "#fff1f2", padding: "10px 14px", borderRadius: 8 }}>{formError}</p>}

              <button onClick={handleSchedule} disabled={submitting}
                style={{ background: submitting ? "#94a3b8" : "linear-gradient(135deg,#0f2d6b,#1a56db)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 44px", fontSize: 16, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 6px 20px rgba(26,86,219,0.3)" }}>
                {submitting ? "Scheduling…" : "📅 Schedule Surgery"}
              </button>

              {formSuccess && scheduledSurgery && (
                <div style={{ marginTop: 28, background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: 24 }}>
                  <p style={{ color: "#16a34a", fontWeight: 700, fontSize: 15, margin: "0 0 16px" }}>{formSuccess}</p>
                  <p style={{ color: "#374151", fontSize: 14, margin: "0 0 16px" }}>📲 Send WhatsApp notifications to the surgical team:</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {Object.entries(TEAM).map(([key, t]) => (
                      <a key={key} href={waLink(t.phone, buildWAMessage(scheduledSurgery, t.name))} target="_blank" rel="noreferrer"
                        style={{ background: "#25D366", color: "#fff", textDecoration: "none", borderRadius: 12, padding: "12px 20px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                        💬 Notify {t.name}
                        <span style={{ fontSize: 12, opacity: 0.85 }}>({t.role})</span>
                      </a>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: "#888", marginTop: 12 }}>Each button opens WhatsApp with a pre-filled message. Just tap Send.</p>
                </div>
              )}
            </div>
          )}

          {/* ── INPATIENTS ── */}
          {activeTab === "inpatients" && (
            <div style={{ padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", color: "#030a1e", fontSize: 20, fontWeight: 900, fontFamily: "'Playfair Display',serif" }}>Current Inpatients</h3>
              {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#888", fontSize: 15 }}>Loading…</div>
              ) : inpatients.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🛏️</div>
                  <p style={{ fontSize: 15 }}>No patients currently admitted.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {inpatients.map(ipd => {
                    const days = getDaysSince(ipd.admit_date);
                    const linkedSurgery = surgeries.find(s => s.patient_id === ipd.patient_id && s.status !== "Completed");
                    return (
                      <div key={ipd.ipd_id} style={{ background: "#fff", border: "1.5px solid #e8eef8", borderRadius: 14, padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontWeight: 800, color: "#030a1e", fontSize: 17, marginBottom: 2 }}>{ipd.patient?.name || "—"}</div>
                            <div style={{ fontSize: 13, color: "#888" }}>UHID: {ipd.patient?.uhid || "—"}</div>
                          </div>
                          <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 8, padding: "4px 12px", fontSize: 13, fontWeight: 700 }}>ADMITTED</span>
                        </div>
                        <div style={{ fontSize: 14, color: "#555", display: "flex", flexDirection: "column", gap: 4 }}>
                          <span>🛏️ Room: <strong style={{ color: "#030a1e" }}>{ipd.room_number}</strong></span>
                          <span>📅 Admitted: {ipd.admit_date}</span>
                          <span>⏱️ Day <strong style={{ color: "#030a1e" }}>{days}</strong> of stay</span>
                          {ipd.patient?.phone && <span>📞 {ipd.patient.phone}</span>}
                        </div>
                        {linkedSurgery && (
                          <div style={{ marginTop: 12, background: "#f0f9ff", borderRadius: 10, padding: "10px 12px", border: "1px solid #bfdbfe" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", marginBottom: 4 }}>🔬 Surgery Scheduled</div>
                            <div style={{ fontSize: 14, color: "#030a1e", fontWeight: 600 }}>{linkedSurgery.surgery_type}</div>
                            <div style={{ fontSize: 13, color: "#666" }}>{linkedSurgery.surgery_date} {linkedSurgery.surgery_time ? `at ${linkedSurgery.surgery_time.slice(0, 5)}` : ""} · {linkedSurgery.ot_number}</div>
                            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {Object.entries(TEAM).map(([key, t]) => (
                                <a key={key} href={waLink(t.phone, buildWAMessage(linkedSurgery, t.name))} target="_blank" rel="noreferrer"
                                  style={{ background: "#25D366", color: "#fff", textDecoration: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                                  💬 {t.role.split(" ")[0]}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}