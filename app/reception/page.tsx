"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Token {
  appt_id: number;
  token_number: number;
  status: string;
  patient: { name: string; phone: string; dob: string };
}

export default function ReceptionForm() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    patient_name: "",
    age: "",
    sex: "Male",
    known_allergies: "",
    chief_complaints: "",
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchTokens = async () => {
      const { data } = await supabase
  .from("appointment")
  .select(`appt_id, token_number, status, patient:patient_id (name, phone, dob), slot:slot_id (slot_date)`)
  .eq("status", "booked")
  .order("token_number", { ascending: true });
      if (data) setTokens(data as any);
      setLoading(false);
    };
    fetchTokens();
  }, []);

  const calcAge = (dob: string) => {
    if (!dob) return "";
    return String(Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365)));
  };

  const selectToken = (token: Token) => {
    setSelectedToken(token);
    setSaved(false);
    const patient = token.patient as any;
    setForm({
      patient_name: patient?.name || "",
      age: calcAge(patient?.dob) || "",
      sex: "Male",
      known_allergies: "",
      chief_complaints: "",
    });
  };

  const handleSave = async () => {
    if (!selectedToken || !form.chief_complaints) return;
    setSaving(true);

    // check if prescription already exists for this token
    const { data: existing } = await supabase
      .from("opd_prescription")
      .select("id")
      .eq("token_number", selectedToken.token_number)
      .single();

    if (existing) {
      // update existing
      await supabase.from("opd_prescription").update({
        patient_name: form.patient_name,
        age: parseInt(form.age),
        sex: form.sex,
        known_allergies: form.known_allergies,
        chief_complaints: form.chief_complaints,
        filled_by_reception: true,
        date: today,
        doctor_id: 5,
      }).eq("id", existing.id);
    } else {
      // create new
      await supabase.from("opd_prescription").insert({
        token_number: selectedToken.token_number,
        patient_name: form.patient_name,
        age: parseInt(form.age),
        sex: form.sex,
        known_allergies: form.known_allergies,
        chief_complaints: form.chief_complaints,
        filled_by_reception: true,
        date: today,
        doctor_id: 5,
      });
    }

    setSaved(true);
    setSaving(false);
  };

  const filtered = tokens.filter(t =>
    String(t.token_number).includes(search) ||
    (t.patient as any)?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>

      {/* header */}
      <div style={{ background: "#0a2463", padding: "0 5%", height: "65px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>Reception — Patient Entry Form</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      <div style={{ padding: "24px 5%", display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px" }}>

        {/* left — token list */}
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
          <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px", marginBottom: "16px" }}>Today's Queue</div>

          <input
            placeholder="Search by token or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e7ff", fontSize: "14px", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: "12px" }}
          />

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999", fontSize: "14px" }}>No patients waiting</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "600px", overflowY: "auto" }}>
              {filtered.map(t => (
                <div key={t.appt_id}
                  onClick={() => selectToken(t)}
                  style={{
                    padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                    background: selectedToken?.appt_id === t.appt_id ? "#0a2463" : "#f8f9fc",
                    border: selectedToken?.appt_id === t.appt_id ? "2px solid #0a2463" : "1.5px solid #e8edf5",
                    transition: "all 0.2s"
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
                      background: selectedToken?.appt_id === t.appt_id ? "rgba(255,255,255,0.2)" : "#0a2463",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: "800", fontSize: "14px"
                    }}>{t.token_number}</div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: selectedToken?.appt_id === t.appt_id ? "white" : "#0a2463" }}>
                        {(t.patient as any)?.name}
                      </div>
                      <div style={{ fontSize: "12px", color: selectedToken?.appt_id === t.appt_id ? "rgba(255,255,255,0.7)" : "#888" }}>
                        {(t.patient as any)?.phone}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* right — form */}
        <div>
          {!selectedToken ? (
            <div style={{ background: "white", borderRadius: "16px", padding: "60px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>👈</div>
              <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "18px", marginBottom: "8px" }}>Select a patient from the queue</div>
              <div style={{ color: "#888", fontSize: "14px" }}>Click on a token number to fill in their details before they enter the cabin</div>
            </div>
          ) : (
            <div style={{ background: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>

              {/* selected patient header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", paddingBottom: "20px", borderBottom: "2px solid #f0f4ff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "52px", height: "52px", background: "#0a2463", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "20px" }}>
                    {selectedToken.token_number}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "18px" }}>{(selectedToken.patient as any)?.name}</div>
                    <div style={{ color: "#888", fontSize: "13px" }}>{(selectedToken.patient as any)?.phone}</div>
                  </div>
                </div>
                {saved && (
                  <div style={{ background: "#dcfce7", color: "#16a34a", padding: "8px 16px", borderRadius: "20px", fontWeight: "700", fontSize: "14px" }}>
                    ✓ Sent to Doctor
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "16px", color: "#666", fontSize: "14px", background: "#f8f9fc", borderRadius: "8px", padding: "12px 16px" }}>
                📋 Fill in the patient's details below. This will appear on the doctor's screen when they call this token.
              </div>

              {/* patient details */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Patient Name</label>
                  <input value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e7ff", fontSize: "15px", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Age (years)</label>
                  <input value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                    type="number" placeholder="Age"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e7ff", fontSize: "15px", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Sex</label>
                  <select value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e7ff", fontSize: "15px", fontFamily: "Georgia, serif", boxSizing: "border-box" }}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#dc2626", marginBottom: "6px" }}>⚠️ Known Allergies</label>
                <input value={form.known_allergies} onChange={e => setForm({ ...form, known_allergies: e.target.value })}
                  placeholder="None / list any known allergies"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #fca5a5", fontSize: "15px", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Chief Complaints * <span style={{ color: "#888", fontWeight: "400" }}>(Why is the patient here today?)</span></label>
                <textarea value={form.chief_complaints} onChange={e => setForm({ ...form, chief_complaints: e.target.value })}
                  placeholder="e.g. Right knee pain since 6 months, difficulty walking, swelling..."
                  rows={5}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e7ff", fontSize: "15px", fontFamily: "Georgia, serif", boxSizing: "border-box", resize: "vertical" }} />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !form.chief_complaints}
                style={{
                  width: "100%", padding: "14px",
                  background: saved ? "#16a34a" : saving || !form.chief_complaints ? "#94a3b8" : "#0a2463",
                  color: "white", border: "none", borderRadius: "10px",
                  fontSize: "16px", fontWeight: "700",
                  cursor: saving || !form.chief_complaints ? "not-allowed" : "pointer"
                }}>
                {saving ? "Saving..." : saved ? "✓ Sent to Doctor's Screen" : "Send to Doctor →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}