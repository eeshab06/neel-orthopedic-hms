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

const TYPE_STYLE: Record<string, { bg: string; color: string; icon: string; grad: string }> = {
  "OPD Appointment": { bg: "#dbeafe", color: "#1e40af", icon: "🏥", grad: "linear-gradient(135deg,#0f2d6b,#1a56db)" },
  "Surgery":         { bg: "#ede9fe", color: "#6d28d9", icon: "🔬", grad: "linear-gradient(135deg,#1e1b4b,#7c3aed)" },
  "IPD Admission":   { bg: "#dcfce7", color: "#16a34a", icon: "🛏️", grad: "linear-gradient(135deg,#064e3b,#10b981)" },
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

  const searchPatients = async () => {
    if (search.trim().length < 2) return;
    setLoading(true);
    const { data } = await supabase.from("patient").select("patient_id, name, uhid, phone, dob, address")
      .or(`name.ilike.%${search}%,uhid.ilike.%${search}%,phone.ilike.%${search}%`).limit(10);
    if (data) setSearchResults(data as Patient[]);
    setLoading(false);
  };

  const loadHistory = async (patient: Patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    setHistory([]);
    const { data } = await supabase.rpc("get_patient_history", { p_patient_id: patient.patient_id });
    if (data) {
      const sorted = [...data].sort((a: HistoryRecord, b: HistoryRecord) =>
        new Date(b.record_date).getTime() - new Date(a.record_date).getTime());
      setHistory(sorted);
    }
    setHistoryLoading(false);
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
    <div style={{ minHeight:"100vh", background:"#f0f4ff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", color:"#0a2463", fontSize:18 }}>Loading…</div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4ff", fontFamily:"'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        input, select { color: #030a1e !important; font-size: 15px !important; font-family: 'Inter', sans-serif !important; }
        input::placeholder { color: #9ca3af !important; }
        input:focus { border-color: #1a56db !important; outline: none !important; box-shadow: 0 0 0 3px rgba(26,86,219,0.08) !important; }
        button { font-family: 'Inter', sans-serif !important; }
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ margin:0, color:"#030a1e", fontSize:30, fontWeight:900, fontFamily:"'Playfair Display', serif", letterSpacing:"-0.5px" }}>Patient History</h1>
          <p style={{ margin:"6px 0 0", color:"#9ca3af", fontSize:15 }}>Full medical record — Neel Orthopaedic Multispeciality Hospital</p>
        </div>

        <div style={{ background:"white", borderRadius:20, padding:32, boxShadow:"0 2px 14px rgba(10,36,99,0.07)", marginBottom:24, border:"1px solid #e8edf5" }}>
          <h3 style={{ margin:"0 0 20px", color:"#030a1e", fontSize:20, fontWeight:900, fontFamily:"'Playfair Display', serif" }}>Search Patient</h3>
          <div style={{ display:"flex", gap:12 }}>
            <input type="text" placeholder="Search by name, UHID, or phone number..." value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && searchPatients()}
              style={{ flex:1, padding:"13px 18px", border:"1.5px solid #e0e7ff", borderRadius:12, fontSize:15, outline:"none", color:"#030a1e", background:"#fafbff" }} />
            <button onClick={searchPatients} disabled={loading}
              style={{ background:loading?"#e5e7eb":"linear-gradient(135deg,#0f2d6b,#1a56db)", color:loading?"#9ca3af":"white", border:"none", borderRadius:12, padding:"13px 32px", fontSize:15, cursor:loading?"not-allowed":"pointer", fontWeight:700, boxShadow:loading?"none":"0 4px 16px rgba(26,86,219,0.3)", transition:"all 0.2s" }}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ marginTop:16, border:"1.5px solid #e0e7ff", borderRadius:14, overflow:"hidden" }}>
              {searchResults.map((p, idx) => (
                <div key={p.patient_id}
                  onClick={() => { loadHistory(p); setSearchResults([]); setSearch(""); }}
                  style={{ padding:"15px 20px", cursor:"pointer", background:idx%2===0?"#fff":"#fafbff", borderBottom:"1px solid #f0f4ff", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = idx%2===0?"#fff":"#fafbff")}>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{ width:38, height:38, background:"linear-gradient(135deg,#0f2d6b,#1a56db)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:16, flexShrink:0 }}>{p.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight:700, color:"#030a1e", fontSize:16 }}>{p.name}</div>
                      <div style={{ color:"#9ca3af", fontSize:13, marginTop:2 }}>UHID: {p.uhid || "—"} · 📞 {p.phone}</div>
                    </div>
                  </div>
                  <span style={{ color:"#1a56db", fontSize:14, fontWeight:700 }}>View History →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPatient && (<>
          <div style={{ background:"white", borderRadius:20, padding:28, boxShadow:"0 2px 14px rgba(10,36,99,0.07)", marginBottom:20, border:"1px solid #e8edf5" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:18 }}>
                <div style={{ width:60, height:60, background:"linear-gradient(135deg,#0f2d6b,#1a56db)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:900, fontSize:26, fontFamily:"'Playfair Display',serif", flexShrink:0, boxShadow:"0 6px 18px rgba(26,86,219,0.3)" }}>{selectedPatient.name.charAt(0)}</div>
                <div>
                  <h2 style={{ margin:"0 0 8px", color:"#030a1e", fontSize:26, fontWeight:900, fontFamily:"'Playfair Display', serif", letterSpacing:"-0.5px" }}>{selectedPatient.name}</h2>
                  <div style={{ display:"flex", gap:20, flexWrap:"wrap", fontSize:14, color:"#6b7280" }}>
                    <span>🪪 UHID: <strong style={{ color:"#030a1e" }}>{selectedPatient.uhid || "—"}</strong></span>
                    <span>📞 <strong style={{ color:"#030a1e" }}>{selectedPatient.phone}</strong></span>
                    <span>🎂 Age: <strong style={{ color:"#030a1e" }}>{calcAge(selectedPatient.dob)} yrs</strong></span>
                    {selectedPatient.address && <span>📍 {selectedPatient.address}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:12 }}>
                {[
                  { label:"OPD Visits", value:opdCount, grad:"linear-gradient(135deg,#0f2d6b,#1a56db)", shadow:"rgba(26,86,219,0.25)" },
                  { label:"Surgeries", value:surgeryCount, grad:"linear-gradient(135deg,#1e1b4b,#7c3aed)", shadow:"rgba(124,58,237,0.25)" },
                  { label:"IPD Stays", value:ipdCount, grad:"linear-gradient(135deg,#064e3b,#10b981)", shadow:"rgba(16,185,129,0.25)" },
                ].map(s => (
                  <div key={s.label} style={{ background:s.grad, borderRadius:14, padding:"16px 24px", textAlign:"center", boxShadow:`0 4px 14px ${s.shadow}`, color:"white" }}>
                    <div style={{ fontSize:32, fontWeight:900, fontFamily:"'Playfair Display',serif", letterSpacing:"-1px", lineHeight:1, marginBottom:6 }}>{s.value}</div>
                    <div style={{ fontSize:12, opacity:0.8, fontWeight:600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background:"white", borderRadius:20, padding:32, boxShadow:"0 2px 14px rgba(10,36,99,0.07)", border:"1px solid #e8edf5" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
              <h3 style={{ margin:0, color:"#030a1e", fontSize:22, fontWeight:900, fontFamily:"'Playfair Display',serif" }}>Medical History</h3>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[{key:"all",label:`All (${history.length})`},{key:"OPD Appointment",label:`OPD (${opdCount})`},{key:"Surgery",label:`Surgery (${surgeryCount})`},{key:"IPD Admission",label:`IPD (${ipdCount})`}].map(f => (
                  <button key={f.key} onClick={() => setFilterType(f.key)}
                    style={{ padding:"9px 18px", borderRadius:10, border:"none", background:filterType===f.key?"linear-gradient(135deg,#0f2d6b,#1a56db)":"#f0f4ff", color:filterType===f.key?"white":"#030a1e", fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.2s", boxShadow:filterType===f.key?"0 3px 10px rgba(26,86,219,0.25)":"none" }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {historyLoading ? (
              <div style={{ textAlign:"center", padding:70, color:"#9ca3af", fontSize:16 }}>Loading history…</div>
            ) : filteredHistory.length === 0 ? (
              <div style={{ textAlign:"center", padding:70 }}>
                <div style={{ fontSize:52, marginBottom:16 }}>📋</div>
                <div style={{ color:"#030a1e", fontSize:20, fontWeight:800, fontFamily:"'Playfair Display',serif", marginBottom:8 }}>No records found</div>
                <p style={{ color:"#9ca3af", fontSize:15 }}>No medical history available for this filter.</p>
              </div>
            ) : (
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:20, top:0, bottom:0, width:2, background:"linear-gradient(to bottom, #e0e7ff, #c7d2fe)" }} />
                <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                  {filteredHistory.map((h, idx) => {
                    const ts = TYPE_STYLE[h.record_type] || { bg:"#f1f5f9", color:"#475569", icon:"📋", grad:"#475569" };
                    return (
                      <div key={idx} style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
                        <div style={{ width:42, height:42, borderRadius:"50%", background:ts.grad, border:"3px solid white", boxShadow:"0 3px 12px rgba(0,0,0,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, zIndex:1 }}>{ts.icon}</div>
                        <div style={{ flex:1, background:ts.bg, borderRadius:14, padding:"18px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10, marginBottom:8 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                              <span style={{ background:ts.color, color:"white", borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:800, letterSpacing:"0.5px" }}>{h.record_type.toUpperCase()}</span>
                              <span style={{ fontWeight:700, color:"#030a1e", fontSize:16 }}>{h.description}</span>
                            </div>
                            <span style={{ fontSize:13, color:"#6b7280", fontWeight:600, whiteSpace:"nowrap" }}>📅 {new Date(h.record_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                          </div>
                          <div style={{ fontSize:14, color:"#6b7280", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                            <span>👨‍⚕️ {h.doctor_name}</span>
                            <span style={{ background:"white", borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:600, color:"#6b7280", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>{h.status}</span>
                          </div>
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
            <div style={{ width:80, height:80, background:"linear-gradient(135deg,#0f2d6b,#1a56db)", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 24px", boxShadow:"0 8px 24px rgba(26,86,219,0.3)" }}>👤</div>
            <div style={{ color:"#030a1e", fontSize:24, fontWeight:900, marginBottom:10, fontFamily:"'Playfair Display',serif" }}>Search for a Patient</div>
            <p style={{ fontSize:16, color:"#9ca3af", maxWidth:"400px", margin:"0 auto" }}>Enter a name, UHID, or phone number above to view their complete medical history.</p>
          </div>
        )}
      </div>
    </div>
  );
}