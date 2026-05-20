"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  "Scheduled":   { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
  "In Progress": { bg: "#fffbeb", color: "#854d0e", border: "#fde68a" },
  "Completed":   { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
  "Cancelled":   { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3" },
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
      supabase.from("surgery").select("*, patient:patient_id(name,uhid,phone), doctor:doctor_id(name), implant:implant_id(name)").order("surgery_date", { ascending: false }).order("surgery_time", { ascending: true }),
      supabase.from("patient").select("patient_id,name,uhid,phone").order("name"),
      supabase.from("doctor").select("doctor_id,name"),
      supabase.from("implant").select("*").order("name"),
      supabase.from("ipd_record").select("*, patient:patient_id(name,uhid,phone)").eq("status", "admitted").order("admit_date", { ascending: false }),
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
    setPatientResults(patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || (p.uhid || "").toLowerCase().includes(patientSearch.toLowerCase()) || (p.phone || "").includes(patientSearch)).slice(0, 6));
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
      patient_id: parseInt(form.patient_id), doctor_id: parseInt(form.doctor_id),
      surgery_date: form.surgery_date, surgery_time: form.surgery_time,
      surgery_type: form.surgery_type, ot_number: form.ot_number,
      anaesthesia_dr: form.anaesthesia_dr.trim(), assistant_dr: form.assistant_dr.trim() || null,
      implant_id: form.implant_id ? parseInt(form.implant_id) : null,
      notes: form.notes.trim() || null, status: "Scheduled",
      physio_booked: false, cardio_cleared: false,
    }).select("*, patient:patient_id(name,uhid,phone), doctor:doctor_id(name), implant:implant_id(name)").single();
    if (error) { setFormError("Failed to schedule: " + error.message); }
    else {
      setFormSuccess("Surgery scheduled! Send WhatsApp notifications below.");
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

  const scheduled     = surgeries.filter(s => s.status === "Scheduled").length;
  const inProgress    = surgeries.filter(s => s.status === "In Progress").length;
  const completed     = surgeries.filter(s => s.status === "Completed").length;
  const todaySurgeries = surgeries.filter(s => s.surgery_date === new Date().toISOString().split("T")[0]).length;

  if (authLoading || !user) return <div style={{ minHeight: "100vh", background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", color: "#0a2463" }}>Loading…</div>;

  const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid #e3e6ef", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", background: "#fff", color: "#1e293b" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.3px" };

  return (
    <div style={{ minHeight: "100vh", background: "#eef4ff", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        input,select,textarea{color:#1e293b!important;font-size:14px!important;font-family:'DM Sans',sans-serif!important;}
        input::placeholder,textarea::placeholder{color:#94a3b8!important;}
        input:focus,select:focus,textarea:focus{border-color:#0a2463!important;outline:none!important;}
        button{font-family:'DM Sans',sans-serif!important;}
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      {/* Header */}
      <div style={{ background: "#0a2463", padding: "20px 32px" }}>
        <h1 style={{ color: "#fff", margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" }}>IPD & Surgery Management</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", margin: "3px 0 0", fontSize: 13 }}>Neel Orthopaedic Hospital — Operation Theatre & Inpatient</p>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Today's Surgeries", value: todaySurgeries, border: "#93c5fd" },
            { label: "Scheduled",         value: scheduled,      border: "#93c5fd" },
            { label: "In Progress",       value: inProgress,     border: "#fcd34d" },
            { label: "Completed",         value: completed,      border: "#86efac" },
            { label: "Current Inpatients",value: inpatients.length, border: "#c4b5fd" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fafcff", borderRadius: 12, padding: "18px 20px", border: "1px solid #e3e6ef", borderLeft: `4px solid ${s.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: "#0a2463", lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs container */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e3e6ef", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e3e6ef", padding: "0 16px" }}>
            {([
              { key: "board",      label: "Surgery Board" },
              { key: "schedule",   label: "Schedule Surgery" },
              { key: "inpatients", label: `Inpatients (${inpatients.length})` },
            ] as { key: TabType; label: string }[]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ padding: "14px 20px", border: "none", background: "transparent", fontSize: 14, fontWeight: activeTab === t.key ? 700 : 500, color: activeTab === t.key ? "#0a2463" : "#94a3b8", borderBottom: activeTab === t.key ? "2px solid #0a2463" : "2px solid transparent", cursor: "pointer", marginBottom: -1, whiteSpace: "nowrap", transition: "all 0.15s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* SURGERY BOARD */}
          {activeTab === "board" && (
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <input type="text" placeholder="Search patient, UHID, surgery..." value={boardSearch} onChange={e => setBoardSearch(e.target.value)} style={{ ...inp, flex: 1, minWidth: 220 }} />
                <select value={boardFilter} onChange={e => setBoardFilter(e.target.value)} style={{ ...inp, width: "auto" }}>
                  <option value="all">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>Loading…</div>
              ) : filteredSurgeries.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔬</div>
                  <p style={{ fontSize: 14 }}>No surgeries found. Use Schedule Surgery tab to add one.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filteredSurgeries.map(s => {
                    const sc = STATUS_STYLE[s.status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
                    const isToday = s.surgery_date === new Date().toISOString().split("T")[0];
                    return (
                      <div key={s.surgery_id} style={{ background: isToday ? "#dbeafe" : "#eff6ff", border: `1px solid ${isToday ? "#93c5fd" : "#bfdbfe"}`, borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, color: "#0a2463", fontSize: 16 }}>{s.patient?.name || "—"}</span>
                            <span style={{ fontSize: 12, color: "#64748b" }}>UHID: {s.patient?.uhid || "—"}</span>
                            {isToday && <span style={{ background: "#fffbeb", color: "#854d0e", border: "1px solid #fde68a", fontSize: 11, fontWeight: 600, borderRadius: 5, padding: "2px 7px" }}>Today</span>}
                          </div>
                          <div style={{ fontSize: 15, color: "#0a2463", fontWeight: 700, marginBottom: 6 }}>{s.surgery_type}</div>
                          <div style={{ fontSize: 13, color: "#475569", display: "flex", gap: 14, flexWrap: "wrap" }}>
                            <span>📅 {s.surgery_date}</span>
                            {s.surgery_time && <span>⏰ {s.surgery_time.slice(0, 5)}</span>}
                            <span>🏠 {s.ot_number}</span>
                            <span>👨‍⚕️ {s.doctor?.name || "—"}</span>
                            {s.implant?.name && <span>🦴 {s.implant.name}</span>}
                          </div>
                          {s.anaesthesia_dr && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Anaesthetist: {s.anaesthesia_dr}</div>}
                          {s.notes && <div style={{ fontSize: 12, color: "#475569", marginTop: 4, fontStyle: "italic" }}>{s.notes}</div>}

                          {/* Physio & Cardio */}
                          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                            <button onClick={async () => { await supabase.from("surgery").update({ physio_booked: !s.physio_booked }).eq("surgery_id", s.surgery_id); fetchAll(); }}
                              style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${s.physio_booked ? "#bbf7d0" : "#cbd5e1"}`, cursor: "pointer", fontSize: 12, fontWeight: 600, background: s.physio_booked ? "#f0fdf4" : "rgba(255,255,255,0.7)", color: s.physio_booked ? "#166534" : "#475569" }}>
                              {s.physio_booked ? "✓ Physio Booked" : "Physio Booked"}
                            </button>
                            <button onClick={async () => { await supabase.from("surgery").update({ cardio_cleared: !s.cardio_cleared }).eq("surgery_id", s.surgery_id); fetchAll(); }}
                              style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${s.cardio_cleared ? "#bbf7d0" : "#cbd5e1"}`, cursor: "pointer", fontSize: 12, fontWeight: 600, background: s.cardio_cleared ? "#f0fdf4" : "rgba(255,255,255,0.7)", color: s.cardio_cleared ? "#166534" : "#475569" }}>
                              {s.cardio_cleared ? "✓ Cardio Cleared" : "Cardio Cleared"}
                            </button>
                          </div>

                          {/* WhatsApp buttons - darker, more premium */}
                          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            {Object.entries(TEAM).map(([key, t]) => (
                              <a key={key} href={waLink(t.phone, buildWAMessage(s, t.name))} target="_blank" rel="noreferrer"
                                style={{ background: "#128C7E", color: "#fff", textDecoration: "none", borderRadius: 6, padding: "5px 14px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, letterSpacing: "0.1px" }}>
                                💬 {t.role}
                              </a>
                            ))}
                          </div>
                        </div>

                        {/* Status */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, minWidth: 150 }}>
                          <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 6, padding: "4px 12px", fontWeight: 600, fontSize: 12 }}>{s.status}</span>
                          <select value={s.status} disabled={updatingId === s.surgery_id}
                            onChange={e => updateStatus(s.surgery_id, e.target.value)}
                            style={{ padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", background: "rgba(255,255,255,0.8)", color: "#1e293b" }}>
                            <option>Scheduled</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                          </select>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>#{s.surgery_id}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SCHEDULE SURGERY */}
          {activeTab === "schedule" && (
            <div style={{ padding: 32, maxWidth: 860 }}>
              <h3 style={{ margin: "0 0 4px", color: "#0a2463", fontSize: 18, fontWeight: 700 }}>Schedule New Surgery</h3>
              <p style={{ margin: "0 0 24px", color: "#94a3b8", fontSize: 13 }}>Fill in all details. WhatsApp notifications will be available after scheduling.</p>

              <div style={{ marginBottom: 18, position: "relative" }}>
                <label style={lbl}>PATIENT * — SEARCH BY NAME OR UHID</label>
                {selectedPatient ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 14px" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>{selectedPatient.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>UHID: {selectedPatient.uhid} · {selectedPatient.phone}</div>
                    </div>
                    <button onClick={() => { setSelectedPatient(null); setPatientSearch(""); setForm(f => ({ ...f, patient_id: "" })); }}
                      style={{ marginLeft: "auto", background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Change</button>
                  </div>
                ) : (
                  <>
                    <input type="text" placeholder="Type name, UHID, or phone..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} style={inp} />
                    {patientResults.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e3e6ef", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 100, marginTop: 4 }}>
                        {patientResults.map(p => (
                          <div key={p.patient_id} onClick={() => { setSelectedPatient(p); setForm(f => ({ ...f, patient_id: String(p.patient_id) })); setPatientSearch(""); setPatientResults([]); }}
                            style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f6f8fb", fontSize: 13 }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>{p.name}</span>
                            <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>UHID: {p.uhid}</span>
                            <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>{p.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div><label style={lbl}>SURGERY TYPE *</label>
                  <select value={form.surgery_type} onChange={e => setForm(f => ({ ...f, surgery_type: e.target.value }))} style={inp}>
                    <option value="">Select surgery type</option>
                    {SURGERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>SURGEON *</label>
                  <select value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))} style={inp}>
                    {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.name}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>SURGERY DATE *</label>
                  <input type="date" value={form.surgery_date} onChange={e => setForm(f => ({ ...f, surgery_date: e.target.value }))} style={inp} />
                </div>
                <div><label style={lbl}>SURGERY TIME *</label>
                  <input type="time" value={form.surgery_time} onChange={e => setForm(f => ({ ...f, surgery_time: e.target.value }))} style={inp} />
                </div>
                <div><label style={lbl}>OPERATION THEATRE</label>
                  <select value={form.ot_number} onChange={e => setForm(f => ({ ...f, ot_number: e.target.value }))} style={inp}>
                    {OT_NUMBERS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>ANAESTHETIST *</label>
                  <input type="text" value={form.anaesthesia_dr} onChange={e => setForm(f => ({ ...f, anaesthesia_dr: e.target.value }))} style={inp} />
                </div>
                <div><label style={lbl}>ASSISTANT DOCTOR</label>
                  <input type="text" placeholder="Optional" value={form.assistant_dr} onChange={e => setForm(f => ({ ...f, assistant_dr: e.target.value }))} style={inp} />
                </div>
                <div><label style={lbl}>IMPLANT (IF ANY)</label>
                  <select value={form.implant_id} onChange={e => setForm(f => ({ ...f, implant_id: e.target.value }))} style={inp}>
                    <option value="">No implant</option>
                    {implants.map(i => <option key={i.implant_id} value={i.implant_id}>{i.name} — {i.manufacturer} (Stock: {i.quantity_in_stock})</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>NOTES / INSTRUCTIONS</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Pre-op instructions, special requirements..." rows={3} style={{ ...inp, resize: "vertical" }} />
                </div>
              </div>

              {formError && <p style={{ color: "#9f1239", fontSize: 13, margin: "0 0 12px", background: "#fff1f2", border: "1px solid #fecdd3", padding: "10px 14px", borderRadius: 8 }}>{formError}</p>}

              <button onClick={handleSchedule} disabled={submitting}
                style={{ background: submitting ? "#94a3b8" : "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: "12px 36px", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Scheduling…" : "Schedule Surgery"}
              </button>

              {formSuccess && scheduledSurgery && (
                <div style={{ marginTop: 24, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 20 }}>
                  <p style={{ color: "#166534", fontWeight: 600, fontSize: 14, margin: "0 0 12px" }}>✅ {formSuccess}</p>
                  <p style={{ color: "#374151", fontSize: 13, margin: "0 0 12px" }}>Send WhatsApp notifications to the surgical team:</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {Object.entries(TEAM).map(([key, t]) => (
                      <a key={key} href={waLink(t.phone, buildWAMessage(scheduledSurgery, t.name))} target="_blank" rel="noreferrer"
                        style={{ background: "#128C7E", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        💬 Notify {t.name} <span style={{ fontSize: 11, opacity: 0.85 }}>({t.role})</span>
                      </a>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>Each button opens WhatsApp with a pre-filled message. Just tap Send.</p>
                </div>
              )}
            </div>
          )}

          {/* INPATIENTS */}
          {activeTab === "inpatients" && (
            <div style={{ padding: 24 }}>
              <h3 style={{ margin: "0 0 18px", color: "#0a2463", fontSize: 16, fontWeight: 700 }}>Current Inpatients</h3>
              {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>Loading…</div>
              ) : inpatients.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🛏️</div>
                  <p style={{ fontSize: 14 }}>No patients currently admitted.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                  {inpatients.map(ipd => {
                    const days = getDaysSince(ipd.admit_date);
                    const linkedSurgery = surgeries.find(s => s.patient_id === ipd.patient_id && s.status !== "Completed");
                    return (
                      <div key={ipd.ipd_id} style={{ background: "#fafcff", border: "1px solid #e3e6ef", borderRadius: 12, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15, marginBottom: 2 }}>{ipd.patient?.name || "—"}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>UHID: {ipd.patient?.uhid || "—"}</div>
                          </div>
                          <span style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>Admitted</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b", display: "flex", flexDirection: "column", gap: 3 }}>
                          <span>Room: <strong style={{ color: "#1e293b" }}>{ipd.room_number}</strong></span>
                          <span>Admitted: {ipd.admit_date}</span>
                          <span>Day <strong style={{ color: "#0a2463" }}>{days}</strong> of stay</span>
                          {ipd.patient?.phone && <span>{ipd.patient.phone}</span>}
                        </div>
                        {linkedSurgery && (
                          <div style={{ marginTop: 10, background: "#eff6ff", borderRadius: 8, padding: "10px 12px", border: "1px solid #bfdbfe" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e40af", marginBottom: 3 }}>Surgery Scheduled</div>
                            <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{linkedSurgery.surgery_type}</div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>{linkedSurgery.surgery_date} · {linkedSurgery.ot_number}</div>
                            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {Object.entries(TEAM).map(([key, t]) => (
                                <a key={key} href={waLink(t.phone, buildWAMessage(linkedSurgery, t.name))} target="_blank" rel="noreferrer"
                                  style={{ background: "#128C7E", color: "#fff", textDecoration: "none", borderRadius: 5, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>
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