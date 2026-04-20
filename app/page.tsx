"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import TestimonialsSection from "@/components/TestimonialsSection";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Doctors", href: "/team" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Testimonials", href: "/testimonials" },
  ];

  const stats = [
    { n: "200+", label: "Patients Daily" },
    { n: "5000+", label: "Surgeries Done" },
    { n: "15+", label: "Years Experience" },
    { n: "24/7", label: "Emergency Care" },
  ];

  const services = [
    { title: "Robotic-Assisted\nKnee Replacement", icon: "🦾", tag: "FEATURED", bg: "linear-gradient(145deg, #0f2d6b 0%, #1a56db 100%)", accent: "#93c5fd", desc: "VELYS™ by Johnson & Johnson" },
    { title: "Hip Replacement\nSurgery", icon: "🦴", tag: "JOINT CARE", bg: "linear-gradient(145deg, #92400e 0%, #f59e0b 100%)", accent: "#fde68a", desc: "Minimally invasive technique" },
    { title: "Minimally Invasive\nSpine Surgery", icon: "🧬", tag: "SPINE CARE", bg: "linear-gradient(145deg, #064e3b 0%, #10b981 100%)", accent: "#a7f3d0", desc: "Fellowship trained, Germany" },
    { title: "Spinal Deformity\nCorrection", icon: "⚕️", tag: "SPINE CARE", bg: "linear-gradient(145deg, #1e1b4b 0%, #7c3aed 100%)", accent: "#ddd6fe", desc: "Scoliosis & deformity experts" },
    { title: "Interventional Pain\nManagement", icon: "💉", tag: "PAIN RELIEF", bg: "linear-gradient(145deg, #0c4a6e 0%, #0ea5e9 100%)", accent: "#bae6fd", desc: "Non-surgical pain solutions" },
    { title: "Arthroscopy &\nSports Medicine", icon: "⚡", tag: "SPORTS CARE", bg: "linear-gradient(145deg, #7f1d1d 0%, #ef4444 100%)", accent: "#fecaca", desc: "Trauma & joint reconstruction" },
  ];

  const team = [
    { name: "Dr. G.K. Boob", role: "Orthopaedic Surgeon", qual: "DNB Ortho | Fellowship Spine, Germany", highlight: true },
    { name: "Dr. Vijay Rangani", role: "Anaesthetist", qual: "MBBS / DA", highlight: false },
    { name: "Dr. Jay Pathak", role: "Physiotherapist", qual: "B.PTH", highlight: false },
    { name: "Dr. Chetan Bhambure", role: "Cardiologist", qual: "DM Cardiology", highlight: false },
  ];

  const gradientText: React.CSSProperties = {
    background: "linear-gradient(135deg, #60a5fa 0%, #34d399 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  return (
    <div style={{ background: "#fff", fontFamily: "'Georgia', 'Times New Roman', serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .display-font { font-family: 'Playfair Display', Georgia, serif !important; }
        .body-font { font-family: 'Inter', sans-serif !important; }

        .nav-desktop { display: flex; gap: 36px; align-items: center; }
        .hamburger { display: none; }
        .nav-mobile-menu { display: none; }

        .hero-wrap { position: relative; width: 100%; height: 100vh; min-height: 700px; overflow: hidden; display: flex; align-items: center; }
        .hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(105deg, rgba(3,10,30,0.92) 0%, rgba(5,20,60,0.82) 40%, rgba(10,36,99,0.55) 70%, rgba(10,36,99,0.3) 100%); }
        .hero-inner { position: relative; z-index: 2; max-width: 1280px; width: 100%; margin: 0 auto; padding: 0 6%; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 80px; align-items: center; }
        .hero-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .collage-wrap { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 270px 270px; gap: 12px; }
        .collage-cell { border-radius: 18px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .collage-cell img { width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block; transition: transform 0.6s ease; }
        .collage-cell:hover img { transform: scale(1.04); }

        .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .service-card { border-radius: 22px; overflow: hidden; height: 220px; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .service-card:hover { transform: translateY(-8px); box-shadow: 0 28px 60px rgba(0,0,0,0.25); }
        .service-card-inner { width: 100%; height: 100%; padding: 28px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
        .service-card-inner::before { content: ''; position: absolute; top: -30px; right: -30px; width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.06); pointer-events: none; }
        .service-card-inner::after { content: ''; position: absolute; bottom: -40px; right: -20px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.04); pointer-events: none; }

        .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 56px; }
        .section-divider { width: 60px; height: 4px; border-radius: 2px; background: linear-gradient(90deg, #1a73e8, #60a5fa); margin-bottom: 20px; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .fu1 { animation: fadeUp 0.9s ease forwards; }
        .fu2 { animation: fadeUp 0.9s 0.2s ease forwards; opacity: 0; }
        .fu3 { animation: fadeUp 0.9s 0.4s ease forwards; opacity: 0; }
        .fu4 { animation: fadeUp 0.9s 0.6s ease forwards; opacity: 0; }

        @media (max-width: 1100px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .collage-wrap { grid-template-rows: 200px 200px; }
          .team-grid { grid-template-columns: 1fr 1fr; }
          .footer-grid { grid-template-columns: 1fr; gap: 36px; }
        }
        @media (max-width: 768px) {
          .nav-desktop { display: none; }
          .hamburger { display: flex; background: none; border: none; cursor: pointer; flex-direction: column; gap: 5px; padding: 4px; }
          .nav-mobile-menu { display: flex; flex-direction: column; position: fixed; top: 70px; left: 0; right: 0; background: #030a1e; padding: 28px 6%; gap: 4px; z-index: 99; border-top: 1px solid rgba(255,255,255,0.07); }
          .hero-wrap { height: 100svh; }
          .collage-wrap { grid-template-rows: 160px 160px; gap: 8px; }
          .services-grid { grid-template-columns: 1fr 1fr; }
          .service-card { height: 180px; }
        }
        @media (max-width: 480px) {
          .team-grid { grid-template-columns: 1fr; }
          .services-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(3,10,30,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "all 0.4s ease",
        padding: "0 6%", height: "72px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #1a56db, #60a5fa)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "900", fontSize: "19px", flexShrink: 0, boxShadow: "0 4px 16px rgba(26,86,219,0.4)" }}>N</div>
          <div>
            <div className="body-font" style={{ color: "white", fontWeight: "700", fontSize: "15px", letterSpacing: "-0.3px" }}>Neel Orthopaedic Multispeciality Hospital</div>
            <div className="body-font" style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px" }}>BHAYANDER EAST · MUMBAI</div>
          </div>
        </div>

        <div className="nav-desktop">
          {navLinks.map(item => (
            <a key={item.label} href={item.href} className="body-font"
              style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: "15px", fontWeight: "500", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}>
              {item.label}
            </a>
          ))}
          <Link href="/book" className="body-font"
            style={{ background: "linear-gradient(135deg, #1a56db, #1a73e8)", color: "white", padding: "12px 28px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "600", boxShadow: "0 4px 20px rgba(26,86,219,0.35)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,86,219,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,86,219,0.35)"; }}>
            Book OPD
          </Link>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span style={{ width: "24px", height: "2px", background: "white", display: "block", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ width: "24px", height: "2px", background: "white", display: "block", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ width: "24px", height: "2px", background: "white", display: "block", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      </nav>

      {menuOpen && (
        <div className="nav-mobile-menu">
          {navLinks.map(item => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="body-font"
              style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "18px", fontWeight: "500", padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {item.label}
            </a>
          ))}
          <Link href="/book" onClick={() => setMenuOpen(false)} className="body-font"
            style={{ background: "linear-gradient(135deg, #1a56db, #1a73e8)", color: "white", padding: "16px", borderRadius: "14px", textDecoration: "none", fontSize: "17px", fontWeight: "700", textAlign: "center", marginTop: "12px", display: "block" }}>
            Book OPD Appointment
          </Link>
        </div>
      )}

      {/* ── HERO ── */}
      <div className="hero-wrap">
        <video ref={videoRef} className="hero-video" autoPlay muted loop playsInline src="/videos/hospital-tour.mp4" />
        <div className="hero-overlay" />
        <div className="hero-inner">
          <div>
            <div className="fu1 body-font" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#93c5fd", padding: "8px 20px", borderRadius: "30px", fontSize: "12px", letterSpacing: "2.5px", marginBottom: "32px", fontWeight: "600" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", display: "inline-block", boxShadow: "0 0 8px #34d399" }} />
              BHAYANDER EAST · MUMBAI
            </div>
            <h1 className="fu2 display-font" style={{ fontSize: "clamp(44px, 6vw, 80px)", fontWeight: "900", lineHeight: "1.05", marginBottom: "24px", letterSpacing: "-2.5px" }}>
              <span style={gradientText}>Neel</span><br />
              <span style={gradientText}>Orthopaedic</span><br />
              <span style={gradientText}>Multispeciality</span><br />
              <span style={gradientText}>Hospital</span>
            </h1>
            <p className="fu3" style={{ color: "rgba(255,255,255,0.55)", fontSize: "19px", fontStyle: "italic", marginBottom: "16px", fontFamily: "Georgia, serif" }}>— pain to painless —</p>
            <p className="fu3 body-font" style={{ color: "rgba(255,255,255,0.7)", fontSize: "17px", lineHeight: "1.85", marginBottom: "40px", maxWidth: "500px" }}>
              Advanced orthopaedic care powered by the{" "}
              <strong style={{ color: "white" }}>VELYS™ Robotic Knee Replacement</strong>{" "}
              system — now available at Bhayander.
            </p>
            <div className="fu4" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/book" className="body-font"
                style={{ background: "white", color: "#030a1e", padding: "17px 36px", borderRadius: "36px", textDecoration: "none", fontSize: "16px", fontWeight: "700", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                Book Appointment
              </Link>
              <a href="tel:+917021094941" className="body-font"
                style={{ background: "rgba(255,255,255,0.08)", color: "white", padding: "17px 36px", borderRadius: "36px", textDecoration: "none", fontSize: "16px", fontWeight: "600", border: "1.5px solid rgba(255,255,255,0.25)", backdropFilter: "blur(12px)", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
                📞 Call Us
              </a>
            </div>
          </div>

          <div className="fu3">
            <div className="hero-stats">
              {stats.map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "28px 20px", textAlign: "center", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}>
                  <div className="display-font" style={{ color: "white", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: "900", letterSpacing: "-2px", lineHeight: 1 }}>{s.n}</div>
                  <div className="body-font" style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginTop: "8px", letterSpacing: "1px", fontWeight: "500", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "24px 28px", marginTop: "14px", backdropFilter: "blur(24px)" }}>
              <div className="body-font" style={{ color: "#93c5fd", fontSize: "10px", marginBottom: "16px", letterSpacing: "3px", fontWeight: "700" }}>OPD TIMINGS</div>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div>
                  <div className="body-font" style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>10:00 AM – 1:15 PM</div>
                  <div className="body-font" style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "4px" }}>Morning · Tokens 1–72</div>
                </div>
                <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
                <div>
                  <div className="body-font" style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>3:30 PM – 6:45 PM</div>
                  <div className="body-font" style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "4px" }}>Evening · Mon–Sat</div>
                </div>
                <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
                <div>
                  <div className="body-font" style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>10:00 AM – 1:00 PM</div>
                  <div className="body-font" style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "4px" }}>Sunday · Morning only</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", animation: "pulse 2.5s infinite" }}>
          <div className="body-font" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "4px", fontWeight: "600" }}>SCROLL</div>
          <div style={{ width: "1px", height: "48px", background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)" }} />
        </div>
      </div>

      {/* ── VELYS SECTION ── */}
      <section style={{ padding: "120px 6%", background: "#0d1f3c", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-200px", left: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,86,219,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-200px", right: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div className="collage-wrap">
            {["/images/velys1.jpg", "/images/velys2.jpg", "/images/velys3.jpg", "/images/velys4.jpg"].map((src, i) => (
              <div key={i} className="collage-cell">
                <img src={src} alt="VELYS Robotic Surgery" />
              </div>
            ))}
          </div>

          <div>
            <div className="body-font" style={{ display: "inline-block", background: "rgba(26,86,219,0.15)", border: "1px solid rgba(26,86,219,0.35)", color: "#93c5fd", padding: "8px 20px", borderRadius: "30px", fontSize: "11px", letterSpacing: "2.5px", marginBottom: "24px", fontWeight: "700" }}>
              NOW AVAILABLE AT NEEL ORTHOPAEDIC MULTISPECIALITY HOSPITAL
            </div>
            <h2 className="display-font" style={{ color: "white", fontSize: "clamp(32px, 4vw, 54px)", fontWeight: "900", lineHeight: "1.1", marginBottom: "22px", letterSpacing: "-1.5px" }}>
              Robotic Knee<br />
              <span style={{ background: "linear-gradient(135deg, #1a73e8, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Replacement Surgery
              </span>
            </h2>
            <p className="body-font" style={{ color: "rgba(255,255,255,0.65)", fontSize: "17px", lineHeight: "1.9", marginBottom: "36px" }}>
              The VELYS™ Robotic-Assisted Solution gives surgeons precision tools to enhance surgical accuracy — delivering patient-specific outcomes with less pain and faster recovery.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "36px" }}>
              {[
                { icon: "🎯", title: "Higher Precision", desc: "AI-guided cuts, minimal error" },
                { icon: "💉", title: "Lesser Blood Loss", desc: "Minimally invasive approach" },
                { icon: "⚡", title: "Faster Recovery", desc: "Less tissue & ligament damage" },
                { icon: "🩺", title: "Personalized", desc: "Planned for your anatomy" },
              ].map((b, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}>
                  <div style={{ fontSize: "26px", marginBottom: "10px" }}>{b.icon}</div>
                  <div className="body-font" style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "5px" }}>{b.title}</div>
                  <div className="body-font" style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>{b.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(26,86,219,0.1)", border: "1px solid rgba(26,86,219,0.22)", borderRadius: "16px", padding: "20px 24px", marginBottom: "32px", display: "flex", alignItems: "center", gap: "18px" }}>
              <div className="display-font" style={{ fontSize: "36px", color: "#60a5fa", fontWeight: "900" }}>𝕍</div>
              <div>
                <div className="body-font" style={{ color: "white", fontWeight: "800", fontSize: "20px" }}>VELYS™</div>
                <div className="body-font" style={{ color: "#93c5fd", fontSize: "13px" }}>Robotic-Assisted Solution · Johnson & Johnson MedTech</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link href="/book" className="body-font" style={{ background: "linear-gradient(135deg, #1a56db, #1a73e8)", color: "white", padding: "15px 32px", borderRadius: "32px", textDecoration: "none", fontSize: "16px", fontWeight: "700", boxShadow: "0 6px 24px rgba(26,86,219,0.35)", transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                Book Consultation
              </Link>
              <a href="tel:+917021094941" className="body-font" style={{ background: "transparent", color: "rgba(255,255,255,0.7)", padding: "15px 32px", borderRadius: "32px", textDecoration: "none", fontSize: "16px", fontWeight: "600", border: "1px solid rgba(255,255,255,0.2)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}>
                Call for Info
              </a>
            </div>
            <p className="body-font" style={{ color: "rgba(255,255,255,0.18)", fontSize: "11px", marginTop: "22px", lineHeight: "1.7" }}>
              Disclaimer: The VELYS™ Robotic-Assisted Solution is a medical device for use by qualified healthcare professionals. Individual results may vary.
            </p>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ padding: "120px 6%", background: "#ffffff" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ marginBottom: "64px" }}>
            <div className="section-divider" />
            <div className="body-font" style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "3.5px", fontWeight: "700", marginBottom: "16px" }}>SPECIALITIES</div>
            <h2 className="display-font" style={{ fontSize: "clamp(32px, 4.5vw, 56px)", color: "#030a1e", fontWeight: "900", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: "16px" }}>What we treat</h2>
            <p className="body-font" style={{ color: "#6b7280", fontSize: "18px", maxWidth: "520px", lineHeight: "1.75" }}>
              Experience personalized bone, joint & spine care for a truly pain-free life.
            </p>
          </div>
          <div className="services-grid">
            {services.map((s, i) => (
              <div key={i} className="service-card">
                <div className="service-card-inner" style={{ background: s.bg }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "12px", padding: "10px 14px" }}>
                      <div className="body-font" style={{ color: s.accent, fontSize: "10px", fontWeight: "700", letterSpacing: "2px" }}>{s.tag}</div>
                    </div>
                    <div style={{ fontSize: "32px" }}>{s.icon}</div>
                  </div>
                  <div>
                    <h3 className="display-font" style={{ color: "white", fontWeight: "700", fontSize: "20px", lineHeight: "1.25", marginBottom: "8px", whiteSpace: "pre-line" }}>{s.title}</h3>
                    <p className="body-font" style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px" }}>{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "52px" }}>
            <Link href="/services" className="body-font" style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#030a1e", color: "white", padding: "17px 40px", borderRadius: "36px", textDecoration: "none", fontSize: "16px", fontWeight: "700", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#0a2463"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#030a1e"; e.currentTarget.style.transform = "translateY(0)"; }}>
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: "120px 6%", background: "#f8faff" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div className="body-font" style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "3.5px", fontWeight: "700", marginBottom: "16px" }}>OUR TEAM</div>
            <h2 className="display-font" style={{ fontSize: "clamp(32px, 4.5vw, 56px)", color: "#030a1e", fontWeight: "900", letterSpacing: "-2px" }}>Specialists you can trust</h2>
          </div>
          <div className="team-grid">
            {team.map((t, i) => (
              <div key={i}
                style={{ background: "white", borderRadius: "24px", padding: "36px 28px", border: "1px solid #e8edf5", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 16px 48px rgba(10,36,99,0.1)"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "#c7d7f4"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#e8edf5"; }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: t.highlight ? "linear-gradient(135deg, #030a1e, #0a2463)" : "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: t.highlight ? "white" : "#0a2463", fontWeight: "900", fontSize: "24px", marginBottom: "22px", boxShadow: t.highlight ? "0 6px 20px rgba(10,36,99,0.25)" : "none", fontFamily: "'Inter', sans-serif" }}>
                  {t.name.split(" ")[1][0]}
                </div>
                <div className="body-font" style={{ fontWeight: "700", color: "#030a1e", fontSize: "18px", marginBottom: "6px" }}>{t.name}</div>
                <div className="body-font" style={{ color: "#1a73e8", fontSize: "13px", fontWeight: "600", marginBottom: "10px" }}>{t.role}</div>
                <div className="body-font" style={{ color: "#9ca3af", fontSize: "13px", lineHeight: "1.6" }}>{t.qual}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "44px" }}>
            <Link href="/team" className="body-font" style={{ color: "#1a73e8", fontWeight: "700", textDecoration: "none", fontSize: "17px" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#0a2463")}
              onMouseLeave={e => (e.currentTarget.style.color = "#1a73e8")}>
              View full team →
            </Link>
          </div>
        </div>
      </section>
      {/* ── TESTIMONIALS ── */}
<TestimonialsSection />

      {/* ── CTA ── */}
      <section style={{ padding: "120px 6%", background: "#030a1e", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,86,219,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div className="body-font" style={{ display: "inline-block", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", padding: "8px 20px", borderRadius: "30px", fontSize: "11px", letterSpacing: "2.5px", marginBottom: "28px", fontWeight: "700" }}>
            BOOK ONLINE · INSTANT TOKEN
          </div>
          <h2 className="display-font" style={{ color: "white", fontSize: "clamp(32px, 4.5vw, 58px)", fontWeight: "900", marginBottom: "22px", lineHeight: "1.1", letterSpacing: "-2px" }}>
            Skip the Queue.<br />Book in 2 Minutes.
          </h2>
          <p className="body-font" style={{ color: "rgba(255,255,255,0.55)", fontSize: "18px", marginBottom: "48px", lineHeight: "1.8" }}>
            Get your OPD token number instantly. No waiting at the registration desk — just show your QR code and walk in.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/book" className="body-font"
              style={{ background: "white", color: "#030a1e", padding: "18px 42px", borderRadius: "36px", textDecoration: "none", fontSize: "17px", fontWeight: "800", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
              Book Now
            </Link>
            <a href="tel:+917021094941" className="body-font"
              style={{ background: "transparent", color: "rgba(255,255,255,0.8)", padding: "18px 42px", borderRadius: "36px", textDecoration: "none", fontSize: "17px", fontWeight: "600", border: "1.5px solid rgba(255,255,255,0.25)", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}>
              +91 70210 94941
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#020710", padding: "80px 6% 0", color: "rgba(255,255,255,0.4)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="footer-grid" style={{ marginBottom: "56px" }}>
            {/* Col 1: Info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #1a56db, #60a5fa)", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "900", fontSize: "18px", flexShrink: 0 }}>N</div>
                <div className="body-font" style={{ color: "white", fontSize: "15px", fontWeight: "700" }}>Neel Orthopaedic Multispeciality Hospital</div>
              </div>
              <p className="body-font" style={{ fontSize: "14px", lineHeight: "1.9", marginBottom: "14px", maxWidth: "300px" }}>
                1st Floor, Shrinath Apartment, Goddev Naka, B.P. Road, Bhayander East, Mumbai — 401105
              </p>
              <div className="body-font" style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>📞 +91 70210 94941</div>
              <div style={{ fontSize: "13px", fontStyle: "italic", color: "rgba(255,255,255,0.18)", marginTop: "14px", fontFamily: "Georgia, serif" }}>— pain to painless —</div>
            </div>

            {/* Col 2: Links + Timings */}
            <div>
              <div className="body-font" style={{ color: "white", fontWeight: "700", marginBottom: "20px", fontSize: "12px", letterSpacing: "2.5px" }}>QUICK LINKS</div>
              {[
                { label: "Book Appointment", href: "/book" },
                { label: "Our Services", href: "/services" },
                { label: "Our Doctors", href: "/team" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map(l => (
                <div key={l.label} style={{ marginBottom: "12px" }}>
                  <a href={l.href} className="body-font" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "white")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
                    {l.label}
                  </a>
                </div>
              ))}
              <div className="body-font" style={{ color: "white", fontWeight: "700", marginBottom: "16px", marginTop: "28px", fontSize: "12px", letterSpacing: "2.5px" }}>OPD TIMINGS</div>
              <div className="body-font" style={{ fontSize: "13px", lineHeight: "2.1" }}>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: "600", letterSpacing: "1.5px" }}>MON – SAT</div>
                <div>Morning: <span style={{ color: "white", fontWeight: "600" }}>10:00 AM – 1:15 PM</span></div>
                <div>Evening: <span style={{ color: "white", fontWeight: "600" }}>3:30 PM – 6:45 PM</span></div>
                <div style={{ marginTop: "10px", color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: "600", letterSpacing: "1.5px" }}>SUNDAY</div>
                <div>Morning only: <span style={{ color: "white", fontWeight: "600" }}>10:00 AM – 1:00 PM</span></div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>No evening session on Sundays</div>
                <div style={{ marginTop: "10px", color: "#34d399", fontWeight: "700", fontSize: "14px" }}>🚨 Emergency: 24/7</div>
              </div>
            </div>

            {/* Col 3: Google Maps */}
            <div>
              <div className="body-font" style={{ color: "white", fontWeight: "700", marginBottom: "20px", fontSize: "12px", letterSpacing: "2.5px" }}>FIND US</div>
              <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.123456!2d72.8585668!3d19.3045692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b02e9efb02b5%3A0x2958a8f353e885fd!2sNeel%20Orthopedic%20Super%20Specialty%20Hospital!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="220"
                  style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg)" }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Neel Orthopaedic Multispeciality Hospital Location"
                />
              </div>
              <a
                href="https://maps.app.goo.gl/1SzWbWRuMnLrNidV8"
                target="_blank"
                rel="noopener noreferrer"
                className="body-font"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "12px", color: "#60a5fa", textDecoration: "none", fontSize: "13px", fontWeight: "600", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = "#60a5fa")}>
                📍 Get Directions →
              </a>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "28px", paddingBottom: "28px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <span className="body-font" style={{ fontSize: "13px" }}>© 2026 Neel Orthopaedic Multispeciality Hospital. All rights reserved.</span>
            <span style={{ fontSize: "13px", fontStyle: "italic", color: "rgba(255,255,255,0.15)", fontFamily: "Georgia, serif" }}>pain to painless</span>
          </div>
        </div>
      </footer>
    </div>
  );
}