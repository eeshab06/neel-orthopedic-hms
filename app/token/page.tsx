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

interface EmergencyStatus {
  is_active: boolean;
  delay_minutes: number;
  message: string;
}

export default function TokenDisplay() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentToken, setCurrentToken] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [walkInCount, setWalkInCount] = useState(0);
  const [issuing, setIssuing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [emergency, setEmergency] = useState<EmergencyStatus | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const fetchEmergency = async () => {
    const { data } = await supabase.from("emergency_status").select("*").eq("id", 1).single();
    if (data) setEmergency(data);
  };

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from("appointment")
      .select(
        `appt_id, token_number, status,
         patient:patient_id (name, phone),
         slot:slot_id (start_time, end_time, slot_date)`
      )
      .neq("status", "cancelled")
      .order("token_number", { ascending: true });

    if (error) {
      console.error("[fetchTokens] error:", error);
      setLoading(false);
      return;
    }

    // Filter to today client-side
    const todayData = (data || []).filter(
      (a: any) => (a.slot as any)?.slot_date === today
    );
    setTokens(todayData as any);

    // Restore "Now Serving" banner if someone is already checked_in
    const inProgress = todayData.find((a: any) => a.status === "checked_in");
    if (inProgress) setCurrentToken((inProgress as any).token_number);

    setLoading(false);
  };

  useEffect(() => {
    fetchTokens();
    fetchEmergency();
    const channel = supabase
      .channel("appointments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointment" },
        fetchTokens
      )
      .subscribe();
    // Refresh emergency status every 30 seconds
    const emergencyInterval = setInterval(fetchEmergency, 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(emergencyInterval);
    };
  }, []);

  // Central function: calls API route (service role = bypasses RLS)
  const updateStatus = async (apptId: number, status: string): Promise<boolean> => {
    const res = await fetch("/api/token-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appt_id: apptId, status }),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      setActionError(json.error || "Update failed");
      return false;
    }
    return true;
  };

  const callToken = async (apptId: number, tokenNo: number) => {
    setActionError(null);
    // Optimistic UI
    setTokens((prev) =>
      prev.map((t) => (t.appt_id === apptId ? { ...t, status: "checked_in" } : t))
    );
    setCurrentToken(tokenNo);

    const ok = await updateStatus(apptId, "checked_in");
    if (!ok) {
      await fetchTokens(); // rollback on failure
    } else {
      await fetchTokens(); // confirm from DB
    }
  };

  const completeToken = async (apptId: number) => {
    setActionError(null);
    // Optimistic UI
    setTokens((prev) =>
      prev.map((t) => (t.appt_id === apptId ? { ...t, status: "completed" } : t))
    );

    const ok = await updateStatus(apptId, "completed");
    if (!ok) {
      await fetchTokens();
    } else {
      // Clear "Now Serving" if this was the active patient
      setCurrentToken((cur) => {
        const row = tokens.find((t) => t.appt_id === apptId);
        return row && cur === row.token_number ? null : cur;
      });
      await fetchTokens();
    }
  };

  const issueWalkIn = async () => {
    setIssuing(true);
    setActionError(null);
    const newToken = 144 + walkInCount + 1;

    const { data: patient, error: pErr } = await supabase
      .from("patient")
      .insert({ name: `Walk-in Patient`, phone: `walkin-${Date.now()}`, dob: "1990-01-01", gender: "M" })
      .select("patient_id")
      .single();

    if (pErr || !patient) {
      setActionError(`Walk-in failed: ${pErr?.message || "no patient created"}`);
      setIssuing(false);
      return;
    }

    const { data: slot, error: sErr } = await supabase
      .from("slot")
      .select("slot_id")
      .eq("slot_date", today)
      .limit(1)
      .single();

    if (sErr || !slot) {
      setActionError(`No slot found for today: ${sErr?.message || ""}`);
      setIssuing(false);
      return;
    }

    const { error: aErr } = await supabase.from("appointment").insert({
      patient_id: patient.patient_id,
      doctor_id: 5,
      slot_id: slot.slot_id,
      token_number: newToken,
      status: "booked",
      qr_code: `WALKIN-${newToken}`,
    });

    if (aErr) {
      setActionError(`Walk-in appointment failed: ${aErr.message}`);
      setIssuing(false);
      return;
    }

    setWalkInCount((prev) => prev + 1);
    await fetchTokens();
    setIssuing(false);
  };

  const waiting = tokens.filter((t) => t.status === "booked");
  const checkedIn = tokens.filter((t) => t.status === "checked_in");
  const completed = tokens.filter((t) => t.status === "completed");

  // Calculate delayed time example
  const getDelayedTime = (delayMins: number) => {
    const start = new Date();
    start.setHours(10, 0, 0, 0);
    start.setMinutes(start.getMinutes() + delayMins);
    return start.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input, select, textarea { color: #030a1e !important; font-size: 15px !important; font-family: 'Inter', sans-serif !important; }
        input::placeholder { color: #9ca3af !important; }
        button { font-family: 'Inter', sans-serif !important; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a1628, #1a2f6e)", padding: "0 5%", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 16px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #1a56db, #60a5fa)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "900", fontSize: "20px", fontFamily: "'Playfair Display', serif" }}>N</div>
          <div style={{ color: "white", fontWeight: "700", fontSize: "18px", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.3px" }}>Neel Orthopaedic — Reception Screen</div>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "13px", background: "rgba(255,255,255,0.08)", padding: "7px 16px", borderRadius: "8px", fontWeight: 600 }}>← Back</Link>
        </div>
      </div>

      <div style={{ padding: "28px 5%" }}>

        {/* Emergency Banner */}
        {emergency?.is_active && (
          <div style={{ background: "linear-gradient(135deg, #7f1d1d, #dc2626)", borderRadius: "16px", padding: "20px 28px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 4px 20px rgba(220,38,38,0.4)", flexWrap: "wrap" }}>
            <div style={{ fontSize: "32px", animation: "pulse 1.5s infinite" }}>🚨</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "white", fontWeight: "800", fontSize: "18px", fontFamily: "'Playfair Display', serif", marginBottom: "4px" }}>
                OPD Delayed by {emergency.delay_minutes} Minutes
              </div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px" }}>
                🚨 OPD delayed by {emergency.delay_minutes} minutes due to an emergency case. We apologize for the inconvenience.
              </div>
             <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginTop: "6px" }}>
  Please arrive <strong style={{ color: "white" }}>{emergency.delay_minutes} minutes later</strong> than your scheduled appointment time.
</div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {actionError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", border: "1.5px solid #fca5a5", fontSize: "14px", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠️ {actionError}</span>
            <button onClick={() => setActionError(null)} style={{ background: "transparent", border: "none", color: "#991b1b", fontWeight: 700, cursor: "pointer", fontSize: "18px" }}>✕</button>
          </div>
        )}

        {/* Now Serving Banner */}
        {currentToken && (
          <div style={{ background: "linear-gradient(135deg, #0a1628, #1a2f6e)", color: "white", borderRadius: "20px", padding: "28px 44px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 8px 32px rgba(10,22,40,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ position: "absolute", bottom: "-30px", left: "40%", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(96,165,250,0.06)" }} />
            <div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", letterSpacing: "3.5px", marginBottom: "8px", fontWeight: "700" }}>NOW SERVING</div>
              <div style={{ fontSize: "76px", fontWeight: "900", lineHeight: 1, fontFamily: "'Playfair Display', serif", letterSpacing: "-3px" }}>Token {currentToken}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", marginBottom: "6px" }}>Please proceed to</div>
              <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "'Playfair Display', serif" }}>Dr. G.K. Boob's OPD</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Today", value: tokens.length, bg: "linear-gradient(135deg,#0f2d6b,#1a56db)" },
            { label: "Waiting", value: waiting.length, bg: "linear-gradient(135deg,#78350f,#d97706)" },
            { label: "In Progress", value: checkedIn.length, bg: "linear-gradient(135deg,#0c4a6e,#0ea5e9)" },
            { label: "Completed", value: completed.length, bg: "linear-gradient(135deg,#064e3b,#10b981)" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: "18px", padding: "22px 26px", color: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, opacity: 0.7, marginBottom: "10px", letterSpacing: "0.3px" }}>{s.label}</div>
              <div style={{ fontSize: "48px", fontWeight: "900", fontFamily: "'Playfair Display', serif", letterSpacing: "-2px", lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Token Lists */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* Waiting */}
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "2px solid #f0f4ff" }}>
              <div style={{ fontWeight: "800", color: "#030a1e", fontSize: "20px", fontFamily: "'Playfair Display', serif" }}>Waiting</div>
              <span style={{ background: "#fef3c7", color: "#92400e", padding: "5px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "700" }}>{waiting.length}</span>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "15px" }}>Loading...</div>
            ) : waiting.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "15px" }}>No patients waiting</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "500px", overflowY: "auto" }}>
                {waiting.map(t => (
                  <div key={t.appt_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#f8faff", borderRadius: "14px", border: "1.5px solid #e0e7ff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "46px", height: "46px", background: t.token_number >= 145 ? "linear-gradient(135deg,#78350f,#d97706)" : "linear-gradient(135deg,#0f2d6b,#1a56db)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "900", fontSize: "16px", flexShrink: 0, fontFamily: "'Playfair Display', serif" }}>
                        {t.token_number}
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", color: "#030a1e", fontSize: "15px", marginBottom: "2px" }}>{(t.patient as any)?.name || "Patient"}</div>
                        <div style={{ color: "#9ca3af", fontSize: "13px" }}>
                          {(t.patient as any)?.phone}
                          {t.token_number >= 145 && <span style={{ marginLeft: "8px", background: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px" }}>WALK-IN</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => callToken(t.appt_id, t.token_number)}
                      style={{ background: "linear-gradient(135deg,#0f2d6b,#1a56db)", color: "white", border: "none", padding: "9px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(26,86,219,0.3)" }}>
                      Call
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* In Progress + Completed */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "white", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "2px solid #f0f4ff" }}>
                <div style={{ fontWeight: "800", color: "#030a1e", fontSize: "20px", fontFamily: "'Playfair Display', serif" }}>In Progress</div>
                <span style={{ background: "#dbeafe", color: "#1e40af", padding: "5px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "700" }}>{checkedIn.length}</span>
              </div>
              {checkedIn.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#9ca3af", fontSize: "15px" }}>No active patients</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {checkedIn.map(t => (
                    <div key={t.appt_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#eff6ff", borderRadius: "14px", border: "1.5px solid #bfdbfe" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: "46px", height: "46px", background: "linear-gradient(135deg,#0c4a6e,#0ea5e9)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "900", fontSize: "16px", fontFamily: "'Playfair Display', serif" }}>
                          {t.token_number}
                        </div>
                        <div style={{ fontWeight: "700", color: "#030a1e", fontSize: "15px" }}>{(t.patient as any)?.name || "Patient"}</div>
                      </div>
                      <button onClick={() => completeToken(t.appt_id)}
                        style={{ background: "linear-gradient(135deg,#064e3b,#10b981)", color: "white", border: "none", padding: "9px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(16,185,129,0.3)" }}>
                        Done ✓
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: "linear-gradient(135deg,#064e3b,#10b981)", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(16,185,129,0.25)" }}>
              <div style={{ fontWeight: "800", color: "rgba(255,255,255,0.85)", fontSize: "17px", marginBottom: "10px", fontFamily: "'Playfair Display', serif" }}>Completed Today</div>
              <div style={{ fontSize: "60px", fontWeight: "900", color: "white", lineHeight: 1, fontFamily: "'Playfair Display', serif", letterSpacing: "-2px" }}>{completed.length}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginTop: "10px", fontWeight: 500 }}>patients seen today</div>
            </div>
          </div>
        </div>

        {/* Status page notice */}
        <div style={{ textAlign: "center", marginTop: "24px", padding: "14px", background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(10,36,99,0.05)" }}>
          <span style={{ color: "#9ca3af", fontSize: "13px" }}>
            📱 Patients can check real-time OPD status at <strong style={{ color: "#1a56db" }}>yoursite.vercel.app/status</strong> before leaving home
          </span>
        </div>

      </div>
    </div>
  );
}