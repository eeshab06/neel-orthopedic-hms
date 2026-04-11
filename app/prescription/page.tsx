"use client";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface PrescriptionData {
  patient_name: string;
  age: string;
  sex: string;
  date: string;
  known_allergies: string;
  chief_complaints: string;
  clinical_findings: string;
  investigation: string;
  diagnosis: string;
  treatment: string;
  medication: string;
  physiotherapy: string;
  surgery: string;
  follow_up: string;
}

export default function Prescription() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<PrescriptionData>({
    patient_name: "",
    age: "",
    sex: "Male",
    date: new Date().toISOString().split("T")[0],
    known_allergies: "",
    chief_complaints: "",
    clinical_findings: "",
    investigation: "",
    diagnosis: "",
    treatment: "",
    medication: "",
    physiotherapy: "",
    surgery: "",
    follow_up: "",
  });

  const update = (key: keyof PrescriptionData, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const savePrescription = async () => {
    setSaving(true);
    await supabase.from("prescription_opd").insert({
      patient_name: form.patient_name,
      age: parseInt(form.age),
      sex: form.sex,
      date: form.date,
      known_allergies: form.known_allergies,
      chief_complaints: form.chief_complaints,
      clinical_findings: form.clinical_findings,
      investigation: form.investigation,
      diagnosis: form.diagnosis,
      treatment: form.treatment,
      medication: form.medication,
      physiotherapy: form.physiotherapy,
      surgery: form.surgery,
      follow_up: form.follow_up,
      doctor_id: 5,
    });
    setSaved(true);
    setSaving(false);
  };

  const handlePrint = () => window.print();

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1.5px solid #e0e7ff", fontSize: "15px",
    fontFamily: "Georgia, serif", boxSizing: "border-box" as const,
    outline: "none", resize: "vertical" as const,
  };

  const labelStyle = {
    display: "block", fontSize: "13px", fontWeight: "600",
    color: "#374151", marginBottom: "6px",
  };

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "360px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", background: "#0a2463", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "24px", fontWeight: "800", margin: "0 auto 20px" }}>Rx</div>
          <h2 style={{ color: "#0a2463", fontSize: "20px", marginBottom: "8px" }}>Digital Prescription</h2>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "28px" }}>Doctor access only — Enter PIN</p>
          <input type="password" placeholder="••••" value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { if (pin === "1001") setAuthenticated(true); else alert("Wrong PIN!"); } }}
            style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1.5px solid #e0e7ff", fontSize: "24px", textAlign: "center", letterSpacing: "8px", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: "16px" }} />
          <button onClick={() => { if (pin === "1001") setAuthenticated(true); else alert("Wrong PIN!"); }}
            style={{ width: "100%", padding: "14px", background: "#0a2463", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
            Enter →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: 1px solid #ccc !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* navbar */}
      <div className="no-print" style={{ background: "#0a2463", padding: "0 5%", height: "65px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>Digital Prescription — Dr. G.K. Boob</div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={savePrescription} disabled={saving || !form.patient_name || !form.diagnosis}
            style={{ background: saved ? "#16a34a" : "#1a73e8", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save"}
          </button>
          <button onClick={handlePrint}
            style={{ background: "white", color: "#0a2463", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            🖨️ Print
          </button>
          <button onClick={() => { setForm({ patient_name: "", age: "", sex: "Male", date: new Date().toISOString().split("T")[0], known_allergies: "", chief_complaints: "", clinical_findings: "", investigation: "", diagnosis: "", treatment: "", medication: "", physiotherapy: "", surgery: "", follow_up: "" }); setSaved(false); }}
            style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            New Rx
          </button>
        </div>
      </div>

      <div style={{ padding: "32px 5%", maxWidth: "900px", margin: "0 auto" }}>

        {/* prescription paper */}
        <div ref={printRef} className="print-area" style={{ background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

          {/* hospital header */}
          <div style={{ borderBottom: "3px solid #0a2463", paddingBottom: "20px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#0a2463" }}>Neel Orthopaedic & Multi Speciality Hospital</div>
              <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>1st Floor, Shrinath Apartment, Goddev Naka, B.P. Road, Bhayander East, Mumbai — 401105</div>
              <div style={{ color: "#666", fontSize: "13px" }}>📞 +91 70210 94941</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px" }}>Dr. G.K. Boob</div>
              <div style={{ color: "#666", fontSize: "13px" }}>DNB (Orthopaedic Surgery)</div>
              <div style={{ color: "#666", fontSize: "13px" }}>Fellowship in Spine Surgery, Germany</div>
              <div style={{ color: "#1a73e8", fontSize: "13px", marginTop: "4px" }}>Robotic Knee Replacement Surgeon</div>
            </div>
          </div>

          {/* patient info row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "16px", marginBottom: "24px", background: "#f8f9fc", borderRadius: "10px", padding: "16px" }}>
            <div>
              <label style={labelStyle}>Patient Name *</label>
              <input value={form.patient_name} onChange={e => update("patient_name", e.target.value)}
                placeholder="Full name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Age *</label>
              <input value={form.age} onChange={e => update("age", e.target.value)}
                placeholder="Years" type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Sex</label>
              <select value={form.sex} onChange={e => update("sex", e.target.value)} style={inputStyle}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input value={form.date} onChange={e => update("date", e.target.value)}
                type="date" style={inputStyle} />
            </div>
          </div>

          {/* allergies */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ ...labelStyle, color: "#dc2626" }}>⚠️ Known Allergies</label>
            <input value={form.known_allergies} onChange={e => update("known_allergies", e.target.value)}
              placeholder="None / list allergies here" style={{ ...inputStyle, borderColor: form.known_allergies ? "#fca5a5" : "#e0e7ff" }} />
          </div>

          {/* clinical sections */}
          {[
            { key: "chief_complaints", label: "Chief Complaints", placeholder: "Patient's main complaints..." },
            { key: "clinical_findings", label: "Clinical Examination Findings", placeholder: "Examination findings..." },
            { key: "investigation", label: "Investigation", placeholder: "X-ray, MRI, blood reports etc..." },
            { key: "diagnosis", label: "Diagnosis *", placeholder: "Clinical diagnosis..." },
            { key: "treatment", label: "Treatment Recommended", placeholder: "Conservative / Surgical / Physiotherapy..." },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>{field.label}</label>
              <textarea value={form[field.key as keyof PrescriptionData]}
                onChange={e => update(field.key as keyof PrescriptionData, e.target.value)}
                placeholder={field.placeholder} rows={3}
                style={{ ...inputStyle, fontFamily: "Georgia, serif" }} />
            </div>
          ))}

          {/* Rx section */}
          <div style={{ background: "#f0f4ff", borderRadius: "10px", padding: "20px", marginBottom: "20px", border: "1.5px solid #e0e7ff" }}>
            <div style={{ fontWeight: "800", fontSize: "24px", color: "#0a2463", marginBottom: "16px", fontStyle: "italic" }}>Rx</div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Medication</label>
              <textarea value={form.medication} onChange={e => update("medication", e.target.value)}
                placeholder="Drug name, dose, frequency, duration..." rows={4}
                style={{ ...inputStyle, fontFamily: "Georgia, serif" }} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Physiotherapy</label>
              <textarea value={form.physiotherapy} onChange={e => update("physiotherapy", e.target.value)}
                placeholder="Physiotherapy instructions if any..." rows={2}
                style={{ ...inputStyle, fontFamily: "Georgia, serif" }} />
            </div>
            <div>
              <label style={labelStyle}>Surgery (if planned)</label>
              <textarea value={form.surgery} onChange={e => update("surgery", e.target.value)}
                placeholder="Surgery type, date, pre-op instructions..." rows={2}
                style={{ ...inputStyle, fontFamily: "Georgia, serif" }} />
            </div>
          </div>

          {/* follow up */}
          <div style={{ marginBottom: "32px" }}>
            <label style={labelStyle}>Follow-up Date</label>
            <input value={form.follow_up} onChange={e => update("follow_up", e.target.value)}
              type="date" style={{ ...inputStyle, maxWidth: "200px" }} />
          </div>

          {/* signature */}
          <div style={{ borderTop: "2px solid #e0e7ff", paddingTop: "24px", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "180px", borderBottom: "1.5px solid #0a2463", marginBottom: "8px", height: "40px" }} />
              <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "14px" }}>Dr. G.K. Boob</div>
              <div style={{ color: "#666", fontSize: "12px" }}>DNB Ortho | Reg. No: ______</div>
            </div>
          </div>
        </div>

        {/* action buttons below */}
        <div className="no-print" style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "center" }}>
          <button onClick={savePrescription} disabled={saving || !form.patient_name || !form.diagnosis}
            style={{ background: saved ? "#16a34a" : "#0a2463", color: "white", border: "none", padding: "14px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
            {saving ? "Saving..." : saved ? "✓ Saved to Records" : "Save to Records"}
          </button>
          <button onClick={handlePrint}
            style={{ background: "white", color: "#0a2463", border: "2px solid #0a2463", padding: "14px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
            🖨️ Print Prescription
          </button>
        </div>
      </div>
    </div>
  );
}