"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

interface Token {
  appt_id: number;
  token_number: number;
  status: string;
  patient: { name: string; phone: string; dob: string };
}

interface Enquiry {
  id: number;
  name: string;
  phone: string;
  message: string;
  created_at: string;
  responded: boolean;
}

function formatIST(utcString: string) {
  const normalized = utcString.replace(" ", "T").split(".")[0] + "+00:00";
  const date = new Date(normalized);
  const day = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric" });
  const month = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", month: "short" });
  const year = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric" });
  const time = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
  return `${day} ${month} ${year}, ${time}`;
}

export default function ReceptionForm() {
  const { user, loading: authLoading, signOut } = useAuth("/reception");
  const [activeTab, setActiveTab] = useState<"queue" | "enquiries">("queue");

  // Queue state
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    patient_name: "", age: "", sex: "Male",
    known_allergies: "", chief_complaints: "",
  });

  // Enquiries state
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [filterResponded, setFilterResponded] = useState<"all" | "pending" | "responded">("all");
  const [markingId, setMarkingId] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];

  // Fetch queue — client-side today filter fix
  useEffect(() => {
    if (!user) return;
    const fetchTokens = async () => {
      const { data } = await supabase
        .from("appointment")
        .select(`appt_id, token_number, status, patient:patient_id (name, phone, dob), slot:slot_id (slot_date)`)
        .eq("status", "booked")
        .order("token_number", { ascending: true });
      // Filter today client-side
      const todayData = (data || []).filter((a: any) => (a.slot as any)?.slot_date === today);
      setTokens(todayData as any);
      setLoading(false);
    };
    fetchTokens();
    const channel = supabase.channel("appointments_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment" }, fetchTokens)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Fetch enquiries
  useEffect(() => {
    if (!user || activeTab !== "enquiries") return;
    fetchEnquiries();
  }, [user, activeTab]);

  const fetchEnquiries = async () => {
    setEnquiriesLoading(true);
    const { data } = await supabase
      .from("contact_enquiry")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setEnquiries(data as Enquiry[]);
    setEnquiriesLoading(false);
  };

  const markResponded = async (id: number, current: boolean) => {
    setMarkingId(id);
    await supabase.from("contact_enquiry").update({ responded: !current }).eq("id", id);
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, responded: !current } : e));
    setMarkingId(null);
  };

  const calcAge = (dob: string) => {
    if (!dob) return "";
    return String(Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365)));
  };

  const selectToken = (token: Token) => {
    setSelectedToken(token);
    setSaved(false);
    const patient = token.patient as any;
    setForm({ patient_name: patient?.name || "", age: calcAge(patient?.dob) || "", sex: "Male", known_allergies: "", chief_complaints: "" });
  };

  const handleSave = async () => {
    if (!selectedToken || !form.chief_complaints) return;
    setSaving(true);
    const { data: existing } = await supabase.from("opd_prescription").select("id").eq("token_number", selectedToken.token_number).single();
    if (existing) {
      await supabase.from("opd_prescription").update({
        patient_name: form.patient_name, age: parseInt(form.age), sex: form.sex,
        known_allergies: form.known_allergies, chief_complaints: form.chief_complaints,
        filled_by_reception: true, date: today, doctor_id: 5,
      }).eq("id", existing.id);
    } else {
      await supabase.from("opd_prescription").insert({
        token_number: selectedToken.token_number, patient_name: form.patient_name,
        age: parseInt(form.age), sex: form.sex, known_allergies: form.known_allergies,
        chief_complaints: form.chief_complaints, filled_by_reception: true, date: today, doctor_id: 5,
      });
    }
    setSaved(true);
    setSaving(false);
  };

  const filtered = tokens.filter(t =>
    String(t.token_number).includes(search) ||
    (t.patient as any)?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEnquiries = enquiries.filter(e => {
    if (filterResponded === "pending") return !e.responded;
    if (filterResponded === "responded") return e.responded;
    return true;
  });

  const pendingCount = enquiries.filter(e => !e.responded).length;

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    border: "1.5px solid #e0e7ff", fontSize: "16px",
    fontFamily: "Georgia, serif", boxSizing: "border-box",
    color: "#030a1e", background: "white",
  };

  if (authLoading || !user) {
    return <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", color: "#0a2463" }}>Loading…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>
      <style>{`
        input, textarea, select { color: #030a1e !important; font-size: 16px !important; }
        input::placeholder, textarea::placeholder { color: #9ca3af !important; }
        input:focus, textarea:focus, select:focus { border-color: #1a56db !important; outline: none; }
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      {/* ── TABS ── */}
      <div style={{ background: "white", borderBottom: "2px solid #e0e7ff", padding: "0 5%" }}>
        <div style={{ display: "flex", gap: "0" }}>
          {[
            { key: "queue", label: "🏥 OPD Queue", badge: tokens.length },
            { key: "enquiries", label: "📩 Enquiries", badge: pendingCount },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: "16px 28px", border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: "700",
                color: activeTab === tab.key ? "#0a2463" : "#9ca3af",
                borderBottom: activeTab === tab.key ? "3px solid #0a2463" : "3px solid transparent",
                display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s",
              }}>
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  background: tab.key === "enquiries" && pendingCount > 0 ? "#dc2626" : "#0a2463",
                  color: "white", borderRadius: "20px", padding: "2px 8px",
                  fontSize: "11px", fontWeight: "700",
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── OPD QUEUE TAB ── */}
      {activeTab === "queue" && (
        <div style={{ padding: "24px 5%", display: "grid", gridTemplateColumns: "320px", gap: "24px" }}>
          {/* Token list */}
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
            <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "18px", marginBottom: "16px" }}>Today's Queue</div>
            <input placeholder="Search by token or name..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inp, marginBottom: "12px" }} />
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#999", fontSize: "14px" }}>No patients waiting</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "600px", overflowY: "auto" }}>
                {filtered.map(t => (
                  <div key={t.appt_id} onClick={() => window.location.href = `/prescription?token=${t.token_number}`}
                    style={{ padding: "12px 16px", borderRadius: "10px", cursor: "pointer", background: selectedToken?.appt_id === t.appt_id ? "#0a2463" : "#f8f9fc", border: selectedToken?.appt_id === t.appt_id ? "2px solid #0a2463" : "1.5px solid #e8edf5" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0, background: selectedToken?.appt_id === t.appt_id ? "rgba(255,255,255,0.2)" : t.token_number >= 145 ? "#f59e0b" : "#0a2463", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "14px" }}>{t.token_number}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ fontWeight: "600", fontSize: "14px", color: selectedToken?.appt_id === t.appt_id ? "white" : "#0a2463" }}>{(t.patient as any)?.name}</div>
                          {t.token_number >= 145 && (
                            <span style={{ background: selectedToken?.appt_id === t.appt_id ? "rgba(245,158,11,0.3)" : "#fef3c7", color: selectedToken?.appt_id === t.appt_id ? "#fde68a" : "#d97706", fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "6px", letterSpacing: "0.5px" }}>WALK-IN</span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: selectedToken?.appt_id === t.appt_id ? "rgba(255,255,255,0.7)" : "#888" }}>{(t.patient as any)?.phone}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form panel */}
          <div>
            {!selectedToken ? (
              <div style={{ background: "white", borderRadius: "16px", padding: "60px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>👈</div>
                <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "18px", marginBottom: "8px" }}>Select a patient from the queue</div>
                <div style={{ color: "#888", fontSize: "14px" }}>Click on a token number to fill in their details before they enter the cabin</div>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", paddingBottom: "20px", borderBottom: "2px solid #f0f4ff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "52px", height: "52px", background: "#0a2463", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "20px" }}>{selectedToken.token_number}</div>
                    <div>
                      <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "18px" }}>{(selectedToken.patient as any)?.name}</div>
                      <div style={{ color: "#888", fontSize: "13px" }}>{(selectedToken.patient as any)?.phone}</div>
                    </div>
                  </div>
                  {saved && <div style={{ background: "#dcfce7", color: "#16a34a", padding: "8px 16px", borderRadius: "20px", fontWeight: "700", fontSize: "14px" }}>✓ Sent to Doctor</div>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Patient Name</label>
                    <input value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })} style={inp} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Age (years)</label>
                    <input value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} type="number" placeholder="Age" style={inp} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Sex</label>
                    <select value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })} style={inp}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#dc2626", marginBottom: "6px" }}>⚠️ Known Allergies</label>
                  <input value={form.known_allergies} onChange={e => setForm({ ...form, known_allergies: e.target.value })}
                    placeholder="None / list any known allergies"
                    style={{ ...inp, border: "1.5px solid #fca5a5" }} />
                </div>
                <div style={{ marginBottom: "28px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Chief Complaints *</label>
                  <textarea value={form.chief_complaints} onChange={e => setForm({ ...form, chief_complaints: e.target.value })}
                    placeholder="e.g. Right knee pain since 6 months, difficulty walking, swelling..." rows={5}
                    style={{ ...inp, resize: "vertical" } as any} />
                </div>
                <button onClick={handleSave} disabled={saving || !form.chief_complaints}
                  style={{ width: "100%", padding: "14px", background: saved ? "#16a34a" : saving || !form.chief_complaints ? "#94a3b8" : "#0a2463", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: saving || !form.chief_complaints ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving..." : saved ? "✓ Sent to Doctor's Screen" : "Send to Doctor →"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ENQUIRIES TAB ── */}
      {activeTab === "enquiries" && (
        <div style={{ padding: "24px 5%", maxWidth: "900px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ color: "#0a2463", fontSize: "20px", fontWeight: "700", margin: 0 }}>Contact Enquiries</h2>
              <p style={{ color: "#888", fontSize: "13px", margin: "4px 0 0" }}>
                {pendingCount > 0 ? `${pendingCount} pending response${pendingCount > 1 ? "s" : ""}` : "All enquiries responded ✅"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["all", "pending", "responded"] as const).map(f => (
                <button key={f} onClick={() => setFilterResponded(f)}
                  style={{
                    padding: "8px 16px", borderRadius: "20px", border: "1.5px solid",
                    borderColor: filterResponded === f ? "#0a2463" : "#e0e7ff",
                    background: filterResponded === f ? "#0a2463" : "white",
                    color: filterResponded === f ? "white" : "#6b7280",
                    fontSize: "13px", fontWeight: "600", cursor: "pointer",
                    fontFamily: "Georgia, serif", textTransform: "capitalize",
                  }}>
                  {f === "all" ? `All (${enquiries.length})` : f === "pending" ? `Pending (${pendingCount})` : `Done (${enquiries.length - pendingCount})`}
                </button>
              ))}
              <button onClick={fetchEnquiries}
                style={{ padding: "8px 16px", borderRadius: "20px", border: "1.5px solid #e0e7ff", background: "white", color: "#6b7280", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif" }}>
                🔄 Refresh
              </button>
            </div>
          </div>

          {enquiriesLoading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>Loading enquiries...</div>
          ) : filteredEnquiries.length === 0 ? (
            <div style={{ background: "white", borderRadius: "16px", padding: "60px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
              <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "18px", marginBottom: "8px" }}>
                {filterResponded === "pending" ? "No pending enquiries!" : "No enquiries yet"}
              </div>
              <div style={{ color: "#888", fontSize: "14px" }}>
                {filterResponded === "pending" ? "All caught up ✅" : "Enquiries from the website contact form will appear here"}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filteredEnquiries.map(e => (
                <div key={e.id} style={{
                  background: "white", borderRadius: "16px", padding: "24px 28px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: `1.5px solid ${e.responded ? "#dcfce7" : "#fef3c7"}`,
                  borderLeft: `5px solid ${e.responded ? "#16a34a" : "#f59e0b"}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: e.responded ? "#dcfce7" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                        {e.responded ? "✅" : "🔔"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "800", color: "#030a1e", fontSize: "18px", marginBottom: "4px" }}>{e.name}</div>
                        <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500" }}>📅 {formatIST(e.created_at)}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
                      <a href={`tel:+91${e.phone}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "12px", background: "#eff6ff", color: "#1a56db", textDecoration: "none", fontSize: "14px", fontWeight: "700", border: "1.5px solid #bfdbfe" }}>
                        📞 Call
                      </a>
                      <a href={`https://wa.me/91${e.phone}?text=Hello%20${encodeURIComponent(e.name)}%2C%20this%20is%20Neel%20Orthopaedic%20Multispeciality%20Hospital.%20We%20received%20your%20enquiry%20and%20would%20like%20to%20assist%20you.`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "12px", background: "#f0fdf4", color: "#16a34a", textDecoration: "none", fontSize: "14px", fontWeight: "700", border: "1.5px solid #bbf7d0" }}>
                        💬 WhatsApp
                      </a>
                      <button onClick={() => markResponded(e.id, e.responded)} disabled={markingId === e.id}
                        style={{
                          padding: "10px 18px", borderRadius: "12px", cursor: "pointer",
                          background: e.responded ? "#f8faff" : "#0a2463",
                          color: e.responded ? "#6b7280" : "white",
                          fontSize: "14px", fontWeight: "700", fontFamily: "Georgia, serif",
                          border: e.responded ? "1.5px solid #e0e7ff" : "none",
                          whiteSpace: "nowrap", transition: "all 0.2s",
                        }}>
                        {markingId === e.id ? "..." : e.responded ? "✓ Done" : "Mark Responded"}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ background: "#f0f4ff", color: "#1a56db", borderRadius: "8px", padding: "6px 14px", fontSize: "15px", fontWeight: "700" }}>📱 {e.phone}</span>
                  </div>
                  <div style={{ background: "#f8faff", borderRadius: "12px", padding: "16px 18px", border: "1px solid #e0e7ff" }}>
                    <div style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", marginBottom: "8px" }}>MESSAGE</div>
                    <div style={{ color: "#030a1e", fontSize: "16px", lineHeight: "1.75" }}>{e.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}