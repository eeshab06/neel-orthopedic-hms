"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Token {
  appt_id: number;
  token_number: number;
  status: string;
  patient: { name: string; phone: string };
  slot: { start_time: string; end_time: string; slot_date: string };
}

export default function TokenDisplay() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentToken, setCurrentToken] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [walkInCount, setWalkInCount] = useState(0);
  const [issuing, setIssuing] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const fetchTokens = async () => {
    const { data } = await supabase
      .from("appointment")
      .select(`
        appt_id, token_number, status,
        patient:patient_id (name, phone),
        slot:slot_id (start_time, end_time, slot_date)
      `)
      .eq("slot.slot_date", today)
      .neq("status", "cancelled")
      .order("token_number", { ascending: true });

    if (data) setTokens(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchTokens();
    // realtime subscription
    const channel = supabase
      .channel("appointments")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment" }, fetchTokens)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const callToken = async (apptId: number, tokenNo: number) => {
    await supabase
      .from("appointment")
      .update({ status: "checked_in" })
      .eq("appt_id", apptId);
    setCurrentToken(tokenNo);
    fetchTokens();
  };

  const completeToken = async (apptId: number) => {
    await supabase
      .from("appointment")
      .update({ status: "completed" })
      .eq("appt_id", apptId);
    fetchTokens();
  };

  const issueWalkIn = async () => {
    setIssuing(true);
    const onlineCount = tokens.length;
    const newToken = 144 + walkInCount + 1;

    const { data: patient } = await supabase
      .from("patient")
      .insert({ name: `Walk-in Patient`, phone: `walkin-${Date.now()}`, dob: "1990-01-01", gender: "M" })
      .select("patient_id")
      .single();

    if (patient) {
      const { data: slot } = await supabase
        .from("slot")
        .select("slot_id")
        .eq("slot_date", today)
        .limit(1)
        .single();

      if (slot) {
        await supabase.from("appointment").insert({
          patient_id: patient.patient_id,
          doctor_id: 5,
          slot_id: slot.slot_id,
          token_number: newToken,
          status: "booked",
          qr_code: `WALKIN-${newToken}`,
        });
        setWalkInCount(prev => prev + 1);
        fetchTokens();
      }
    }
    setIssuing(false);
  };

  const waiting = tokens.filter(t => t.status === "booked");
  const checkedIn = tokens.filter(t => t.status === "checked_in");
  const completed = tokens.filter(t => t.status === "completed");

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>

      {/* header */}
      <div style={{
        background: "#0a2463", padding: "0 5%", height: "65px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>
          Neel Orthopaedic — Reception Screen
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "13px" }}>← Back</Link>
        </div>
      </div>

      <div style={{ padding: "32px 5%" }}>

        {/* current token banner */}
        {currentToken && (
          <div style={{
            background: "#0a2463", color: "white", borderRadius: "16px",
            padding: "24px 40px", marginBottom: "24px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", letterSpacing: "1px", marginBottom: "4px" }}>NOW SERVING</div>
              <div style={{ fontSize: "64px", fontWeight: "800", lineHeight: 1 }}>Token {currentToken}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Please proceed to</div>
              <div style={{ fontSize: "24px", fontWeight: "700", marginTop: "4px" }}>Dr. G.K. Boob's OPD</div>
            </div>
          </div>
        )}

        {/* stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Today", value: tokens.length, color: "#0a2463" },
            { label: "Waiting", value: waiting.length, color: "#f59e0b" },
            { label: "In Progress", value: checkedIn.length, color: "#1a73e8" },
            { label: "Completed", value: completed.length, color: "#16a34a" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontSize: "36px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* walk-in button */}
        <div style={{ background: "white", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div>
            <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px" }}>Issue Walk-in Token</div>
            <div style={{ color: "#666", fontSize: "13px", marginTop: "2px" }}>Walk-in tokens start from 145 onwards</div>
          </div>
          <button
            onClick={issueWalkIn}
            disabled={issuing}
            style={{
              background: "#0a2463", color: "white", border: "none",
              padding: "12px 28px", borderRadius: "8px", fontSize: "15px",
              fontWeight: "600", cursor: issuing ? "not-allowed" : "pointer",
              opacity: issuing ? 0.7 : 1
            }}
          >
            {issuing ? "Issuing..." : `+ Issue Token ${144 + walkInCount + 1}`}
          </button>
        </div>

        {/* token lists */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* waiting list */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
              <span>Waiting</span>
              <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 10px", borderRadius: "20px", fontSize: "13px" }}>{waiting.length}</span>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading...</div>
            ) : waiting.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#999", fontSize: "14px" }}>No patients waiting</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "500px", overflowY: "auto" }}>
                {waiting.map(t => (
                  <div key={t.appt_id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", background: "#f8f9fc", borderRadius: "10px",
                    border: "1px solid #e8edf5"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: "40px", height: "40px", background: "#0a2463",
                        borderRadius: "8px", display: "flex", alignItems: "center",
                        justifyContent: "center", color: "white", fontWeight: "800", fontSize: "16px"
                      }}>{t.token_number}</div>
                      <div>
                        <div style={{ fontWeight: "600", color: "#0a2463", fontSize: "14px" }}>{(t.patient as any)?.name || "Patient"}</div>
                        <div style={{ color: "#888", fontSize: "12px" }}>{(t.patient as any)?.phone}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => callToken(t.appt_id, t.token_number)}
                      style={{
                        background: "#1a73e8", color: "white", border: "none",
                        padding: "8px 16px", borderRadius: "6px", fontSize: "13px",
                        fontWeight: "600", cursor: "pointer"
                      }}
                    >Call</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* in progress + completed */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* in progress */}
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                <span>In Progress</span>
                <span style={{ background: "#dbeafe", color: "#1e40af", padding: "2px 10px", borderRadius: "20px", fontSize: "13px" }}>{checkedIn.length}</span>
              </div>
              {checkedIn.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#999", fontSize: "14px" }}>No active patients</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {checkedIn.map(t => (
                    <div key={t.appt_id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", background: "#eff6ff", borderRadius: "10px",
                      border: "1px solid #bfdbfe"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{
                          width: "40px", height: "40px", background: "#1a73e8",
                          borderRadius: "8px", display: "flex", alignItems: "center",
                          justifyContent: "center", color: "white", fontWeight: "800", fontSize: "16px"
                        }}>{t.token_number}</div>
                        <div style={{ fontWeight: "600", color: "#0a2463", fontSize: "14px" }}>{(t.patient as any)?.name || "Patient"}</div>
                      </div>
                      <button
                        onClick={() => completeToken(t.appt_id)}
                        style={{
                          background: "#16a34a", color: "white", border: "none",
                          padding: "8px 16px", borderRadius: "6px", fontSize: "13px",
                          fontWeight: "600", cursor: "pointer"
                        }}
                      >Done ✓</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* completed count */}
            <div style={{ background: "#f0fdf4", borderRadius: "16px", padding: "24px", border: "1px solid #bbf7d0" }}>
              <div style={{ fontWeight: "700", color: "#16a34a", fontSize: "16px", marginBottom: "8px" }}>Completed Today</div>
              <div style={{ fontSize: "48px", fontWeight: "800", color: "#16a34a", lineHeight: 1 }}>{completed.length}</div>
              <div style={{ color: "#666", fontSize: "13px", marginTop: "8px" }}>patients seen today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}