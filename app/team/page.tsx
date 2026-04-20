"use client";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

const team = [
  {
    name: "Dr. G.K. Boob",
    role: "Orthopaedic Surgeon",
    initial: "G",
    qual: ["DNB (Orthopaedic Surgery)", "Fellowship in Spine Surgery, Germany"],
    specialities: ["Robotic Knee Replacement (VELYS™)", "Total Hip Replacement", "Minimally Invasive Spine Surgery", "Arthroscopic Surgery", "Trauma & Reconstructive Surgery"],
    opd: "10:00 AM – 1:15 PM & 3:30 PM – 6:45 PM",
    days: "Monday – Sunday",
    highlight: true,
    bg: "linear-gradient(135deg, #0f2d6b 0%, #1a56db 100%)",
    accent: "#1a56db",
    lightBg: "#eff6ff",
    about: "Dr. G.K. Boob is a highly experienced orthopaedic surgeon based in Bhayander East, Mumbai. With over 15 years of experience and fellowship training in Germany, he brings world-class expertise in joint replacement and spine surgery. He is one of the select surgeons in Mumbai to perform robotic knee replacement using the VELYS™ system by Johnson & Johnson MedTech.",
  },
  {
    name: "Dr. Vijay Rangani",
    role: "Anaesthetist",
    initial: "V",
    qual: ["MBBS", "DA (Diploma in Anaesthesia)"],
    specialities: ["Pre-anaesthetic checkup", "General anaesthesia", "Spinal anaesthesia", "Post-operative pain management"],
    opd: "Available on surgery days",
    days: "By appointment",
    highlight: false,
    bg: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
    accent: "#059669",
    lightBg: "#ecfdf5",
    about: "Dr. Vijay Rangani is our experienced anaesthetist who handles all pre-anaesthetic evaluations and administers anaesthesia during surgical procedures. His expertise ensures patient safety and comfort throughout the entire surgical process.",
  },
  {
    name: "Dr. Jay Pathak",
    role: "Physiotherapist",
    initial: "J",
    qual: ["B.PTH (Bachelor of Physiotherapy)"],
    specialities: ["Post-surgical rehabilitation", "Knee & hip physiotherapy", "Spine rehabilitation", "Sports injury recovery", "Strengthening exercises"],
    opd: "Monday – Saturday",
    days: "Mon – Sat",
    highlight: false,
    bg: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    accent: "#7c3aed",
    lightBg: "#f5f3ff",
    about: "Dr. Jay Pathak leads our physiotherapy department, specialising in post-surgical rehabilitation for joint replacement and spine surgery patients. His structured recovery programs help patients regain strength and mobility faster than standard protocols.",
  },
  {
    name: "Dr. Chetan Bhambure",
    role: "Physician & Cardiologist",
    initial: "C",
    qual: ["MBBS", "DM Cardiology"],
    specialities: ["Pre-surgery cardiac fitness", "Cardiac evaluation", "Medical fitness certification", "Post-operative medical care"],
    opd: "9:00 AM – 10:00 AM",
    days: "Daily",
    highlight: false,
    bg: "linear-gradient(135deg, #92400e 0%, #f59e0b 100%)",
    accent: "#d97706",
    lightBg: "#fffbeb",
    about: "Dr. Chetan Bhambure is our consulting cardiologist who evaluates patients for cardiac fitness before major surgeries. His thorough pre-operative assessments ensure that patients are medically fit for procedures, minimising surgical risks and complications.",
  },
];

export default function TeamPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#eef2ff", fontFamily: "Georgia, serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .display-font { font-family: 'Playfair Display', Georgia, serif !important; }
        .body-font { font-family: 'Inter', sans-serif !important; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fu { animation: fadeUp 0.6s ease forwards; }

        .doctor-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .doctor-card:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(10,36,99,0.12) !important; }

        .spec-tag { transition: all 0.2s ease; }
        .spec-tag:hover { transform: translateY(-2px); }

        @media (max-width: 768px) {
          .card-inner { grid-template-columns: 1fr !important; }
          .card-left { border-right: none !important; border-bottom: 1px solid #e8edf5 !important; padding-right: 0 !important; padding-bottom: 32px !important; }
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
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "-80px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
          <div className="body-font fu" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#93c5fd", padding: "8px 20px", borderRadius: "30px", fontSize: "12px", letterSpacing: "2.5px", marginBottom: "28px", fontWeight: "600" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", display: "inline-block", boxShadow: "0 0 8px #34d399" }} />
            OUR SPECIALISTS
          </div>
          <h1 className="display-font fu" style={{ fontSize: "clamp(44px, 6vw, 80px)", fontWeight: "900", lineHeight: "1.05", letterSpacing: "-3px", marginBottom: "24px" }}>
            <span style={{ background: "linear-gradient(135deg, #93c5fd 0%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Meet Our Team
            </span>
          </h1>
          <p className="body-font fu" style={{ color: "rgba(255,255,255,0.65)", fontSize: "18px", lineHeight: "1.8", marginBottom: "0" }}>
            A dedicated team of specialists working together to deliver the best orthopaedic care in Mumbai.
          </p>
        </div>
      </div>

      {/* ── TEAM CARDS ── */}
      <div style={{ padding: "80px 5% 100px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
          {team.map((t, i) => (
            <div key={i} className="doctor-card" style={{
              background: "white",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(10,36,99,0.07)",
              border: "1px solid rgba(255,255,255,0.8)",
            }}>
              {/* Colored top banner */}
              <div style={{ background: t.bg, padding: "32px 44px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "24px" }}>
                  {/* Avatar */}
                  <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "900", fontSize: "32px", flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>
                    {t.initial}
                  </div>
                  <div>
                    <h2 className="display-font" style={{ color: "white", fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: "900", letterSpacing: "-0.5px", marginBottom: "6px" }}>{t.name}</h2>
                    <div className="body-font" style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", fontWeight: "600" }}>{t.role}</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                      {t.qual.map((q, j) => (
                        <div key={j} className="body-font" style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" }}>{q}</div>
                      ))}
                    </div>
                  </div>
                  {t.highlight && (
                    <div className="body-font" style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", color: "white", padding: "6px 16px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", flexShrink: 0 }}>
                      LEAD SURGEON
                    </div>
                  )}
                </div>
              </div>

              {/* White body */}
              <div className="card-inner" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "0" }}>

                {/* Left: availability */}
                <div className="card-left" style={{ padding: "36px 32px", borderRight: "1px solid #f0f4ff", background: t.lightBg }}>
                  <div className="body-font" style={{ color: "#9ca3af", fontSize: "10px", letterSpacing: "3px", fontWeight: "700", marginBottom: "16px" }}>AVAILABILITY</div>
                  <div className="body-font" style={{ color: "#030a1e", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>{t.opd}</div>
                  <div className="body-font" style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "28px" }}>{t.days}</div>

                  <div className="body-font" style={{ color: "#9ca3af", fontSize: "10px", letterSpacing: "3px", fontWeight: "700", marginBottom: "16px" }}>SPECIALITIES</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {t.specialities.map((s, j) => (
                      <div key={j} className="spec-tag body-font" style={{ display: "flex", alignItems: "center", gap: "8px", background: "white", border: `1px solid ${t.accent}22`, borderLeft: `3px solid ${t.accent}`, borderRadius: "8px", padding: "9px 13px", fontSize: "13px", color: "#374151", fontWeight: "500" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.accent, flexShrink: 0 }} />
                        {s}
                      </div>
                    ))}
                  </div>

                  {t.highlight && (
                    <Link href="/book" className="body-font" style={{ display: "block", marginTop: "24px", background: t.bg, color: "white", padding: "13px 20px", borderRadius: "14px", textDecoration: "none", fontSize: "14px", fontWeight: "700", textAlign: "center", boxShadow: `0 4px 16px ${t.accent}40`, transition: "all 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                      Book Appointment →
                    </Link>
                  )}
                </div>

                {/* Right: about */}
                <div style={{ padding: "36px 40px" }}>
                  <div className="body-font" style={{ color: "#9ca3af", fontSize: "10px", letterSpacing: "3px", fontWeight: "700", marginBottom: "16px" }}>ABOUT</div>
                  <p className="body-font" style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.9", marginBottom: "0" }}>{t.about}</p>

                  {t.highlight && (
                    <div style={{ marginTop: "32px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "18px 22px", display: "flex", alignItems: "center", gap: "14px" }}>
                      <div className="display-font" style={{ fontSize: "26px", color: "#1a56db", fontWeight: "900" }}>𝕍</div>
                      <div>
                        <div className="body-font" style={{ color: "#1e3a8a", fontWeight: "800", fontSize: "14px" }}>Certified VELYS™ Robotic Surgery Operator</div>
                        <div className="body-font" style={{ color: "#3b82f6", fontSize: "12px", marginTop: "2px" }}>Johnson & Johnson MedTech · One of select surgeons in Mumbai</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2f6e 100%)", padding: "90px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,86,219,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "620px", margin: "0 auto" }}>
          <h2 className="display-font" style={{ color: "white", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: "900", marginBottom: "18px", letterSpacing: "-2px", lineHeight: "1.1" }}>
            Book a consultation
          </h2>
          <p className="body-font" style={{ color: "rgba(255,255,255,0.6)", fontSize: "17px", marginBottom: "40px", lineHeight: "1.8" }}>
            Get expert orthopaedic care from our experienced team.
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