"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function WalkIn() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const getToken = async () => {
    if (!name || !phone) return;
    setLoading(true);

    try {
      // get next walk-in token number
      const { count } = await supabase
        .from("appointment")
        .select("*", { count: "exact", head: true })
        .gte("token_number", 145);

      const newToken = 145 + (count || 0);

      // get or create patient
      let patientId: number;
      const { data: existing } = await supabase
        .from("patient")
        .select("patient_id")
        .eq("phone", phone)
        .single();

      if (existing) {
        patientId = existing.patient_id;
      } else {
        const { data: newPatient } = await supabase
          .from("patient")
          .insert({ name, phone, dob: "1990-01-01", gender: "M" })
          .select("patient_id")
          .single();
        patientId = newPatient!.patient_id;
      }

      // get today's slot
      const { data: slot } = await supabase
        .from("slot")
        .select("slot_id")
        .eq("slot_date", today)
        .limit(1)
        .single();

      if (!slot) throw new Error("No slots today");

      // create appointment
      await supabase.from("appointment").insert({
        patient_id: patientId,
        doctor_id: 5,
        slot_id: slot.slot_id,
        token_number: newToken,
        status: "booked",
        qr_code: `WALKIN-${newToken}-${phone}`,
      });

      setToken(newToken);
      setStep(2);
    } catch (err) {
      alert("Something went wrong. Please try at reception.");
    }
    setLoading(false);
  };

  const now = new Date();
  const session = now.getHours() < 13 ? "Morning OPD (10:00 AM – 1:15 PM)" : "Evening OPD (3:30 PM – 6:45 PM)";

  return (
    <div style={{
      minHeight: "100vh", background: "#f0f4ff",
      fontFamily: "Georgia, serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "20px"
    }}>

      {step === 1 && (
        <div style={{
          background: "white", borderRadius: "20px", padding: "40px",
          width: "100%", maxWidth: "420px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
        }}>
          {/* hospital name */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "56px", height: "56px", background: "#0a2463",
              borderRadius: "14px", display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontSize: "24px",
              fontWeight: "800", margin: "0 auto 16px"
            }}>N</div>
            <div style={{ fontWeight: "700", fontSize: "18px", color: "#0a2463" }}>Neel Orthopaedic Hospital</div>
            <div style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>Walk-in Token System</div>
          </div>

          {/* session badge */}
          <div style={{
            background: "#f0f4ff", borderRadius: "10px", padding: "12px 16px",
            marginBottom: "24px", textAlign: "center"
          }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Current Session</div>
            <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "15px" }}>{session}</div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Your Name *
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px",
                border: "1.5px solid #e0e7ff", fontSize: "16px",
                outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box", color: "#030a1e"
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px",
                border: "1.5px solid #e0e7ff", fontSize: "16px",
                outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box", color: "#030a1e"
              }}
            />
          </div>

          <button
            onClick={getToken}
            disabled={loading || !name || !phone}
            style={{
              width: "100%", padding: "14px",
              background: loading || !name || !phone ? "#94a3b8" : "#0a2463",
              color: "white", border: "none", borderRadius: "10px",
              fontSize: "16px", fontWeight: "700",
              cursor: loading || !name || !phone ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Getting your token..." : "Get My Token →"}
          </button>

          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px", marginTop: "16px" }}>
            Walk-in tokens are issued from number 145 onwards
          </p>
        </div>
      )}

      {step === 2 && token && (
        <div style={{
          background: "white", borderRadius: "20px", padding: "40px",
          width: "100%", maxWidth: "420px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
          <h2 style={{ color: "#0a2463", fontSize: "22px", marginBottom: "8px" }}>Token Issued!</h2>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "32px" }}>Welcome, {name}</p>

          {/* big token number */}
          <div style={{
            background: "#0a2463", borderRadius: "16px", padding: "32px",
            marginBottom: "24px"
          }}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", letterSpacing: "1px", marginBottom: "8px" }}>YOUR TOKEN NUMBER</div>
            <div style={{ color: "white", fontSize: "80px", fontWeight: "800", lineHeight: 1 }}>{token}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginTop: "8px" }}>Walk-in • {session}</div>
          </div>

          <div style={{
            background: "#fff8e1", borderRadius: "12px", padding: "16px",
            border: "1px solid #ffe082", marginBottom: "24px",
            fontSize: "14px", color: "#795548", lineHeight: "1.6"
          }}>
            📍 Please wait in the OPD waiting area.<br />
            Your token will be called shortly.<br />
            <strong>Do not lose this number!</strong>
          </div>

          <div style={{ color: "#666", fontSize: "13px", marginBottom: "8px" }}>
            Dr. G.K. Boob · {session}
          </div>
          <div style={{ color: "#0a2463", fontWeight: "700", fontSize: "15px" }}>
            +91 70210 94941
          </div>

          <button
            onClick={() => window.print()}
            style={{
              marginTop: "24px", width: "100%", padding: "12px",
              background: "#f0f4ff", color: "#0a2463", border: "1.5px solid #e0e7ff",
              borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer"
            }}
          >
            🖨️ Print / Save Token
          </button>
        </div>
      )}
    </div>
  );
}