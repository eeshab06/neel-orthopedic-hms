"use client";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

const services = [
  {
    title: "Robotic-Assisted Knee Replacement",
    subtitle: "VELYS™ by Johnson & Johnson MedTech",
    tag: "FEATURED",
    icon: "🦾",
    cardBg: "linear-gradient(145deg, #0f2d6b 0%, #1a56db 100%)",
    accent: "#93c5fd",
    lightBg: "#eff6ff",
    lightAccent: "#1a56db",
    description: "Neel Orthopaedic Multispeciality Hospital offers the VELYS™ Robotic-Assisted Knee Replacement system — one of the most advanced robotic surgery platforms in the world. This computer-guided technology delivers unmatched precision, resulting in faster recovery, less pain, and better long-term outcomes.",
    features: [
      { icon: "🎯", text: "Sub-millimetre precision robotic guidance" },
      { icon: "⚡", text: "Significantly faster recovery time" },
      { icon: "💉", text: "Minimal blood loss & smaller incision" },
      { icon: "🩺", text: "Personalized implant positioning" },
      { icon: "✅", text: "Better long-term implant survivorship" },
    ],
    velys: true,
  },
  {
    title: "Hip Replacement Surgery",
    subtitle: "Minimally invasive technique",
    tag: "JOINT CARE",
    icon: "🦴",
    cardBg: "linear-gradient(145deg, #92400e 0%, #f59e0b 100%)",
    accent: "#fde68a",
    lightBg: "#fffbeb",
    lightAccent: "#d97706",
    description: "Our hip replacement surgeries use minimally invasive techniques to restore mobility and eliminate chronic pain caused by arthritis, fractures, or hip degeneration. With custom implant sizing and early mobilisation protocols, patients return to normal activities significantly faster.",
    features: [
      { icon: "🔬", text: "Minimally invasive surgical approach" },
      { icon: "📐", text: "Custom implant sizing for each patient" },
      { icon: "🚶", text: "Early mobilisation — walk the same day" },
      { icon: "⏳", text: "Long-lasting implant results" },
      { icon: "💪", text: "Comprehensive post-op physiotherapy" },
    ],
    velys: false,
  },
  {
    title: "Minimally Invasive Spine Surgery",
    subtitle: "Fellowship trained, Germany",
    tag: "SPINE CARE",
    icon: "🧬",
    cardBg: "linear-gradient(145deg, #064e3b 0%, #10b981 100%)",
    accent: "#a7f3d0",
    lightBg: "#ecfdf5",
    lightAccent: "#059669",
    description: "Dr. G.K. Boob completed his Fellowship in Spine Surgery in Germany and brings world-class expertise to treat complex spinal conditions. From disc herniation to spinal stenosis, our surgeries are performed with minimal tissue damage and dramatically reduced recovery time.",
    features: [
      { icon: "🎓", text: "Fellowship trained surgeon, Germany" },
      { icon: "💊", text: "Disc herniation & spinal stenosis" },
      { icon: "🧠", text: "Nerve decompression procedures" },
      { icon: "🔧", text: "Spinal fusion & stabilisation" },
      { icon: "📉", text: "Minimal tissue damage approach" },
    ],
    velys: false,
  },
  {
    title: "Spinal Deformity Correction",
    subtitle: "Scoliosis & deformity experts",
    tag: "SPINE CARE",
    icon: "⚕️",
    cardBg: "linear-gradient(145deg, #1e1b4b 0%, #7c3aed 100%)",
    accent: "#ddd6fe",
    lightBg: "#f5f3ff",
    lightAccent: "#6d28d9",
    description: "Spinal deformities such as scoliosis, kyphosis, and spondylolisthesis require highly specialised surgical expertise. Our team performs complex deformity correction surgeries using modern instrumentation and imaging guidance, helping patients regain a straighter spine and improved quality of life.",
    features: [
      { icon: "🩻", text: "Scoliosis & kyphosis correction" },
      { icon: "📡", text: "Intraoperative imaging guidance" },
      { icon: "🔩", text: "Modern pedicle screw instrumentation" },
      { icon: "🌡️", text: "Neuromonitoring during surgery" },
      { icon: "🏃", text: "Structured rehabilitation programme" },
    ],
    velys: false,
  },
  {
    title: "Interventional Pain Management",
    subtitle: "Non-surgical pain solutions",
    tag: "PAIN RELIEF",
    icon: "💉",
    cardBg: "linear-gradient(145deg, #0c4a6e 0%, #0ea5e9 100%)",
    accent: "#bae6fd",
    lightBg: "#f0f9ff",
    lightAccent: "#0284c7",
    description: "Not every orthopaedic condition requires surgery. Our interventional pain management services offer effective, minimally invasive solutions to manage chronic joint, spine, and nerve pain — including injections, nerve blocks, and regenerative therapies.",
    features: [
      { icon: "💊", text: "Corticosteroid & PRP injections" },
      { icon: "⚡", text: "Nerve block procedures" },
      { icon: "🌿", text: "Regenerative therapy options" },
      { icon: "🎯", text: "Image-guided precision injections" },
      { icon: "📋", text: "Personalised pain management plans" },
    ],
    velys: false,
  },
  {
    title: "Arthroscopy, Sports Medicine & Trauma Care",
    subtitle: "Keyhole surgery & injury management",
    tag: "SPORTS CARE",
    icon: "⚡",
    cardBg: "linear-gradient(145deg, #7f1d1d 0%, #ef4444 100%)",
    accent: "#fecaca",
    lightBg: "#fff1f2",
    lightAccent: "#dc2626",
    description: "Arthroscopy allows us to diagnose and treat joint problems through tiny keyhole incisions — with minimal scarring and rapid recovery. We specialise in ACL reconstruction, meniscus repair, rotator cuff surgery, and complete management of sports injuries and trauma.",
    features: [
      { icon: "🏋️", text: "ACL & PCL reconstruction" },
      { icon: "🦵", text: "Meniscus repair & transplant" },
      { icon: "💪", text: "Rotator cuff & shoulder surgery" },
      { icon: "🚑", text: "Emergency fracture & trauma care" },
      { icon: "🏅", text: "Sports injury rehabilitation" },
    ],
    velys: false,
  },
];

export default function ServicesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#eef2ff", fontFamily: "Georgia, serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .display-font { font-family: 'Playfair Display', Georgia, serif !important; }
        .body-font { font-family: 'Inter', sans-serif !important; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fu { animation: fadeUp 0.6s ease forwards; }

        .service-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .service-card:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(10,36,99,0.12) !important; }

        .feature-chip { transition: all 0.2s ease; }
        .feature-chip:hover { transform: translateY(-2px); }

        @media (max-width: 768px) {
          .service-inner { grid-template-columns: 1fr !important; }
          .features-row { grid-template-columns: 1fr !important; }
          .timings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <PublicNavbar />

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a1628 0%, #1a2f6e 50%, #0f4c8a 100%)",
        padding: "110px 5% 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "-80px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
          <div className="body-font fu" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#93c5fd", padding: "8px 20px", borderRadius: "30px", fontSize: "12px", letterSpacing: "2.5px", marginBottom: "28px", fontWeight: "600" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", display: "inline-block", boxShadow: "0 0 8px #34d399" }} />
            WHAT WE TREAT
          </div>
          <h1 className="display-font fu" style={{ fontSize: "clamp(44px, 6vw, 80px)", fontWeight: "900", lineHeight: "1.05", letterSpacing: "-3px", marginBottom: "24px" }}>
            <span style={{ background: "linear-gradient(135deg, #93c5fd 0%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Our Specialities
            </span>
          </h1>
          <p className="body-font fu" style={{ color: "rgba(255,255,255,0.65)", fontSize: "18px", lineHeight: "1.8", marginBottom: "40px" }}>
            Advanced orthopaedic care by experienced specialists using the latest technology — all under one roof in Bhayander East, Mumbai.
          </p>
          <Link href="/book" className="body-font fu" style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "white", color: "#0a1628", padding: "16px 36px", borderRadius: "36px", textDecoration: "none", fontSize: "17px", fontWeight: "800", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", transition: "all 0.25s" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
            Book a Consultation →
          </Link>
        </div>
      </div>

      {/* ── SERVICES LIST ── */}
      <div style={{ padding: "80px 5% 100px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
          {services.map((s, i) => (
            <div key={i} className="service-card" style={{
              background: "white",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(10,36,99,0.07)",
              border: "1px solid rgba(255,255,255,0.8)",
            }}>
              {/* Colored top banner */}
              <div style={{ background: s.cardBg, padding: "36px 48px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
                <div style={{ position: "absolute", bottom: "-50px", right: "30%", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div className="body-font" style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", color: "white", padding: "6px 16px", borderRadius: "30px", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", marginBottom: "14px" }}>{s.tag}</div>
                    <h2 className="display-font" style={{ color: "white", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: "900", letterSpacing: "-1px", lineHeight: "1.1", marginBottom: "8px" }}>{s.title}</h2>
                    <div className="body-font" style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px", fontWeight: "500" }}>{s.subtitle}</div>
                  </div>
                  <div style={{ fontSize: "64px", lineHeight: 1, flexShrink: 0, marginLeft: "24px", opacity: 0.9 }}>{s.icon}</div>
                </div>
              </div>

              {/* White body */}
              <div style={{ padding: "44px 48px" }}>
                <div className="service-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>

                  {/* Left: description + CTA */}
                  <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                    {s.velys && (
                      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "14px" }}>
                        <div className="display-font" style={{ fontSize: "26px", color: "#1a56db", fontWeight: "900" }}>𝕍</div>
                        <div>
                          <div className="body-font" style={{ color: "#1e3a8a", fontWeight: "800", fontSize: "15px" }}>VELYS™ Robotic-Assisted Solution</div>
                          <div className="body-font" style={{ color: "#3b82f6", fontSize: "12px", marginTop: "2px" }}>Johnson & Johnson MedTech</div>
                        </div>
                      </div>
                    )}
                    <p className="body-font" style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.85", marginBottom: "32px" }}>{s.description}</p>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <Link href="/book" className="body-font" style={{ background: `linear-gradient(135deg, ${s.lightAccent}, ${s.lightAccent}dd)`, color: "white", padding: "13px 28px", borderRadius: "32px", textDecoration: "none", fontSize: "15px", fontWeight: "700", boxShadow: `0 4px 16px ${s.lightAccent}40`, transition: "all 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                        Book Consultation →
                      </Link>
                    </div>
                  </div>

                  {/* Right: features */}
                  <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                    <div className="body-font" style={{ color: "#9ca3af", fontSize: "10px", letterSpacing: "3px", fontWeight: "700", marginBottom: "16px" }}>WHAT'S INCLUDED</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {s.features.map((f, j) => (
                        <div key={j} className="feature-chip" style={{ display: "flex", alignItems: "center", gap: "14px", background: s.lightBg, border: `1px solid ${s.lightAccent}22`, borderRadius: "12px", padding: "13px 16px" }}>
                          <div style={{ fontSize: "20px", flexShrink: 0 }}>{f.icon}</div>
                          <div className="body-font" style={{ color: "#374151", fontSize: "14px", fontWeight: "500" }}>{f.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── OPD TIMINGS ── */}
      <div style={{ background: "white", padding: "80px 5%", borderTop: "1px solid #e0e7ff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div className="body-font" style={{ fontSize: "11px", color: "#1a73e8", letterSpacing: "3px", fontWeight: "700", marginBottom: "14px" }}>SCHEDULE</div>
            <h2 className="display-font" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", color: "#030a1e", fontWeight: "900", letterSpacing: "-1.5px" }}>OPD Timings</h2>
          </div>
          <div className="timings-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {[
              { icon: "🌅", title: "Morning OPD", time: "10:00 AM – 1:15 PM", sub: "Tokens 1–72 · Mon–Sat", color: "#1a56db", bg: "#eff6ff" },
              { icon: "🌆", title: "Evening OPD", time: "3:30 PM – 6:45 PM", sub: "Tokens 73–144 · Mon–Sat", color: "#7c3aed", bg: "#f5f3ff" },
              { icon: "☀️", title: "Sunday Morning", time: "10:00 AM – 1:00 PM", sub: "Morning only · No evening session", color: "#d97706", bg: "#fffbeb" },
              { icon: "🚨", title: "Emergency", time: "24 / 7", sub: "Always available", color: "#059669", bg: "#ecfdf5" },
            ].map((t, i) => (
              <div key={i} style={{ background: t.bg, borderRadius: "20px", padding: "32px 28px", border: `1px solid ${t.color}22`, textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "14px" }}>{t.icon}</div>
                <div className="body-font" style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", marginBottom: "8px" }}>{t.title}</div>
                <div className="display-font" style={{ color: t.color, fontSize: "26px", fontWeight: "900", letterSpacing: "-0.5px", marginBottom: "6px" }}>{t.time}</div>
                <div className="body-font" style={{ color: "#9ca3af", fontSize: "13px" }}>{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2f6e 100%)", padding: "90px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,86,219,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "620px", margin: "0 auto" }}>
          <h2 className="display-font" style={{ color: "white", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: "900", marginBottom: "18px", letterSpacing: "-2px", lineHeight: "1.1" }}>
            Ready to consult?
          </h2>
          <p className="body-font" style={{ color: "rgba(255,255,255,0.6)", fontSize: "17px", marginBottom: "40px", lineHeight: "1.8" }}>
            Book your OPD appointment online in under 2 minutes. Get your token instantly.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/book" className="body-font" style={{ background: "white", color: "#030a1e", padding: "16px 36px", borderRadius: "32px", textDecoration: "none", fontSize: "16px", fontWeight: "800", transition: "all 0.25s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
              Book Appointment
            </Link>
            <a href="tel:+917021094941" className="body-font" style={{ background: "transparent", color: "rgba(255,255,255,0.8)", padding: "16px 36px", borderRadius: "32px", textDecoration: "none", fontSize: "16px", fontWeight: "600", border: "1.5px solid rgba(255,255,255,0.3)", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}>
              +91 70210 94941
            </a>
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