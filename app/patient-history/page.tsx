"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Patient {
  patient_id: number;
  name: string;
  uhid: string;
  phone: string;
  dob: string;
  address: string;
}

interface HistoryRecord {
  record_type: string;
  record_date: string;
  description: string;
  doctor_name: string;
  status: string;
}

const TYPE_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  "OPD Appointment": { bg: "#dbeafe", color: "#1e40af", icon: "🏥" },
  "Surgery":         { bg: "#ede9fe", color: "#6d28d9", icon: "🔬" },
  "IPD Admission":   { bg: "#dcfce7", color: "#16a34a", icon: "🛏️" },
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
    const { data } = await supabase
      .from("patient")
      .select("patient_id, name, uhid, phone, dob, address")
      .or(`name.ilike.%${search}%,uhid.ilike.%${search}%,phone.ilike.%${search}%`)
      .limit(10);
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
        new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
      );
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

  if (authLoading || !user) {
    return <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", color: "#0a2463" }}>Loading…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>
      <StaffNavbar user={user} onSignOut={signOut} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, color: "#0a2463", fontSize: 22, fontWeight: 700 }}>👤 Patient History</h1>
          <p style={{ margin: "2px 0 0", color: "#888", fontSize: 13 }}>Full Patient Medical Record — Neel Orthopaedic Hospital</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(10,36,99,0.07)", marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", color: "#0a2463", fontSize: 16 }}>Search Patient</h3>
          <div style={{ display: "flex", gap: 12 }}>
            <input type="text" placeholder="Search by name, UHID, or phone number..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchPatients()}
              style={{ flex: 1, padding: "11px 16px", border: "1.5px solid #dbeafe", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "Georgia, serif" }} />
            <button onClick={searchPatients} disabled={loading}
              style={{ background: "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: "11px 28px", fontSize: 14, cursor: loading ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", fontWeight: 600 }}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ marginTop: 16, border: "1px solid #dbeafe", borderRadius: 8, overflow: "hidden" }}>
              {searchResults.map((p, idx) => (
                <div key={p.patient_id}
                  onClick={() => { loadHistory(p); setSearchResults([]); setSearch(""); }}
                  style={{ padding: "12px 16px", cursor: "pointer", background: idx % 2 === 0 ? "#fff" : "#f8faff", borderBottom: "1px solid #f0f4ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f8faff")}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#0a2463", fontSize: 14 }}>{p.name}</span>
                    <span style={{ color: "#888", fontSize: 13, marginLeft: 12 }}>UHID: {p.uhid || "—"}</span>
                    <span style={{ color: "#888", fontSize: 13, marginLeft: 12 }}>📞 {p.phone}</span>
                  </div>
                  <span style={{ color: "#1a73e8", fontSize: 12, fontWeight: 600 }}>View History →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPatient && (
          <>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(10,36,99,0.07)", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h2 style={{ margin: "0 0 8px", color: "#0a2463", fontSize: 22 }}>{selectedPatient.name}</h2>
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13, color: "#555" }}>
                    <span>🪪 UHID: <strong>{selectedPatient.uhid || "—"}</strong></span>
                    <span>📞 {selectedPatient.phone}</span>
                    <span>🎂 Age: <strong>{calcAge(selectedPatient.dob)} yrs</strong></span>
                    {selectedPatient.address && <span>📍 {selectedPatient.address}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { label: "OPD Visits", value: opdCount, color: "#1e40af", bg: "#dbeafe" },
                    { label: "Surgeries", value: surgeryCount, color: "#6d28d9", bg: "#ede9fe" },
                    { label: "IPD Stays", value: ipdCount, color: "#16a34a", bg: "#dcfce7" },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(10,36,99,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ margin: 0, color: "#0a2463", fontSize: 18 }}>Medical History</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { key: "all", label: `All (${history.length})` },
                    { key: "OPD Appointment", label: `OPD (${opdCount})` },
                    { key: "Surgery", label: `Surgery (${surgeryCount})` },
                    { key: "IPD Admission", label: `IPD (${ipdCount})` },
                  ].map(f => (
                    <button key={f.key} onClick={() => setFilterType(f.key)}
                      style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: filterType === f.key ? "#0a2463" : "#f0f4ff", color: filterType === f.key ? "#fff" : "#0a2463", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {historyLoading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#888" }}>Loading history…</div>
              ) : filteredHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  <p>No records found.</p>
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 19, top: 0, bottom: 0, width: 2, background: "#e8eef8" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {filteredHistory.map((h, idx) => {
                      const ts = TYPE_STYLE[h.record_type] || { bg: "#f1f5f9", color: "#333", icon: "📋" };
                      return (
                        <div key={idx} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: ts.bg, border: `3px solid ${ts.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, zIndex: 1 }}>
                            {ts.icon}
                          </div>
                          <div style={{ flex: 1, background: ts.bg, borderRadius: 10, padding: "14px 18px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                              <div>
                                <span style={{ background: ts.color, color: "#fff", borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 700, marginRight: 8 }}>{h.record_type.toUpperCase()}</span>
                                <span style={{ fontWeight: 700, color: "#0a2463", fontSize: 14 }}>{h.description}</span>
                              </div>
                              <span style={{ fontSize: 12, color: "#666" }}>📅 {new Date(h.record_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                            <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
                              👨‍⚕️ {h.doctor_name}
                              <span style={{ marginLeft: 12, background: "#fff", borderRadius: 5, padding: "2px 8px", fontSize: 11, color: "#666" }}>{h.status}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!selectedPatient && searchResults.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
            <p style={{ fontSize: 16, color: "#888" }}>Search for a patient by name, UHID, or phone number.</p>
          </div>
        )}
      </div>
    </div>
  );
}