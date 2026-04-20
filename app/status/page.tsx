"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface EmergencyStatus {
  is_active: boolean;
  delay_minutes: number;
  message: string;
  updated_at: string;
}

export default function StatusPage() {
  const [status, setStatus] = useState<EmergencyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    const { data } = await supabase.from("emergency_status").select("*").eq("id", 1).single();
    if (data) setStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    // Refresh every 30 seconds automatically
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getDelayedTime = (delayMins: number) => {
    const start = new Date();
    start.setHours(10, 0, 0, 0);
    start.setMinutes(start.getMinutes() + delayMins);
    return start.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const updatedTime = status?.updated_at
    ? new Date(status.updated_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
    : "";

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
      `}</style>

      {/* Navbar */}
      <nav style={{ background: "linear-gradient(135deg, #0a1628, #1a2f6e)", padding: "0 6%", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #1a56db, #60a5fa)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "900", fontSize: "18px", fontFamily: "'Playfair Display', serif" }}>N</div>
          <span style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>Neel Orthopaedic</span>
        </div>
        <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "14px", background: "rgba(255,255,255,0.08)", padding: "7px 16px", borderRadius: "8px" }}>← Home</Link>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 6%" }}>
        <div style={{ width: "100%", maxWidth: "600px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: "900", color: "#030a1e", letterSpacing: "-1.5px", marginBottom: "8px" }}>OPD Status</h1>
            <p style={{ color: "#9ca3af", fontSize: "15px" }}>Live OPD status for Neel Orthopaedic Hospital</p>
          </div>

          {loading ? (
            <div style={{ background: "white", borderRadius: "24px", padding: "60px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <div style={{ width: "40px", height: "40px", border: "3px solid #e0e7ff", borderTopColor: "#1a56db", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "#9ca3af", fontSize: "15px" }}>Checking status...</p>
            </div>
          ) : status?.is_active ? (
            /* EMERGENCY ACTIVE */
            <div style={{ background: "linear-gradient(135deg, #7f1d1d, #dc2626)", borderRadius: "24px", padding: "44px", boxShadow: "0 8px 40px rgba(220,38,38,0.35)", textAlign: "center" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px", animation: "pulse 1.5s infinite" }}>🚨</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "900", marginBottom: "16px", letterSpacing: "-1px" }}>
                OPD Delayed
              </h2>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px" }}>
                <p style={{ color: "white", fontSize: "18px", fontWeight: "700", margin: "0 0 8px" }}>
                  🚨 OPD delayed by {status.delay_minutes} minutes due to an emergency case. We apologize for the inconvenience.
                </p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
               <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", margin: 0 }}>
  📅 Please arrive <strong>{status.delay_minutes} minutes later</strong> than your scheduled appointment time.
</p>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: 0 }}>
                Last updated at {updatedTime} · Page refreshes automatically
              </p>
            </div>
          ) : (
            /* ALL CLEAR */
            <div style={{ background: "white", borderRadius: "24px", padding: "44px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>✅</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#030a1e", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "900", marginBottom: "16px", letterSpacing: "-1px" }}>
                OPD Running on Time
              </h2>
              <div style={{ background: "#f0fdf4", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px", border: "1px solid #bbf7d0" }}>
                <p style={{ color: "#16a34a", fontSize: "18px", fontWeight: "700", margin: "0 0 4px" }}>No delays reported</p>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Please arrive at your scheduled time</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
                <div style={{ background: "#f8faff", borderRadius: "12px", padding: "16px", border: "1px solid #e0e7ff" }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>🌅</div>
                  <div style={{ fontWeight: "700", color: "#030a1e", fontSize: "14px" }}>Morning OPD</div>
                  <div style={{ color: "#9ca3af", fontSize: "13px" }}>10:00 AM – 1:15 PM</div>
                </div>
                <div style={{ background: "#f8faff", borderRadius: "12px", padding: "16px", border: "1px solid #e0e7ff" }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>🌆</div>
                  <div style={{ fontWeight: "700", color: "#030a1e", fontSize: "14px" }}>Evening OPD</div>
                  <div style={{ color: "#9ca3af", fontSize: "13px" }}>3:30 PM – 6:45 PM</div>
                </div>
              </div>
              <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
                Last checked at {updatedTime || new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })} · Page refreshes every 30 seconds
              </p>
            </div>
          )}

          {/* Book CTA */}
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <Link href="/book" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", textDecoration: "none", padding: "14px 28px", borderRadius: "30px", fontSize: "15px", fontWeight: "700", boxShadow: "0 4px 16px rgba(26,86,219,0.3)" }}>
              Book OPD Appointment →
            </Link>
            <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "12px" }}>
              📞 Emergency: +91 70210 94941
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}