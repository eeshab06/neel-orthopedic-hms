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
  const [actionError, setActionError] = useState<string | null>(null);
  const [emergency, setEmergency] = useState<EmergencyStatus | null>(null);
  const [displayMode, setDisplayMode] = useState(false);
  const [clock, setClock] = useState(new Date());
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("display") === "true") setDisplayMode(true);
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchEmergency = async () => {
    const { data } = await supabase.from("emergency_status").select("*").eq("id", 1).single();
    if (data) setEmergency(data);
  };

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from("appointment")
      .select(`appt_id, token_number, status, patient:patient_id (name, phone), slot:slot_id (start_time, end_time, slot_date)`)
      .neq("status", "cancelled")
      .order("token_number", { ascending: true });

    if (error) { console.error("[fetchTokens] error:", error); setLoading(false); return; }

    const todayData = (data || []).filter((a: any) => (a.slot as any)?.slot_date === today);
    setTokens(todayData as any);

    const inProgress = todayData.find((a: any) => a.status === "checked_in");
    if (inProgress) setCurrentToken((inProgress as any).token_number);

    setLoading(false);
  };

  useEffect(() => {
    fetchTokens();
    fetchEmergency();
    const channel = supabase.channel("appointments")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment" }, fetchTokens)
      .subscribe();
    const emergencyInterval = setInterval(fetchEmergency, 30000);
    return () => { supabase.removeChannel(channel); clearInterval(emergencyInterval); };
  }, []);

  const updateStatus = async (apptId: number, status: string): Promise<boolean> => {
    const res = await fetch("/api/token-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appt_id: apptId, status }) });
    const json = await res.json();
    if (!res.ok || json.error) { setActionError(json.error || "Update failed"); return false; }
    return true;
  };

  const callToken = async (apptId: number, tokenNo: number) => {
    setActionError(null);
    setTokens((prev) => prev.map((t) => (t.appt_id === apptId ? { ...t, status: "checked_in" } : t)));
    setCurrentToken(tokenNo);
    const ok = await updateStatus(apptId, "checked_in");
    if (!ok) { await fetchTokens(); } else { await fetchTokens(); }
  };

  const completeToken = async (apptId: number) => {
    setActionError(null);
    setTokens((prev) => prev.map((t) => (t.appt_id === apptId ? { ...t, status: "completed" } : t)));
    const ok = await updateStatus(apptId, "completed");
    if (!ok) { await fetchTokens(); } else {
      setCurrentToken((cur) => { const row = tokens.find((t) => t.appt_id === apptId); return row && cur === row.token_number ? null : cur; });
      await fetchTokens();
    }
  };

  const issueWalkIn = async () => {
    setActionError(null);
    const newToken = 144 + walkInCount + 1;
    const { data: patient, error: pErr } = await supabase.from("patient").insert({ name: `Walk-in Patient`, phone: `walkin-${Date.now()}`, dob: "1990-01-01", gender: "M" }).select("patient_id").single();
    if (pErr || !patient) { setActionError(`Walk-in failed: ${pErr?.message || "no patient created"}`); return; }
    const { data: slot, error: sErr } = await supabase.from("slot").select("slot_id").eq("slot_date", today).limit(1).single();
    if (sErr || !slot) { setActionError(`No slot found for today`); return; }
    const { error: aErr } = await supabase.from("appointment").insert({ patient_id: patient.patient_id, doctor_id: 5, slot_id: slot.slot_id, token_number: newToken, status: "booked", qr_code: `WALKIN-${newToken}` });
    if (aErr) { setActionError(`Walk-in failed: ${aErr.message}`); return; }
    setWalkInCount((prev) => prev + 1); await fetchTokens();
  };

  const waiting = tokens.filter((t) => t.status === "booked");
  const checkedIn = tokens.filter((t) => t.status === "checked_in");
  const completed = tokens.filter((t) => t.status === "completed");
  const nextUp = waiting[0];
  const hour = clock.getHours();
  const session = hour < 13 ? "Morning OPD · 10:00 AM – 1:15 PM" : "Evening OPD · 3:30 PM – 6:45 PM";
  const timeStr = clock.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
  const dateStr = clock.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

  // ── DISPLAY MODE ──────────────────────────────────────────────
  if (displayMode) {
    return (
      <div style={{ minHeight: "100vh", background: "#dbeafe", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          @keyframes fadeInUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
          @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
          @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        `}</style>

        {/* Navbar */}
        <div style={{ background: "#0a2463", padding: "0 56px", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a2463", fontWeight: "800", fontSize: "18px" }}>N</div>
            <div>
              <div style={{ color: "white", fontWeight: "700", fontSize: "17px", letterSpacing: "0.2px" }}>Neel Orthopaedic Multispeciality Hospital</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "1px" }}>Bhayander East, Mumbai</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{session}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "2px" }}>Dr. G.K. Boob — Orthopaedic & Spine Surgeon</div>
          </div>
        </div>

        {/* Emergency */}
        {emergency?.is_active && (
          <div style={{ background: "#fff1f2", borderBottom: "1px solid #fecdd3", padding: "14px 56px", display: "flex", alignItems: "center", gap: "12px", animation: "pulse 2s infinite" }}>
            <span style={{ fontSize: "18px" }}>⚠️</span>
            <span style={{ color: "#9f1239", fontWeight: "600", fontSize: "15px" }}>OPD delayed by {emergency.delay_minutes} minutes — we apologize for the inconvenience</span>
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 56px", gap: "48px" }}>

          {/* Now Serving */}
          <div style={{ textAlign: "center", animation: "fadeInUp 0.5s ease" }}>
            <div style={{ fontSize: "14px", color: "#1e40af", letterSpacing: "6px", marginBottom: "16px", fontWeight: "700" }}>NOW SERVING</div>
            {currentToken ? (
              <>
                <div style={{ fontSize: "220px", fontWeight: "800", color: "#0a2463", lineHeight: 1, letterSpacing: "-10px" }}>{currentToken}</div>
                <div style={{ color: "#1e40af", fontSize: "20px", marginTop: "16px", fontWeight: "500" }}>Please proceed to Dr. G.K. Boob's OPD</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "80px", fontWeight: "400", color: "#93c5fd", letterSpacing: "-3px" }}>—</div>
                <div style={{ color: "#93c5fd", fontSize: "18px", marginTop: "12px" }}>Waiting to begin</div>
              </>
            )}
          </div>

          {/* Please be ready */}
          {nextUp && (
            <div style={{ background: "white", border: "1.5px solid #bfdbfe", borderRadius: "20px", padding: "28px 80px", textAlign: "center", boxShadow: "0 4px 24px rgba(30,64,175,0.08)", animation: "fadeInUp 0.5s ease 0.1s both" }}>
              <div style={{ fontSize: "12px", color: "#93c5fd", letterSpacing: "5px", marginBottom: "12px", fontWeight: "700" }}>PLEASE BE READY</div>
              <div style={{ fontSize: "100px", fontWeight: "800", color: "#1e40af", lineHeight: 1, letterSpacing: "-4px" }}>{nextUp.token_number}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: "#0a2463", padding: "20px 56px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
            <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: "600" }}>{waiting.length}</span> waiting &nbsp;·&nbsp;
            <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: "600" }}>{completed.length}</span> seen today
          </div>
          <div style={{ color: "white", fontSize: "28px", fontWeight: "700", fontVariantNumeric: "tabular-nums", letterSpacing: "1px" }}>
            {timeStr}
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", textAlign: "right" }}>{dateStr}</div>
        </div>
      </div>
    );
  }

  // ── STAFF MODE ────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#eef2f7", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        button { font-family: 'DM Sans', sans-serif !important; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* Navbar */}
      <div style={{ background: "#0a2463", padding: "0 40px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a2463", fontWeight: "700", fontSize: "16px" }}>N</div>
          <span style={{ color: "white", fontWeight: "600", fontSize: "15px" }}>Neel Orthopaedic — Reception</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{completed.length} seen today</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{dateStr}</span>
          <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "13px", background: "rgba(255,255,255,0.08)", padding: "6px 14px", borderRadius: "6px", fontWeight: 500 }}>← Back</Link>
        </div>
      </div>

      <div style={{ padding: "28px 40px" }}>

        {/* Emergency */}
        {emergency?.is_active && (
          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ animation: "pulse 1.5s infinite", fontSize: "18px" }}>🚨</span>
            <div>
              <div style={{ color: "#9f1239", fontWeight: "600", fontSize: "14px" }}>OPD delayed by {emergency.delay_minutes} minutes</div>
              <div style={{ color: "#be123c", fontSize: "13px", marginTop: "2px" }}>Please arrive <strong>{emergency.delay_minutes} minutes later</strong> than scheduled.</div>
            </div>
          </div>
        )}

        {/* Error */}
        {actionError && (
          <div style={{ background: "#fff1f2", color: "#9f1239", padding: "12px 18px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #fecdd3", fontSize: "13px", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠️ {actionError}</span>
            <button onClick={() => setActionError(null)} style={{ background: "transparent", border: "none", color: "#9f1239", fontWeight: 700, cursor: "pointer", fontSize: "16px" }}>✕</button>
          </div>
        )}

        {/* Now Serving */}
        {currentToken ? (
          <div style={{ background: "#0a2463", borderRadius: "14px", padding: "28px 40px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "3px", marginBottom: "8px", fontWeight: "600" }}>NOW SERVING</div>
              <div style={{ fontSize: "72px", fontWeight: "700", color: "white", lineHeight: 1, letterSpacing: "-2px" }}>{currentToken}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginBottom: "6px" }}>Please proceed to</div>
              <div style={{ fontSize: "20px", fontWeight: "600", color: "white" }}>Dr. G.K. Boob's OPD</div>
              <div style={{ marginTop: "10px", background: "rgba(255,255,255,0.08)", borderRadius: "6px", padding: "5px 12px", display: "inline-block" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{waiting.length} waiting · {checkedIn.length} in progress</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "14px", padding: "22px 40px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "14px", border: "1px solid #e3e6ef", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ width: "8px", height: "8px", background: "#86efac", borderRadius: "50%" }}></div>
            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>No patient currently being seen — call the next token to begin</span>
          </div>
        )}

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* Waiting */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e3e6ef", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", minHeight: "calc(100vh - 300px)" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "600", color: "#0a2463", fontSize: "15px" }}>Waiting</span>
              <span style={{ background: "#fffbeb", color: "#854d0e", border: "1px solid #fde68a", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>{waiting.length} patients</span>
            </div>
            <div style={{ padding: "16px 24px" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: "14px" }}>Loading...</div>
              ) : waiting.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: "14px" }}>No patients waiting</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "480px", overflowY: "auto" }}>
                  {waiting.map(t => (
                    <div key={t.appt_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e3e6ef" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "40px", height: "40px", background: t.token_number >= 145 ? "#fffbeb" : "#eff6ff", border: `1px solid ${t.token_number >= 145 ? "#fde68a" : "#bfdbfe"}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: t.token_number >= 145 ? "#854d0e" : "#1e40af", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>
                          {t.token_number}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "14px" }}>{(t.patient as any)?.name || "Patient"}</div>
                          <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>
                            {(t.patient as any)?.phone}
                            {t.token_number >= 145 && <span style={{ marginLeft: "8px", background: "#fffbeb", color: "#854d0e", border: "1px solid #fde68a", fontSize: "10px", fontWeight: "600", padding: "1px 7px", borderRadius: "4px" }}>Walk-in</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => callToken(t.appt_id, t.token_number)}
                        style={{ background: "#0a2463", color: "white", border: "none", padding: "8px 20px", borderRadius: "7px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                        Call
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* In Progress */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e3e6ef", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", minHeight: "calc(100vh - 300px)" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "600", color: "#0a2463", fontSize: "15px" }}>In Progress</span>
              <span style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>{checkedIn.length} active</span>
            </div>
            <div style={{ padding: "16px 24px" }}>
              {checkedIn.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: "14px" }}>No active patients</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {checkedIn.map(t => (
                    <div key={t.appt_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "40px", height: "40px", background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e40af", fontWeight: "700", fontSize: "14px" }}>
                          {t.token_number}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "14px" }}>{(t.patient as any)?.name || "Patient"}</div>
                          <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>With Dr. G.K. Boob</div>
                        </div>
                      </div>
                      <button onClick={() => completeToken(t.appt_id)}
                        style={{ background: "white", color: "#166534", border: "1px solid #bbf7d0", padding: "8px 20px", borderRadius: "7px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                        Done ✓
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "white", borderRadius: "10px", border: "1px solid #e3e6ef" }}>
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            <span style={{ fontWeight: "600", color: "#0a2463" }}>{completed.length}</span> patients seen today
          </span>
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>
            Patients can check status at <strong style={{ color: "#1e40af" }}>localhost:3000/status</strong>
          </span>
        </div>
      </div>
    </div>
  );
}