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

interface FollowUp {
  patient_name: string;
  phone: string;
  follow_up_date: string;
  diagnosis: string;
  next_visit: string;
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
  const [activeTab, setActiveTab] = useState<"queue" | "enquiries" | "followups">("queue");

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

  // Follow-ups state
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Fetch queue
  useEffect(() => {
    if (!user) return;
    const fetchTokens = async () => {
      const { data } = await supabase
        .from("appointment")
        .select(`appt_id, token_number, status, patient:patient_id (name, phone, dob), slot:slot_id (slot_date)`)
        .eq("status", "booked")
        .order("token_number", { ascending: true });
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

  useEffect(() => {
    if (!user || activeTab !== "enquiries") return;
    fetchEnquiries();
  }, [user, activeTab]);

  useEffect(() => {
    if (!user || activeTab !== "followups") return;
    fetchFollowUps();
  }, [user, activeTab]);

  const fetchFollowUps = async () => {
    setFollowUpsLoading(true);
    const { data } = await supabase
      .from("opd_prescription")
      .select("patient_name, follow_up_date, diagnosis, next_visit, token_number")
      .eq("next_visit", tomorrow)
      .not("next_visit", "is", null);
    if (data && data.length > 0) {
      const enriched = await Promise.all(data.map(async (p: any) => {
        const { data: apptData } = await supabase
          .from("appointment")
          .select("patient:patient_id (name, phone)")
          .eq("token_number", p.token_number)
          .single();
        return {
          patient_name: p.patient_name,
          phone: (apptData?.patient as any)?.phone || "",
          follow_up_date: p.follow_up_date,
          diagnosis: p.diagnosis || "",
          next_visit: p.next_visit || "",
        };
      }));
      setFollowUps(enriched as FollowUp[]);
    } else {
      setFollowUps([]);
    }
    setFollowUpsLoading(false);
  };

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

  const buildWtpMessage = (f: FollowUp) => {
    const msg = `Hello ${f.patient_name}, this is Neel Orthopaedic Multispeciality Hospital. Your follow-up visit is scheduled for tomorrow (${f.follow_up_date}). Please book your appointment at localhost:3000/book and carry your previous prescription file. — Neel Orthopaedic Hospital`;
    return `https://wa.me/91${f.phone}?text=${encodeURIComponent(msg)}`;
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    border: "1px solid #e3e6ef", fontSize: "15px",
    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
    color: "#1e293b", background: "white", outline: "none",
  };

  const lbl: React.CSSProperties = {
    display: "block", fontSize: "13px", fontWeight: "600",
    color: "#475569", marginBottom: "6px",
  };

  if (authLoading || !user) {
    return <div style={{ minHeight: "100vh", background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: "#0a2463" }}>Loading…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#eef4ff", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input, textarea, select { color: #1e293b !important; font-size: 15px !important; font-family: 'DM Sans', sans-serif !important; }
        input::placeholder, textarea::placeholder { color: #94a3b8 !important; }
        input:focus, textarea:focus, select:focus { border-color: #0a2463 !important; outline: none !important; }
        button { font-family: 'DM Sans', sans-serif !important; }
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      {/* TABS */}
      <div style={{ background: "white", borderBottom: "1px solid #e3e6ef", padding: "0 5%" }}>
        <div style={{ display: "flex" }}>
          {[
            { key: "queue", label: "OPD Queue", badge: tokens.length },
            { key: "followups", label: "Follow-up Reminders", badge: followUps.length },
            { key: "enquiries", label: "Enquiries", badge: pendingCount },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: "14px 24px", border: "none", background: "transparent", cursor: "pointer",
                fontSize: "14px", fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? "#0a2463" : "#94a3b8",
                borderBottom: activeTab === tab.key ? "2px solid #0a2463" : "2px solid transparent",
                display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s",
              }}>
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  background: tab.key === "enquiries" && pendingCount > 0 ? "#9f1239" : tab.key === "followups" ? "#854d0e" : "#0a2463",
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

      {/* OPD QUEUE TAB */}
      {activeTab === "queue" && (
        <div style={{ padding: "24px 5%", display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px" }}>
          {/* Queue list */}
          <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #e3e6ef", height: "fit-content" }}>
            <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px", marginBottom: "14px" }}>Today's Queue</div>
            <input placeholder="Search by token or name..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inp, marginBottom: "12px" }} />
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" }}>No patients waiting</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "600px", overflowY: "auto" }}>
                {filtered.map(t => (
                  <div key={t.appt_id} onClick={() => window.location.href = `/prescription?token=${t.token_number}`}
                    style={{ padding: "12px 14px", borderRadius: "10px", cursor: "pointer", background: selectedToken?.appt_id === t.appt_id ? "#0a2463" : "#fafcff", border: `1px solid ${selectedToken?.appt_id === t.appt_id ? "#0a2463" : "#e3e6ef"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0, background: selectedToken?.appt_id === t.appt_id ? "rgba(255,255,255,0.2)" : t.token_number >= 145 ? "#fffbeb" : "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: selectedToken?.appt_id === t.appt_id ? "white" : t.token_number >= 145 ? "#854d0e" : "#1e40af", fontWeight: "700", fontSize: "14px", border: `1px solid ${t.token_number >= 145 ? "#fde68a" : "#bfdbfe"}` }}>{t.token_number}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ fontWeight: "600", fontSize: "14px", color: selectedToken?.appt_id === t.appt_id ? "white" : "#1e293b" }}>{(t.patient as any)?.name}</div>
                          {t.token_number >= 145 && (
                            <span style={{ background: selectedToken?.appt_id === t.appt_id ? "rgba(255,255,255,0.15)" : "#fffbeb", color: selectedToken?.appt_id === t.appt_id ? "rgba(255,255,255,0.8)" : "#854d0e", fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "4px" }}>WALK-IN</span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: selectedToken?.appt_id === t.appt_id ? "rgba(255,255,255,0.6)" : "#94a3b8" }}>{(t.patient as any)?.phone}</div>
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
              <div style={{ background: "white", borderRadius: "12px", padding: "60px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #e3e6ef" }}>
                <div style={{ fontSize: "44px", marginBottom: "16px" }}>👈</div>
                <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "18px", marginBottom: "8px" }}>Select a patient from the queue</div>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>Click on a token number to fill in their details before they enter the cabin</div>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #e3e6ef" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "18px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "50px", height: "50px", background: "#0a2463", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "20px" }}>{selectedToken.token_number}</div>
                    <div>
                      <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "17px" }}>{(selectedToken.patient as any)?.name}</div>
                      <div style={{ color: "#94a3b8", fontSize: "13px" }}>{(selectedToken.patient as any)?.phone}</div>
                    </div>
                  </div>
                  {saved && <div style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "7px 14px", borderRadius: "8px", fontWeight: "600", fontSize: "14px" }}>✓ Sent to Doctor</div>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "18px" }}>
                  <div>
                    <label style={lbl}>Patient Name</label>
                    <input value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Age (years)</label>
                    <input value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} type="number" placeholder="Age" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Sex</label>
                    <select value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })} style={inp}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ ...lbl, color: "#9f1239" }}>⚠️ Known Allergies</label>
                  <input value={form.known_allergies} onChange={e => setForm({ ...form, known_allergies: e.target.value })}
                    placeholder="None / list any known allergies"
                    style={{ ...inp, border: "1px solid #fecdd3" }} />
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <label style={lbl}>Chief Complaints *</label>
                  <textarea value={form.chief_complaints} onChange={e => setForm({ ...form, chief_complaints: e.target.value })}
                    placeholder="e.g. Right knee pain since 6 months, difficulty walking, swelling..." rows={5}
                    style={{ ...inp, resize: "vertical" } as any} />
                </div>
                <button onClick={handleSave} disabled={saving || !form.chief_complaints}
                  style={{ width: "100%", padding: "14px", background: saved ? "#166534" : saving || !form.chief_complaints ? "#94a3b8" : "#0a2463", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: saving || !form.chief_complaints ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving..." : saved ? "✓ Sent to Doctor's Screen" : "Send to Doctor →"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOLLOW-UP REMINDERS TAB */}
      {activeTab === "followups" && (
        <div style={{ padding: "24px 5%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ color: "#0a2463", fontSize: "18px", fontWeight: "700", margin: 0 }}>Tomorrow's Follow-up Patients</h2>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0" }}>
                {followUps.length > 0 ? `${followUps.length} patient${followUps.length > 1 ? "s" : ""} due for follow-up tomorrow (${tomorrow})` : `No follow-ups scheduled for tomorrow (${tomorrow})`}
              </p>
            </div>
            <button onClick={fetchFollowUps} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e3e6ef", background: "white", color: "#64748b", fontSize: "13px", cursor: "pointer" }}>Refresh</button>
          </div>
          {followUpsLoading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "14px" }}>Loading follow-ups...</div>
          ) : followUps.length === 0 ? (
            <div style={{ background: "white", borderRadius: "12px", padding: "60px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #e3e6ef" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>✅</div>
              <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "17px", marginBottom: "8px" }}>No follow-ups tomorrow!</div>
              <div style={{ color: "#94a3b8", fontSize: "14px" }}>Check back later or refresh.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {followUps.map((f, idx) => (
                <div key={idx} style={{ background: "white", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #fde68a", borderLeft: "5px solid #fcd34d" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#fffbeb", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>📅</div>
                      <div>
                        <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px", marginBottom: "3px" }}>{f.patient_name}</div>
                        <div style={{ color: "#64748b", fontSize: "14px" }}>{f.phone}</div>
                        {f.diagnosis && <div style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>{f.diagnosis}</div>}
                      </div>
                    </div>
                    <a href={buildWtpMessage(f)} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px", background: "#128C7E", color: "white", textDecoration: "none", fontSize: "14px", fontWeight: "700", whiteSpace: "nowrap" }}>
                      💬 Send WhatsApp Reminder
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ENQUIRIES TAB */}
      {activeTab === "enquiries" && (
        <div style={{ padding: "24px 5%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ color: "#0a2463", fontSize: "18px", fontWeight: "700", margin: 0 }}>Contact Enquiries</h2>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0" }}>
                {pendingCount > 0 ? `${pendingCount} pending response${pendingCount > 1 ? "s" : ""}` : "All enquiries responded ✅"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["all", "pending", "responded"] as const).map(f => (
                <button key={f} onClick={() => setFilterResponded(f)}
                  style={{ padding: "7px 14px", borderRadius: "7px", border: `1px solid ${filterResponded === f ? "#0a2463" : "#e3e6ef"}`, background: filterResponded === f ? "#0a2463" : "white", color: filterResponded === f ? "white" : "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", textTransform: "capitalize" }}>
                  {f === "all" ? `All (${enquiries.length})` : f === "pending" ? `Pending (${pendingCount})` : `Done (${enquiries.length - pendingCount})`}
                </button>
              ))}
              <button onClick={fetchEnquiries} style={{ padding: "7px 14px", borderRadius: "7px", border: "1px solid #e3e6ef", background: "white", color: "#64748b", fontSize: "13px", cursor: "pointer" }}>Refresh</button>
            </div>
          </div>
          {enquiriesLoading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "14px" }}>Loading enquiries...</div>
          ) : filteredEnquiries.length === 0 ? (
            <div style={{ background: "white", borderRadius: "12px", padding: "60px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #e3e6ef" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>📭</div>
              <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "17px", marginBottom: "8px" }}>{filterResponded === "pending" ? "No pending enquiries!" : "No enquiries yet"}</div>
              <div style={{ color: "#94a3b8", fontSize: "14px" }}>{filterResponded === "pending" ? "All caught up ✅" : "Enquiries from the website contact form will appear here"}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredEnquiries.map(e => (
                <div key={e.id} style={{ background: "white", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: `1px solid ${e.responded ? "#bbf7d0" : "#fde68a"}`, borderLeft: `5px solid ${e.responded ? "#86efac" : "#fcd34d"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: e.responded ? "#f0fdf4" : "#fffbeb", border: `1px solid ${e.responded ? "#bbf7d0" : "#fde68a"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                        {e.responded ? "✅" : "🔔"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px", marginBottom: "3px" }}>{e.name}</div>
                        <div style={{ color: "#64748b", fontSize: "13px" }}>{formatIST(e.created_at)}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>
                      <a href={`tel:+91${e.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "7px", background: "#eff6ff", color: "#1e40af", textDecoration: "none", fontSize: "13px", fontWeight: "600", border: "1px solid #bfdbfe" }}>📞 Call</a>
                      <a href={`https://wa.me/91${e.phone}?text=Hello%20${encodeURIComponent(e.name)}%2C%20this%20is%20Neel%20Orthopaedic%20Multispeciality%20Hospital.%20We%20received%20your%20enquiry%20and%20would%20like%20to%20assist%20you.`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "7px", background: "#f0fdf4", color: "#166534", textDecoration: "none", fontSize: "13px", fontWeight: "600", border: "1px solid #bbf7d0" }}>
                        💬 WhatsApp
                      </a>
                      <button onClick={() => markResponded(e.id, e.responded)} disabled={markingId === e.id}
                        style={{ padding: "8px 14px", borderRadius: "7px", cursor: "pointer", background: e.responded ? "#f6f8fb" : "#0a2463", color: e.responded ? "#64748b" : "white", fontSize: "13px", fontWeight: "600", border: e.responded ? "1px solid #e3e6ef" : "none", whiteSpace: "nowrap" }}>
                        {markingId === e.id ? "..." : e.responded ? "✓ Done" : "Mark Responded"}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ background: "#eff6ff", color: "#1e40af", borderRadius: "7px", padding: "5px 12px", fontSize: "14px", fontWeight: "600", border: "1px solid #bfdbfe" }}>📱 {e.phone}</span>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "14px 16px", border: "1px solid #e3e6ef" }}>
                    <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "8px" }}>MESSAGE</div>
                    <div style={{ color: "#1e293b", fontSize: "15px", lineHeight: "1.75" }}>{e.message}</div>
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