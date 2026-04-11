"use client";
import Link from "next/link";

const team = [
  {
    name: "Dr. G.K. Boob",
    role: "Orthopaedic Surgeon",
    qual: ["DNB (Orthopaedic Surgery)", "Fellowship in Spine Surgery, Germany"],
    specialities: ["Robotic Knee Replacement (VELYS™)", "Total Hip Replacement", "Minimally Invasive Spine Surgery", "Arthroscopic Surgery", "Trauma & Reconstructive Surgery"],
    opd: "10:00 AM – 1:15 PM & 3:30 PM – 6:45 PM",
    days: "Monday – Sunday",
    phone: "+91 70210 94941",
    highlight: true,
    about: "Dr. G.K. Boob is a highly experienced orthopaedic surgeon based in Bhayander East, Mumbai. With over 15 years of experience and fellowship training in Germany, he brings world-class expertise in joint replacement and spine surgery. He is one of the select surgeons in Mumbai to perform robotic knee replacement using the VELYS™ system by Johnson & Johnson MedTech.",
  },
  {
    name: "Dr. Vijay Rangani",
    role: "Anaesthetist",
    qual: ["MBBS", "DA (Diploma in Anaesthesia)"],
    specialities: ["Pre-anaesthetic checkup", "General anaesthesia", "Spinal anaesthesia", "Post-operative pain management"],
    opd: "Available on surgery days",
    days: "By appointment",
    phone: "+91 70210 94941",
    highlight: false,
    about: "Dr. Vijay Rangani is our experienced anaesthetist who handles all pre-anaesthetic evaluations and administers anaesthesia during surgical procedures. His expertise ensures patient safety and comfort throughout the surgical process.",
  },
  {
    name: "Dr. Jay Pathak",
    role: "Physiotherapist",
    qual: ["B.PTH (Bachelor of Physiotherapy)"],
    specialities: ["Post-surgical rehabilitation", "Knee & hip physiotherapy", "Spine rehabilitation", "Sports injury recovery", "Strengthening exercises"],
    opd: "Monday – Saturday",
    days: "Mon – Sat",
    phone: "+91 70210 94941",
    highlight: false,
    about: "Dr. Jay Pathak leads our physiotherapy department, specialising in post-surgical rehabilitation for joint replacement and spine surgery patients. His structured recovery programs help patients regain strength and mobility faster.",
  },
  {
    name: "Dr. Chetan Bhambure",
    role: "Physician & Cardiologist",
    qual: ["MBBS", "DM Cardiology"],
    specialities: ["Pre-surgery cardiac fitness", "Cardiac evaluation", "Medical fitness certification", "Post-operative medical care"],
    opd: "9:00 AM – 10:00 AM",
    days: "Daily",
    phone: "+91 70210 94941",
    highlight: false,
    about: "Dr. Chetan Bhambure is our consulting cardiologist who evaluates patients for cardiac fitness before major surgeries. His pre-operative assessments ensure that patients are medically fit for procedures, minimising surgical risks.",
  },
];

export default function TeamPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "Georgia, serif" }}>

      {/* navbar */}
      <nav style={{ background: "#0a2463", padding: "0 5%", height: "65px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: "700", fontSize: "16px" }}>← Neel Orthopaedic</Link>
        <Link href="/book" style={{ background: "#1a73e8", color: "white", padding: "10px 22px", borderRadius: "25px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Book Appointment</Link>
      </nav>

      {/* hero */}
      <div style={{ background: "linear-gradient(135deg, #0a2463 0%, #1a3a8f 100%)", padding: "80px 5%", textAlign: "center" }}>
        <div style={{ fontSize: "12px", color: "#90caf9", letterSpacing: "2px", fontWeight: "600", marginBottom: "16px" }}>OUR SPECIALISTS</div>
        <h1 style={{ color: "white", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: "700", marginBottom: "16px", letterSpacing: "-1px" }}>Meet Our Team</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", maxWidth: "520px", margin: "0 auto", lineHeight: "1.7", fontWeight: "300" }}>
          A dedicated team of specialists working together to deliver the best orthopaedic care in Mumbai.
        </p>
      </div>

      {/* team cards */}
      <div style={{ padding: "80px 5%" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
          {team.map((t, i) => (
            <div key={i} style={{
              background: t.highlight ? "linear-gradient(135deg, #f0f4ff, #e8f0ff)" : "#fafafa",
              borderRadius: "20px", padding: "40px",
              border: t.highlight ? "2px solid #c7d8ff" : "1px solid #f0f0f0",
              display: "grid", gridTemplateColumns: "1fr 2fr",
              gap: "48px", alignItems: "start",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
            }}>

              {/* left */}
              <div>
                <div style={{
                  width: "80px", height: "80px",
                  background: t.highlight ? "#0a2463" : "#e8edf5",
                  borderRadius: "20px", display: "flex", alignItems: "center",
                  justifyContent: "center", color: t.highlight ? "white" : "#555",
                  fontWeight: "800", fontSize: "28px", marginBottom: "20px",
                  fontFamily: "Georgia, serif"
                }}>
                  {t.name.split(" ")[1][0]}
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0a2463", marginBottom: "4px" }}>{t.name}</h2>
                <div style={{ color: "#1a73e8", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>{t.role}</div>
                {t.qual.map((q, j) => (
                  <div key={j} style={{ color: "#666", fontSize: "13px", marginBottom: "4px" }}>• {q}</div>
                ))}

                <div style={{ marginTop: "20px", background: "white", borderRadius: "12px", padding: "16px", border: "1px solid #e8edf5" }}>
                  <div style={{ fontSize: "11px", color: "#1a73e8", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>AVAILABILITY</div>
                  <div style={{ fontWeight: "600", color: "#0a2463", fontSize: "14px" }}>{t.opd}</div>
                  <div style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>{t.days}</div>
                </div>

                {t.highlight && (
                  <Link href="/book" style={{ display: "block", marginTop: "16px", background: "#0a2463", color: "white", padding: "12px 20px", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: "700", textAlign: "center" }}>
                    Book Appointment →
                  </Link>
                )}
              </div>

              {/* right */}
              <div>
                <p style={{ color: "#555", fontSize: "15px", lineHeight: "1.8", marginBottom: "28px", fontWeight: "300" }}>{t.about}</p>

                <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "15px", marginBottom: "16px" }}>Specialities:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {t.specialities.map((s, j) => (
                    <div key={j} style={{
                      background: "white", border: "1.5px solid #e0e7ff",
                      borderRadius: "8px", padding: "8px 16px",
                      fontSize: "13px", color: "#0a2463", fontWeight: "500"
                    }}>{s}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#0a2463", padding: "80px 5%", textAlign: "center" }}>
        <h2 style={{ color: "white", fontSize: "32px", fontWeight: "700", marginBottom: "16px" }}>Book a consultation</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", marginBottom: "32px" }}>
          Get expert orthopaedic care from our experienced team.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link href="/book" style={{ background: "white", color: "#0a2463", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "700" }}>Book Appointment</Link>
          <a href="tel:+917021094941" style={{ background: "transparent", color: "white", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "600", border: "2px solid rgba(255,255,255,0.4)" }}>+91 70210 94941</a>
        </div>
      </div>

      <div style={{ background: "#06142e", padding: "24px 5%", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
        © 2026 Neel Orthopaedic & Multi Speciality Hospital — pain to painless
      </div>
    </div>
  );
}