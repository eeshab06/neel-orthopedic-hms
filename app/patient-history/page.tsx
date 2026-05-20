"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Patient { patient_id: number; name: string; uhid: string; phone: string; dob: string; address: string; }
interface HistoryRecord { record_type: string; record_date: string; description: string; doctor_name: string; status: string; }
interface Prescription { id: number; token_number: number; chief_complaints: string; clinical_findings: string; diagnosis: string; treatment: string; medication: string; physiotherapy: string; follow_up_date: string; next_visit: string; known_allergies: string; }

const TYPE_STYLE: Record<string, { bg: string; color: string; border: string; icon: string; iconBg: string }> = {
  "OPD Appointment": { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe", icon: "🏥", iconBg: "#dbeafe" },
  "Surgery":         { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe", icon: "🔬", iconBg: "#ede9fe" },
  "IPD Admission":   { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", icon: "🛏️", iconBg: "#dcfce7" },
};

export default function PatientHistoryPage() {
  const { user, loading: authLoading, signOut } = useAuth("/patient-history");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [expandedPrescriptions, setExpandedPrescriptions] = useState<Record<number, Prescription | null>>({});
  const [prescriptionLoading, setPrescriptionLoading] = useState<Record<number, boolean>>({});

  const searchPatients = async (val?: string) => {
    const q = val ?? search;
    if (q.trim().length < 2) return;
    setLoading(true);
    const { data } = await supabase.from("patient").select("patient_id, name, uhid, phone, dob, address")
      .or(`name.ilike.%${q}%,uhid.ilike.%${q}%,phone.ilike.%${q}%`).limit(10);
    if (data) setSearchResults(data as Patient[]);
    setLoading(false);
  };

  const loadHistory = async (patient: Patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    setHistory([]);
    setExpandedPrescriptions({});
    const { data } = await supabase.rpc("get_patient_history", { p_patient_id: patient.patient_id });
    if (data) {
      const sorted = [...data].sort((a: HistoryRecord, b: HistoryRecord) =>
        new Date(b.record_date).getTime() - new Date(a.record_date).getTime());
      setHistory(sorted);
    }
    setHistoryLoading(false);
  };

  const togglePrescription = async (idx: number, description: string) => {
    if (expandedPrescriptions[idx] !== undefined) {
      setExpandedPrescriptions(prev => { const n = { ...prev }; delete n[idx]; return n; });
      return;
    }
    setPrescriptionLoading(prev => ({ ...prev, [idx]: true }));
    const { data } = await supabase
      .from("opd_prescription")
      .select("*")
      .ilike("patient_name", selectedPatient!.name)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    setExpandedPrescriptions(prev => ({ ...prev, [idx]: data as Prescription || null }));
    setPrescriptionLoading(prev => ({ ...prev, [idx]: false }));
  };

  const calcAge = (dob: string) => {
    if (!dob) return "—";
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365));
  };

  const filteredHistory = history.filter(h => filterType === "all" || h.record_type === filterType);
  const opdCount = history.filter(h => h.record_type === "OPD Appointment").length;
  const surgeryCount = history.filter(h => h.record_type === "Surgery").length;
  const ipdCount = history.filter(h => h.record_type === "IPD Admission").length;

  if (authLoading || !user) return (
    <div style={{ minHeight:"100vh", background:"#eef4ff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", color:"#0a2463" }}>Loading…</div>
  );

  const inp: React.CSSProperties = { width:"100%", padding:"10px 16px", border:"1px solid #e3e6ef", borderRadius:8, fontSize:14, outline:"none", color:"#1e293b", background:"white", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"100vh", background:"#eef4ff", fontFamily:"'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input, select { color: #1e293b !important; font-size: 14px !important; font-family: 'DM Sans', sans-serif !important; }
        input::placeholder { color: #94a3b8 !important; }
        input:focus { border-color: #0a2463 !important; outline: none !important; }
        button { font-family: 'DM Sans', sans-serif !important; }
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      <div style={{ maxWidth:1300, margin:"0 auto", padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ margin:0, color:"#0a2463", fontSize:26, fontWeight:700, letterSpacing:"-0.5px" }}>Patient History</h1>
          <p style={{ margin:"4px 0 0", color:"#94a3b8", fontSize:13 }}>Full medical record — Neel Orthopaedic Multispeciality Hospital</p>
        </div>

        {/* Search */}
        <div style={{ background:"white", borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", marginBottom:20, border:"1px solid #e3e6ef" }}>
          <h3 style={{ margin:"0 0 16px", color:"#0a2463", fontSize:15, fontWeight:700 }}>Search Patient</h3>
          <div style={{ display:"flex", gap:10 }}>
            <input type="text" placeholder="Search by name or phone number..." value={search}
              onChange={e => { setSearch(e.target.value); searchPatients(e.target.value); }}
              onKeyDown={e => e.key === "Enter" && searchPatients()}
              style={inp} />
            <button onClick={() => searchPatients()} disabled={loading}
              style={{ background:loading?"#94a3b8":"#0a2463", color:"white", border:"none", borderRadius:8, padding:"10px 24px", fontSize:14, cursor:loading?"not-allowed":"pointer", fontWeight:600, whiteSpace:"nowrap" }}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ marginTop:12, border:"1px solid #e3e6ef", borderRadius:10, overflow:"hidden" }}>
              {searchResults.map((p, idx) => (
                <div key={p.patient_id}
                  onClick={() => { loadHistory(p); setSearchResults([]); setSearch(""); }}
                  style={{ padding:"12px 16px", cursor:"pointer", background:idx%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = idx%2===0?"#fff":"#f8fafc")}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:36, height:36, background:"#0a2463", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:15, flexShrink:0 }}>{p.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight:600, color:"#1e293b", fontSize:14 }}>{p.name}</div>
                      <div style={{ color:"#94a3b8", fontSize:12, marginTop:2 }}>UHID: {p.uhid || "—"} · {p.phone}</div>
                    </div>
                  </div>
                  <span style={{ color:"#1e40af", fontSize:13, fontWeight:600 }}>View →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPatient && (<>

          {/* Patient card */}
          <div style={{ background:"white", borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", marginBottom:16, border:"1px solid #e3e6ef" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:52, height:52, background:"#0a2463", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:22, flexShrink:0 }}>{selectedPatient.name.charAt(0).toUpperCase()}</div>
                <div>
                  <h2 style={{ margin:"0 0 6px", color:"#0a2463", fontSize:20, fontWeight:700 }}>{selectedPatient.name}</h2>
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap", fontSize:13, color:"#64748b" }}>
                    <span>UHID: <strong style={{ color:"#1e293b" }}>{selectedPatient.uhid || "—"}</strong></span>
                    <span><strong style={{ color:"#1e293b" }}>{selectedPatient.phone}</strong></span>
                    <span>Age: <strong style={{ color:"#1e293b" }}>{calcAge(selectedPatient.dob)} yrs</strong></span>
                    {selectedPatient.address && <span>{selectedPatient.address}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {[
                  { label:"OPD Visits", value:opdCount, border:"#93c5fd" },
                  { label:"Surgeries", value:surgeryCount, border:"#c4b5fd" },
                  { label:"IPD Stays", value:ipdCount, border:"#86efac" },
                ].map(s => (
                  <div key={s.label} style={{ background:"#dbeafe", borderRadius:10, padding:"14px 20px", textAlign:"center", border:"1px solid #bfdbfe", borderLeft:`4px solid ${s.border}` }}>
                    <div style={{ fontSize:28, fontWeight:700, color:"#0a2463", lineHeight:1, marginBottom:4 }}>{s.value}</div>
                    <div style={{ fontSize:11, color:"#475569", fontWeight:500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medical history */}
          <div style={{ background:"white", borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", border:"1px solid #e3e6ef" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <h3 style={{ margin:0, color:"#0a2463", fontSize:16, fontWeight:700 }}>Medical History</h3>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {[{key:"all",label:`All (${history.length})`},{key:"OPD Appointment",label:`OPD (${opdCount})`},{key:"Surgery",label:`Surgery (${surgeryCount})`},{key:"IPD Admission",label:`IPD (${ipdCount})`}].map(f => (
                  <button key={f.key} onClick={() => setFilterType(f.key)}
                    style={{ padding:"7px 14px", borderRadius:7, border:`1px solid ${filterType===f.key?"#0a2463":"#e3e6ef"}`, background:filterType===f.key?"#0a2463":"white", color:filterType===f.key?"white":"#64748b", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {historyLoading ? (
              <div style={{ textAlign:"center", padding:60, color:"#94a3b8", fontSize:14 }}>Loading history…</div>
            ) : filteredHistory.length === 0 ? (
              <div style={{ textAlign:"center", padding:60 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
                <div style={{ color:"#1e293b", fontSize:16, fontWeight:600, marginBottom:6 }}>No records found</div>
                <p style={{ color:"#94a3b8", fontSize:13 }}>No medical history available for this filter.</p>
              </div>
            ) : (
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:18, top:0, bottom:0, width:2, background:"#e3e6ef" }} />
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {filteredHistory.map((h, idx) => {
                    const ts = TYPE_STYLE[h.record_type] || { bg:"#f8fafc", color:"#475569", border:"#e3e6ef", icon:"📋", iconBg:"#f1f5f9" };
                    const isExpanded = expandedPrescriptions[idx] !== undefined;
                    const prescription = expandedPrescriptions[idx];
                    return (
                      <div key={idx} style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                        <div style={{ width:38, height:38, borderRadius:"50%", background:ts.iconBg, border:`2px solid ${ts.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, zIndex:1 }}>{ts.icon}</div>
                        <div style={{ flex:1, background:ts.bg, borderRadius:12, padding:"16px 18px", border:`1px solid ${ts.border}` }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, marginBottom:6 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                              <span style={{ background:ts.color, color:"white", borderRadius:5, padding:"2px 8px", fontSize:10, fontWeight:700, letterSpacing:"0.5px" }}>{h.record_type.toUpperCase()}</span>
                              <span style={{ fontWeight:700, color:"#1e293b", fontSize:14 }}>{h.description}</span>
                            </div>
                            <span style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>{new Date(h.record_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                          </div>
                          <div style={{ fontSize:13, color:"#64748b", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                            <span>{h.doctor_name}</span>
                            <span style={{ background:"white", borderRadius:5, padding:"2px 8px", fontSize:11, fontWeight:600, color:"#64748b", border:"1px solid #e3e6ef" }}>{h.status}</span>
                          </div>

                          {h.record_type === "OPD Appointment" && (
                            <div style={{ marginTop:10 }}>
                              <button onClick={() => togglePrescription(idx, h.description)}
                                style={{ background:"white", border:`1px solid ${ts.border}`, borderRadius:7, padding:"6px 14px", fontSize:12, fontWeight:600, color:ts.color, cursor:"pointer" }}>
                                {prescriptionLoading[idx] ? "Loading…" : isExpanded ? "▲ Hide Prescription" : "▼ View Prescription"}
                              </button>

                              {isExpanded && (
                                <div style={{ marginTop:12, background:"white", borderRadius:10, padding:"18px 20px", border:`1px solid ${ts.border}` }}>
                                  {!prescription ? (
                                    <p style={{ color:"#94a3b8", fontSize:13, margin:0 }}>No prescription found for this visit.</p>
                                  ) : (
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                      {[
                                        { label:"Chief Complaints", value: prescription.chief_complaints },
                                        { label:"Known Allergies", value: prescription.known_allergies },
                                        { label:"Clinical Findings", value: prescription.clinical_findings },
                                        { label:"Diagnosis", value: prescription.diagnosis },
                                        { label:"Treatment", value: prescription.treatment },
                                        { label:"Medication", value: prescription.medication },
                                        { label:"Physiotherapy", value: prescription.physiotherapy },
                                        { label:"Follow-up Date", value: prescription.follow_up_date },
                                        { label:"Next Visit", value: prescription.next_visit },
                                      ].filter(f => f.value).map(f => (
                                        <div key={f.label} style={{ gridColumn: ["Chief Complaints","Clinical Findings","Treatment","Medication"].includes(f.label) ? "1 / -1" : "auto" }}>
                                          <div style={{ fontSize:10, fontWeight:700, color:"#1e40af", letterSpacing:"1px", marginBottom:3 }}>{f.label.toUpperCase()}</div>
                                          <div style={{ fontSize:13, color:"#1e293b", fontWeight:500, lineHeight:1.6 }}>{f.value}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>)}

        {!selectedPatient && searchResults.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ width:64, height:64, background:"#0a2463", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 20px" }}>👤</div>
            <div style={{ color:"#0a2463", fontSize:20, fontWeight:700, marginBottom:8 }}>Search for a Patient</div>
            <p style={{ fontSize:14, color:"#94a3b8", maxWidth:"360px", margin:"0 auto" }}>Enter a name, UHID, or phone number above to view their complete medical history.</p>
          </div>
        )}
      </div>
    </div>
  );
}