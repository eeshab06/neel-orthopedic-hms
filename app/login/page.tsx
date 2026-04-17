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

const ROLE_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  doctor:    { label: "Doctor",    icon: "👨‍⚕️", desc: "Dr. G.K. Boob Portal" },
  admin:     { label: "Admin",     icon: "🔐", desc: "Hospital Administration" },
  staff:     { label: "Staff",     icon: "🏥", desc: "Rooms, Stock, IPD" },
  reception: { label: "Reception", icon: "📋", desc: "Reception & OPD" },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    if (roleError || !roleData) {
      setError("Account setup incomplete. Contact admin.");
      setLoading(false);
      return;
    }

    router.push(ROLE_REDIRECTS[roleData.role] || "/");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a2463 0%, #1a73e8 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia, serif",
      padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 70, height: 70, background: "#fff", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
            <span style={{ fontSize: 36 }}>🏥</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Neel Orthopaedic Hospital</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0 }}>Staff Portal — Secure Login</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          <h2 style={{ color: "#0a2463", fontSize: 20, fontWeight: 700, margin: "0 0 24px", textAlign: "center" }}>Sign In</h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="e.g. doctor@neelortho.com" required
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e7ff", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" required
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e7ff", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
            </div>

            {error && (
              <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "13px", background: loading ? "#94a3b8" : "#0a2463", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "Georgia, serif" }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div style={{ marginTop: 28, borderTop: "1px solid #f0f4ff", paddingTop: 20 }}>
            <p style={{ fontSize: 12, color: "#888", textAlign: "center", marginBottom: 12 }}>Staff access levels:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(ROLE_LABELS).map(([role, info]) => (
                <div key={role} style={{ background: "#f8faff", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{info.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0a2463" }}>{info.label}</div>
                    <div style={{ fontSize: 10, color: "#888" }}>{info.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 20 }}>
          © 2026 Neel Orthopaedic Hospital. All rights reserved.
        </p>
      </div>
    </div>
  );
}