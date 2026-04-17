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

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "Georgia, serif" }}>
      <PublicNavbar />

      {/* hero */}
      <div style={{ background: "linear-gradient(135deg, #0a2463 0%, #1a3a8f 100%)", padding: "80px 5%", textAlign: "center" }}>
        <div style={{ fontSize: "12px", color: "#90caf9", letterSpacing: "2px", fontWeight: "600", marginBottom: "16px" }}>GET IN TOUCH</div>
        <h1 style={{ color: "white", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: "700", marginBottom: "16px" }}>Contact Us</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", maxWidth: "480px", margin: "0 auto", lineHeight: "1.7", fontWeight: "300" }}>
          We're here to help. Reach out for appointments, queries, or emergencies.
        </p>
      </div>

      <div style={{ padding: "80px 5%", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0a2463", marginBottom: "32px" }}>Hospital Information</h2>
            {[
              { icon: "📍", title: "Address", lines: ["1st Floor, Shrinath Apartment,", "Goddev Naka, B.P. Road,", "Bhayander East, Thane,", "Mumbai — 401105, Maharashtra"] },
              { icon: "📞", title: "Phone", lines: ["+91 70210 94941", "+91 95943 14023"] },
              { icon: "🕐", title: "OPD Timings", lines: ["Morning: 10:00 AM – 1:15 PM", "Evening: 3:30 PM – 6:45 PM", "Days: Monday – Sunday"] },
              { icon: "🚨", title: "Emergency", lines: ["Available 24 hours, 7 days a week", "Call: +91 70210 94941"] },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
                <div style={{ fontSize: "24px", flexShrink: 0, marginTop: "2px" }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px", marginBottom: "8px" }}>{item.title}</div>
                  {item.lines.map((line, j) => (
                    <div key={j} style={{ color: "#555", fontSize: "14px", lineHeight: "1.8" }}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ background: "#f0f4ff", borderRadius: "16px", padding: "24px", border: "1px solid #e0e7ff" }}>
              <div style={{ fontWeight: "700", color: "#0a2463", marginBottom: "8px" }}>📍 Find us on Google Maps</div>
              <a href="https://maps.google.com/?q=Neel+Orthopaedic+Multispeciality+Hospital+Goddev+Naka+Bhayander+East+Mumbai"
                target="_blank" rel="noopener noreferrer"
                style={{ color: "#1a73e8", fontSize: "14px", textDecoration: "none", fontWeight: "600" }}>
                Open in Google Maps →
              </a>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0a2463", marginBottom: "8px" }}>Send an Enquiry</h2>
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "28px" }}>We'll get back to you within 24 hours.</p>
            {sent ? (
              <div style={{ background: "#f0fdf4", borderRadius: "16px", padding: "40px", textAlign: "center", border: "2px solid #bbf7d0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                <div style={{ fontWeight: "700", color: "#16a34a", fontSize: "20px", marginBottom: "8px" }}>Message Sent!</div>
                <div style={{ color: "#666", fontSize: "14px" }}>We'll contact you at {form.phone} shortly.</div>
                <button onClick={() => { setForm({ name: "", phone: "", message: "" }); setSent(false); }}
                  style={{ marginTop: "20px", background: "#0a2463", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                  Send another
                </button>
              </div>
            ) : (
              <div style={{ background: "#f8f9fc", borderRadius: "16px", padding: "32px", border: "1px solid #e8edf5" }}>
                {[
                  { label: "Your Name *", key: "name", type: "text", placeholder: "Full name" },
                  { label: "Phone Number *", key: "phone", type: "tel", placeholder: "10-digit mobile number" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1.5px solid #e0e7ff", fontSize: "15px", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Message *</label>
                  <textarea placeholder="How can we help you?" rows={5} value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1.5px solid #e0e7ff", fontSize: "15px", fontFamily: "Georgia, serif", boxSizing: "border-box", resize: "vertical" }} />
                </div>
                <button onClick={handleSubmit} disabled={sending || !form.name || !form.phone || !form.message}
                  style={{ width: "100%", padding: "14px", background: sending || !form.name || !form.phone || !form.message ? "#94a3b8" : "#0a2463", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", fontFamily: "Georgia, serif" }}>
                  {sending ? "Sending..." : "Send Message →"}
                </button>
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <div style={{ color: "#888", fontSize: "13px", marginBottom: "8px" }}>Or book directly</div>
                  <Link href="/book" style={{ color: "#1a73e8", fontWeight: "700", textDecoration: "none", fontSize: "14px" }}>Book OPD Appointment →</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "#06142e", padding: "24px 5%", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
        © 2026 Neel Orthopaedic Multispeciality Hospital — pain to painless
      </div>
    </div>
  );
}