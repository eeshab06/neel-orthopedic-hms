"use client";
import Link from "next/link";

const services = [
  {
    title: "Robotic Knee Replacement",
    subtitle: "VELYS™ by Johnson & Johnson MedTech",
    description: "Neel Orthopaedic Hospital is home to Mumbai's first VELYS™ Robotic Knee Replacement system. This world-class technology allows for precise, computer-guided surgery resulting in faster recovery, less pain, and better outcomes compared to traditional knee replacement.",
    features: ["Precision robotic guidance", "Faster recovery time", "Less blood loss", "Smaller incision", "Better implant positioning"],
    icon: "🦾",
    tag: "FEATURED",
  },
  {
    title: "Total Hip Replacement",
    subtitle: "Minimally invasive technique",
    description: "Our hip replacement surgeries use minimally invasive techniques to restore mobility and eliminate pain caused by arthritis, fractures, or hip degeneration. Patients experience significantly less post-operative pain and return to normal activities faster.",
    features: ["Minimally invasive approach", "Custom implant sizing", "Early mobilisation", "Long-lasting results", "Post-op physiotherapy"],
    icon: "🦴",
    tag: null,
  },
  {
    title: "Minimally Invasive Spine Surgery",
    subtitle: "Fellowship trained in Germany",
    description: "Dr. G.K. Boob completed his Fellowship in Spine Surgery in Germany and brings world-class expertise to treat complex spinal conditions. From disc problems to deformities, our spine surgeries are performed with minimal tissue damage and maximum precision.",
    features: ["Fellowship trained surgeon", "Disc herniation treatment", "Spinal stenosis surgery", "Deformity correction", "Minimal tissue damage"],
    icon: "🧬",
    tag: null,
  },
  {
    title: "Arthroscopic Surgery",
    subtitle: "Knee & shoulder injuries",
    description: "Arthroscopy is a keyhole surgical procedure used to diagnose and treat problems inside a joint. We specialise in knee and shoulder arthroscopy for ligament tears, cartilage damage, and sports injuries — with minimal scarring and quick recovery.",
    features: ["ACL / PCL reconstruction", "Meniscus repair", "Rotator cuff repair", "Cartilage treatment", "Keyhole incisions"],
    icon: "⚡",
    tag: null,
  },
  {
    title: "Trauma & Reconstructive Surgery",
    subtitle: "Emergency & elective fracture care",
    description: "Our trauma team handles all types of fractures and injuries with modern fixation techniques. From simple fractures to complex reconstructive procedures, we provide comprehensive care for both emergency and elective trauma cases.",
    features: ["All types of fractures", "Complex reconstructions", "Emergency availability", "Modern fixation systems", "Rehabilitation support"],
    icon: "🩹",
    tag: null,
  },
];

const team = [
  { name: "Dr. G.K. Boob", role: "Orthopaedic Surgeon", qual: "DNB Ortho | Fellowship Spine Surgery, Germany", available: "Mon – Sun", opd: "10:00 AM – 1:15 PM & 3:30 PM – 6:45 PM" },
  { name: "Dr. Vijay Rangani", role: "Anaesthetist", qual: "MBBS / DA", available: "Surgery days", opd: "Pre-anaesthetic checkup & anaesthesia" },
  { name: "Dr. Jay Pathak", role: "Physiotherapist", qual: "B.PTH", available: "Mon – Sat", opd: "Post-surgical rehabilitation" },
  { name: "Dr. Chetan Bhambure", role: "Physician & Cardiologist", qual: "DM Cardiology", available: "Daily", opd: "9:00 AM – 10:00 AM | Pre-surgery fitness" },
];

export default function ServicesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "Georgia, serif" }}>

      {/* navbar */}
      <nav style={{ background: "#0a2463", padding: "0 5%", height: "65px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: "700", fontSize: "16px" }}>← Neel Orthopaedic</Link>
        <Link href="/book" style={{ background: "#1a73e8", color: "white", padding: "10px 22px", borderRadius: "25px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Book Appointment</Link>
      </nav>

      {/* hero */}
      <div style={{ background: "linear-gradient(135deg, #0a2463 0%, #1a3a8f 100%)", padding: "80px 5%", textAlign: "center" }}>
        <div style={{ fontSize: "12px", color: "#90caf9", letterSpacing: "2px", fontWeight: "600", marginBottom: "16px" }}>WHAT WE TREAT</div>
        <h1 style={{ color: "white", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: "700", marginBottom: "16px", letterSpacing: "-1px" }}>
          Our Specialities
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", maxWidth: "560px", margin: "0 auto 32px", lineHeight: "1.7", fontWeight: "300" }}>
          Advanced orthopaedic care delivered by experienced specialists using the latest technology — all under one roof in Bhayander East, Mumbai.
        </p>
        <Link href="/book" style={{ background: "white", color: "#0a2463", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "700" }}>
          Book a Consultation →
        </Link>
      </div>

      {/* services list */}
      <div style={{ padding: "80px 5%" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>
          {services.map((s, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr",
              gap: "60px", alignItems: "center",
              flexDirection: i % 2 === 0 ? "row" : "row-reverse" as any,
              background: i === 0 ? "#f0f4ff" : "white",
              borderRadius: "20px", padding: "48px",
              border: i === 0 ? "2px solid #e0e7ff" : "1px solid #f0f0f0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
            }}>
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                {s.tag && (
                  <div style={{ display: "inline-block", background: "#1a73e8", color: "white", padding: "4px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", marginBottom: "16px" }}>
                    {s.tag}
                  </div>
                )}
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>{s.icon}</div>
                <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#0a2463", marginBottom: "8px", letterSpacing: "-0.5px" }}>{s.title}</h2>
                <div style={{ color: "#1a73e8", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>{s.subtitle}</div>
                <p style={{ color: "#555", fontSize: "15px", lineHeight: "1.8", marginBottom: "24px", fontWeight: "300" }}>{s.description}</p>
                <Link href="/book" style={{ background: "#0a2463", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                  Book Consultation →
                </Link>
              </div>
              <div style={{ order: i % 2 === 0 ? 1 : 0, background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #e8edf5" }}>
                <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "15px", marginBottom: "16px" }}>What's included:</div>
                {s.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: j < s.features.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                    <div style={{ width: "24px", height: "24px", background: "#e8f5e9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#16a34a", flexShrink: 0 }}>✓</div>
                    <div style={{ color: "#444", fontSize: "14px" }}>{f}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* surgery timings */}
      <div style={{ background: "#f8f9fc", padding: "60px 5%" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>SCHEDULE</div>
            <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#0a2463" }}>Surgery & OPD Timings</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ background: "white", borderRadius: "16px", padding: "32px", border: "1px solid #e8edf5" }}>
              <div style={{ fontSize: "13px", color: "#1a73e8", fontWeight: "600", letterSpacing: "1px", marginBottom: "16px" }}>OPD CONSULTATION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <span style={{ color: "#555", fontSize: "14px" }}>Morning session</span>
                  <span style={{ fontWeight: "700", color: "#0a2463" }}>10:00 AM – 1:15 PM</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <span style={{ color: "#555", fontSize: "14px" }}>Evening session</span>
                  <span style={{ fontWeight: "700", color: "#0a2463" }}>3:30 PM – 6:45 PM</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                  <span style={{ color: "#555", fontSize: "14px" }}>Days</span>
                  <span style={{ fontWeight: "700", color: "#0a2463" }}>Monday – Sunday</span>
                </div>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: "16px", padding: "32px", border: "1px solid #e8edf5" }}>
              <div style={{ fontSize: "13px", color: "#1a73e8", fontWeight: "600", letterSpacing: "1px", marginBottom: "16px" }}>ELECTIVE SURGERY (OT)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <span style={{ color: "#555", fontSize: "14px" }}>Morning OT</span>
                  <span style={{ fontWeight: "700", color: "#0a2463" }}>7:00 AM – 10:00 AM</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <span style={{ color: "#555", fontSize: "14px" }}>Afternoon OT</span>
                  <span style={{ fontWeight: "700", color: "#0a2463" }}>2:00 PM – 3:00 PM</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                  <span style={{ color: "#555", fontSize: "14px" }}>Emergency</span>
                  <span style={{ fontWeight: "700", color: "#16a34a" }}>24 / 7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* team */}
      <div style={{ padding: "80px 5%", background: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>OUR TEAM</div>
            <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#0a2463" }}>Specialists behind your care</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {team.map((t, i) => (
              <div key={i} style={{ background: "#f8f9fc", borderRadius: "16px", padding: "28px", border: "1px solid #e8edf5", transition: "all 0.2s" }}>
                <div style={{ width: "52px", height: "52px", background: i === 0 ? "#0a2463" : "#e8edf5", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: i === 0 ? "white" : "#555", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>
                  {t.name.split(" ")[1][0]}
                </div>
                <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px", marginBottom: "4px" }}>{t.name}</div>
                <div style={{ color: "#1a73e8", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>{t.role}</div>
                <div style={{ color: "#888", fontSize: "13px", marginBottom: "12px" }}>{t.qual}</div>
                <div style={{ borderTop: "1px solid #e8edf5", paddingTop: "12px", fontSize: "12px", color: "#999" }}>{t.opd}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#0a2463", padding: "80px 5%", textAlign: "center" }}>
        <h2 style={{ color: "white", fontSize: "32px", fontWeight: "700", marginBottom: "16px" }}>Ready to consult?</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
          Book your OPD appointment online in under 2 minutes. Get your token number and skip the queue.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link href="/book" style={{ background: "white", color: "#0a2463", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "700" }}>Book Appointment</Link>
          <a href="tel:+917021094941" style={{ background: "transparent", color: "white", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "600", border: "2px solid rgba(255,255,255,0.4)" }}>+91 70210 94941</a>
        </div>
      </div>

      {/* footer */}
      <div style={{ background: "#06142e", padding: "24px 5%", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
        © 2026 Neel Orthopaedic & Multi Speciality Hospital — pain to painless
      </div>
    </div>
  );
}