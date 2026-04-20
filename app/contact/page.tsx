"use client";
import PublicNavbar from "@/components/PublicNavbar";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.message) return;
    setSending(true);
    await supabase.from("contact_enquiry").insert({ name: form.name, phone: form.phone, message: form.message });
    setSent(true);
    setSending(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1.5px solid #e0e7ff",
    fontSize: "15px",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
    color: "#030a1e",
    background: "white",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef2ff", fontFamily: "Georgia, serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .display-font { font-family: 'Playfair Display', Georgia, serif !important; }
        .body-font { font-family: 'Inter', sans-serif !important; }
        input::placeholder, textarea::placeholder { color: #9ca3af !important; }
        input { color: #030a1e !important; }
        textarea { color: #030a1e !important; resize: vertical; }
        input:focus, textarea:focus { border-color: #1a56db !important; box-shadow: 0 0 0 3px rgba(26,86,219,0.08) !important; }
        @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <PublicNavbar />

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a1628 0%, #1a2f6e 50%, #0f4c8a 100%)",
        padding: "110px 5% 80px", textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "-80px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
          <div className="body-font" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#93c5fd", padding: "8px 20px", borderRadius: "30px", fontSize: "12px", letterSpacing: "2.5px", marginBottom: "28px", fontWeight: "600" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", display: "inline-block", boxShadow: "0 0 8px #34d399" }} />
            GET IN TOUCH
          </div>
          <h1 className="display-font" style={{ fontSize: "clamp(44px, 6vw, 80px)", fontWeight: "900", lineHeight: "1.05", letterSpacing: "-3px", marginBottom: "24px" }}>
            <span style={{ background: "linear-gradient(135deg, #93c5fd 0%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Contact Us
            </span>
          </h1>
          <p className="body-font" style={{ color: "rgba(255,255,255,0.65)", fontSize: "18px", lineHeight: "1.8" }}>
            We're here to help. Reach out for appointments, queries, or emergencies.
          </p>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ padding: "80px 5% 100px", maxWidth: "1100px", margin: "0 auto" }}>
        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>

          {/* Left: Info cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: "📍", title: "ADDRESS", color: "#1a56db", bg: "#eff6ff", lines: ["1st Floor, Shrinath Apartment,", "Goddev Naka, B.P. Road,", "Bhayander East, Thane,", "Mumbai — 401105, Maharashtra"] },
              { icon: "📞", title: "PHONE", color: "#059669", bg: "#ecfdf5", lines: ["+91 70210 94941", "+91 95943 14023"] },
              { icon: "🕐", title: "OPD TIMINGS", color: "#7c3aed", bg: "#f5f3ff", lines: ["Mon–Sat Morning: 10:00 AM – 1:15 PM", "Mon–Sat Evening: 3:30 PM – 6:45 PM", "Sunday Morning only: 10:00 AM – 1:00 PM"] },
              { icon: "🚨", title: "EMERGENCY", color: "#dc2626", bg: "#fff1f2", lines: ["Available 24 hours, 7 days a week", "Call: +91 70210 94941"] },
            ].map((item, i) => (
              <div key={i} style={{ background: "white", borderRadius: "18px", padding: "22px 26px", border: "1px solid #e8edf5", boxShadow: "0 2px 12px rgba(10,36,99,0.04)", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "13px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div className="body-font" style={{ fontWeight: "700", color: item.color, fontSize: "10px", letterSpacing: "2px", marginBottom: "8px" }}>{item.title}</div>
                  {item.lines.map((line, j) => (
                    <div key={j} className="body-font" style={{ color: "#374151", fontSize: "14px", lineHeight: "1.8" }}>{line}</div>
                  ))}
                </div>
              </div>
            ))}

            <a href="https://maps.app.goo.gl/1SzWbWRuMnLrNidV8"
              target="_blank" rel="noopener noreferrer" className="body-font"
              style={{ display: "flex", alignItems: "center", gap: "14px", background: "linear-gradient(135deg, #0f2d6b, #1a56db)", borderRadius: "18px", padding: "20px 26px", textDecoration: "none", transition: "all 0.2s", boxShadow: "0 4px 16px rgba(26,86,219,0.25)" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
              <div style={{ fontSize: "26px" }}>📍</div>
              <div>
                <div style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>Open in Google Maps</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginTop: "2px" }}>Get directions to the hospital →</div>
              </div>
            </a>
          </div>

          {/* Right: Form */}
          <div style={{ background: "white", borderRadius: "24px", padding: "40px", boxShadow: "0 4px 24px rgba(10,36,99,0.07)", border: "1px solid #e8edf5" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "56px", marginBottom: "20px" }}>✅</div>
                <h3 className="display-font" style={{ color: "#030a1e", fontSize: "28px", fontWeight: "900", marginBottom: "10px" }}>Message Sent!</h3>
                <p className="body-font" style={{ color: "#6b7280", fontSize: "15px", marginBottom: "28px", lineHeight: "1.7" }}>
                  We'll contact you at <strong style={{ color: "#030a1e" }}>{form.phone}</strong> shortly.
                </p>
                <button onClick={() => { setForm({ name: "", phone: "", message: "" }); setSent(false); }}
                  className="body-font"
                  style={{ background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", padding: "13px 28px", borderRadius: "32px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "32px" }}>
                  <h2 className="display-font" style={{ color: "#030a1e", fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px", marginBottom: "8px" }}>Send an Enquiry</h2>
                  <p className="body-font" style={{ color: "#9ca3af", fontSize: "14px" }}>We'll get back to you within 24 hours.</p>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label className="body-font" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Your Name *</label>
                  <input type="text" placeholder="e.g. Rahul Sharma" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={inputStyle} />
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label className="body-font" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Phone Number *</label>
                  <input type="tel" placeholder="10-digit mobile number" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    style={inputStyle} />
                </div>

                <div style={{ marginBottom: "28px" }}>
                  <label className="body-font" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Message *</label>
                  <textarea placeholder="How can we help you?" rows={5} value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={inputStyle} />
                </div>

                <button onClick={handleSubmit}
                  disabled={sending || !form.name || !form.phone || !form.message}
                  className="body-font"
                  style={{
                    width: "100%", padding: "15px", border: "none", borderRadius: "14px",
                    fontSize: "16px", fontWeight: "700", cursor: sending || !form.name || !form.phone || !form.message ? "not-allowed" : "pointer",
                    background: sending || !form.name || !form.phone || !form.message ? "#e5e7eb" : "linear-gradient(135deg, #0f2d6b, #1a56db)",
                    color: sending || !form.name || !form.phone || !form.message ? "#9ca3af" : "white",
                    transition: "all 0.2s",
                    boxShadow: sending || !form.name || !form.phone || !form.message ? "none" : "0 4px 16px rgba(26,86,219,0.3)",
                  }}>
                  {sending ? "Sending..." : "Send Message →"}
                </button>

                <div style={{ marginTop: "20px", textAlign: "center", paddingTop: "20px", borderTop: "1px solid #f0f4ff" }}>
                  <p className="body-font" style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "8px" }}>Or book directly</p>
                  <Link href="/book" className="body-font" style={{ color: "#1a56db", fontWeight: "700", textDecoration: "none", fontSize: "15px" }}>
                    Book OPD Appointment →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "#020710", padding: "24px 5%", textAlign: "center" }}>
        <span className="body-font" style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
          © 2026 Neel Orthopaedic Multispeciality Hospital · pain to painless
        </span>
      </div>
    </div>
  );
}