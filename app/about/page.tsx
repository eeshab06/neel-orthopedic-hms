"use client";
import PublicNavbar from "@/components/PublicNavbar";
import Link from "next/link";

const facilities = [
  { icon: "🏥", title: "Modern OT", desc: "State-of-the-art operation theatres with VELYS™ robotic system" },
  { icon: "🛏️", title: "AC Rooms", desc: "Comfortable AC rooms from economy ward to single deluxe" },
  { icon: "🚨", title: "ICU", desc: "3-bed ICU with round-the-clock critical care monitoring" },
  { icon: "💊", title: "In-house Pharmacy", desc: "24/7 pharmacy stocked with all required medicines" },
  { icon: "🧪", title: "Diagnostics", desc: "X-ray, MRI referrals and on-site lab investigations" },
  { icon: "🏃", title: "Physiotherapy", desc: "Dedicated rehabilitation unit for post-surgical recovery" },
  { icon: "💳", title: "Cashless Mediclaim", desc: "Cashless facility available for major insurance providers" },
  { icon: "📋", title: "Digital Prescriptions", desc: "Paperless OPD prescriptions saved and accessible anytime" },
];

const milestones = [
  { year: "2009", text: "Neel Orthopaedic Hospital established in Bhayander East, Mumbai" },
  { year: "2012", text: "Expanded to multispeciality services including spine and trauma" },
  { year: "2018", text: "Dr. G.K. Boob completes Fellowship in Spine Surgery, Germany" },
  { year: "2023", text: "Introduced Mumbai's first VELYS™ Robotic Knee Replacement system" },
  { year: "2024", text: "Launched digital OPD system and online appointment booking" },
  { year: "2026", text: "Full Hospital Management System deployed for seamless patient care" },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "Georgia, serif" }}>
      <PublicNavbar />

      {/* hero */}
      <div style={{ background: "linear-gradient(135deg, #0a2463 0%, #1a3a8f 100%)", padding: "80px 5%", textAlign: "center" }}>
        <div style={{ fontSize: "12px", color: "#90caf9", letterSpacing: "2px", fontWeight: "600", marginBottom: "16px" }}>WHO WE ARE</div>
        <h1 style={{ color: "white", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: "700", marginBottom: "16px", letterSpacing: "-1px" }}>About Us</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", maxWidth: "600px", margin: "0 auto", lineHeight: "1.7", fontWeight: "300" }}>
          A trusted name in orthopaedic care in Mumbai since 2009 — bringing world-class surgery and compassionate healing to every patient.
        </p>
      </div>

      {/* mission */}
      <div style={{ padding: "80px 5%", background: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>OUR MISSION</div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: "700", color: "#0a2463", marginBottom: "24px", lineHeight: "1.2" }}>
              Pain to Painless —<br />our promise to every patient
            </h2>
            <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8", marginBottom: "20px", fontWeight: "300" }}>
              At Neel Orthopaedic Multispeciality Hospital, we believe every patient deserves access to the most advanced orthopaedic care available — delivered with genuine compassion and respect.
            </p>
            <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8", fontWeight: "300" }}>
              Led by Dr. G.K. Boob — a DNB-qualified orthopaedic surgeon with fellowship training in Germany — our hospital combines cutting-edge technology like the VELYS™ Robotic Knee Replacement system with personalised care that puts patients first.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              { n: "15+", label: "Years of experience" },
              { n: "5000+", label: "Surgeries performed" },
              { n: "200+", label: "Patients seen daily" },
              { n: "4.4★", label: "Google rating" },
            ].map((s, i) => (
              <div key={i} style={{ background: i === 0 ? "#0a2463" : "#f8f9fc", borderRadius: "16px", padding: "28px 24px", border: i === 0 ? "none" : "1px solid #e8edf5" }}>
                <div style={{ fontSize: "36px", fontWeight: "800", color: i === 0 ? "white" : "#0a2463", lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: "13px", color: i === 0 ? "rgba(255,255,255,0.7)" : "#888", marginTop: "8px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* milestones */}
      <div style={{ padding: "80px 5%", background: "#f8f9fc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>OUR JOURNEY</div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: "700", color: "#0a2463" }}>Milestones</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: "32px", alignItems: "flex-start", paddingBottom: "32px", borderLeft: i < milestones.length - 1 ? "2px solid #e0e7ff" : "2px solid transparent", marginLeft: "60px", paddingLeft: "32px", position: "relative" }}>
                <div style={{ position: "absolute", left: "-17px", top: "0", width: "32px", height: "32px", background: "#0a2463", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "11px", fontWeight: "700" }}>{m.year.slice(2)}</div>
                <div>
                  <div style={{ fontWeight: "700", color: "#1a73e8", fontSize: "14px", marginBottom: "4px" }}>{m.year}</div>
                  <div style={{ color: "#444", fontSize: "15px", lineHeight: "1.6" }}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* facilities */}
      <div style={{ padding: "80px 5%", background: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>WHAT WE OFFER</div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: "700", color: "#0a2463" }}>Our Facilities</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {facilities.map((f, i) => (
              <div key={i} style={{ background: "#f8f9fc", borderRadius: "16px", padding: "28px", border: "1px solid #e8edf5" }}>
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{f.icon}</div>
                <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px", marginBottom: "8px" }}>{f.title}</div>
                <div style={{ color: "#666", fontSize: "14px", lineHeight: "1.6" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#0a2463", padding: "80px 5%", textAlign: "center" }}>
        <h2 style={{ color: "white", fontSize: "32px", fontWeight: "700", marginBottom: "16px" }}>Ready to get started?</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", marginBottom: "32px" }}>Book your OPD appointment online in under 2 minutes.</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/book" style={{ background: "white", color: "#0a2463", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "700" }}>Book Appointment</Link>
          <a href="tel:+917021094941" style={{ background: "transparent", color: "white", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "600", border: "2px solid rgba(255,255,255,0.4)" }}>+91 70210 94941</a>
        </div>
      </div>

      <div style={{ background: "#06142e", padding: "24px 5%", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
        © 2026 Neel Orthopaedic Multispeciality Hospital — pain to painless
      </div>
    </div>
  );
}