"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ROLE_REDIRECTS: Record<string, string> = {
  doctor:    "/doctor",
  admin:     "/admin",
  staff:     "/rooms",
  reception: "/reception",
};

const ROLE_LABELS: Record<string, { label: string; icon: string; desc: string; color: string; bg: string }> = {
  doctor:    { label: "Doctor",    icon: "👨‍⚕️", desc: "Dr. G.K. Boob Portal",    color: "#1a56db", bg: "#eff6ff" },
  admin:     { label: "Admin",     icon: "🔐", desc: "Hospital Administration",  color: "#7c3aed", bg: "#f5f3ff" },
  staff:     { label: "Staff",     icon: "🏥", desc: "Rooms, Stock & IPD",       color: "#059669", bg: "#ecfdf5" },
  reception: { label: "Reception", icon: "📋", desc: "Reception & OPD Queue",    color: "#d97706", bg: "#fffbeb" },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError("Invalid email or password. Please try again."); setLoading(false); return; }
    const { data: roleData, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).single();
    if (roleError || !roleData) { setError("Account setup incomplete. Contact admin."); setLoading(false); return; }
    router.push(ROLE_REDIRECTS[roleData.role] || "/");
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", border: "1.5px solid #e0e7ff",
    borderRadius: "12px", fontSize: "16px", outline: "none",
    boxSizing: "border-box", fontFamily: "'Inter', sans-serif",
    color: "#030a1e", background: "white", transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #1a2f6e 50%, #0f4c8a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, serif", padding: "20px", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        .display-font { font-family: 'Playfair Display', Georgia, serif !important; }
        .body-font { font-family: 'Inter', sans-serif !important; }
        input { color: #030a1e !important; }
        input::placeholder { color: #9ca3af !important; }
        input:focus { border-color: #1a56db !important; box-shadow: 0 0 0 3px rgba(26,86,219,0.1) !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeUp 0.6s ease forwards; }
      `}</style>

      {/* Blobs */}
      <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,86,219,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="fade-in" style={{ width: "100%", maxWidth: "460px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "72px", height: "72px", background: "linear-gradient(135deg, #1a56db, #60a5fa)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 12px 32px rgba(26,86,219,0.4)", color: "white", fontSize: "32px", fontWeight: "900", fontFamily: "'Inter', sans-serif" }}>N</div>
          <h1 className="display-font" style={{ color: "white", fontSize: "28px", fontWeight: "900", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Neel Orthopaedic</h1>
          <p className="body-font" style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", margin: 0 }}>Multispeciality Hospital · Staff Portal</p>
        </div>

        {/* Card */}
        <div style={{ background: "white", borderRadius: "24px", padding: "44px 40px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
          <h2 className="display-font" style={{ color: "#030a1e", fontSize: "26px", fontWeight: "900", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Welcome back</h2>
          <p className="body-font" style={{ color: "#9ca3af", fontSize: "15px", margin: "0 0 32px" }}>Sign in to access the hospital portal</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label className="body-font" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="e.g. doctor@neelortho.com" required style={inp} />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label className="body-font" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required style={{ ...inp, paddingRight: "50px" }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#9ca3af" }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="body-font" style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#dc2626", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="body-font"
              style={{ width: "100%", padding: "15px", background: loading ? "#e5e7eb" : "linear-gradient(135deg, #0f2d6b, #1a56db)", color: loading ? "#9ca3af" : "white", border: "none", borderRadius: "14px", fontSize: "17px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 6px 20px rgba(26,86,219,0.35)", transition: "all 0.2s" }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Role cards */}
          <div style={{ marginTop: "32px", paddingTop: "28px", borderTop: "1px solid #f0f4ff" }}>
            <p className="body-font" style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginBottom: "14px", letterSpacing: "1px", fontWeight: "600" }}>STAFF ACCESS LEVELS</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {Object.entries(ROLE_LABELS).map(([role, info]) => (
                <div key={role} style={{ background: info.bg, borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", border: `1px solid ${info.color}20` }}>
                  <span style={{ fontSize: "20px" }}>{info.icon}</span>
                  <div>
                    <div className="body-font" style={{ fontSize: "13px", fontWeight: "700", color: info.color }}>{info.label}</div>
                    <div className="body-font" style={{ fontSize: "11px", color: "#9ca3af", marginTop: "1px" }}>{info.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="body-font" style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "13px", marginTop: "24px" }}>
          © 2026 Neel Orthopaedic Multispeciality Hospital
        </p>
      </div>
    </div>
  );
}