"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService(prev => (prev + 1) % services.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    { title: "Robotic Knee Replacement", sub: "VELYS™ by Johnson & Johnson", icon: "🦾" },
    { title: "Total Hip Replacement", sub: "Minimally invasive technique", icon: "🦴" },
    { title: "Spine Surgery", sub: "Fellowship trained, Germany", icon: "🧬" },
    { title: "Arthroscopic Surgery", sub: "Knee & shoulder injuries", icon: "⚡" },
    { title: "Trauma & Reconstruction", sub: "Emergency & elective care", icon: "🩹" },
  ];

  const stats = [
    { n: "200+", label: "Patients daily" },
    { n: "5000+", label: "Surgeries done" },
    { n: "15+", label: "Years experience" },
    { n: "24/7", label: "Emergency" },
  ];

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Doctors", href: "/team" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <div style={{ background: "#fff", fontFamily: "Georgia, 'Times New Roman', serif", overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .services-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
        .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; }
        .nav-desktop { display: flex; gap: 28px; align-items: center; }
        .nav-mobile { display: none; }
        .hamburger { display: none; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr; gap: 32px; }
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .services-grid { grid-template-columns: 1fr; gap: 32px; }
          .team-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .nav-desktop { display: none; }
          .hamburger { display: flex; background: none; border: none; cursor: pointer; flex-direction: column; gap: 5px; padding: 4px; }
          .nav-mobile { display: flex; flex-direction: column; position: fixed; top: 65px; left: 0; right: 0; background: #0a2463; padding: 20px 5%; gap: 4px; z-index: 99; border-top: 1px solid rgba(255,255,255,0.1); }
          .cta-grid { flex-direction: column !important; }
          .section-pad { padding: 60px 5% !important; }
          .hero-pad { padding: 100px 5% 60px !important; }
        }
        @media (max-width: 480px) {
          .team-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(10,36,99,0.97)" : "#0a2463",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s",
        padding: "0 5%", height: "65px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.15)" : "none"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "#1a73e8", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "16px", flexShrink: 0 }}>N</div>
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "14px", letterSpacing: "-0.3px" }}>Neel Orthopaedic</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px" }}>MULTISPECIALITY HOSPITAL</div>
          </div>
        </div>

        <div className="nav-desktop">
          {navLinks.map(item => (
            <a key={item.label} href={item.href} style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>{item.label}</a>
          ))}
          <Link href="/book" style={{ background: "#1a73e8", color: "white", padding: "10px 22px", borderRadius: "25px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Book OPD</Link>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span style={{ width: "22px", height: "2px", background: "white", display: "block", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ width: "22px", height: "2px", background: "white", display: "block", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ width: "22px", height: "2px", background: "white", display: "block", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      </nav>

      {/* mobile menu */}
      {menuOpen && (
        <div className="nav-mobile">
          {navLinks.map(item => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
              style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "16px", fontWeight: "500", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {item.label}
            </a>
          ))}
          <Link href="/book" onClick={() => setMenuOpen(false)}
            style={{ background: "#1a73e8", color: "white", padding: "14px", borderRadius: "10px", textDecoration: "none", fontSize: "16px", fontWeight: "700", textAlign: "center", marginTop: "8px", display: "block" }}>
            Book OPD Appointment
          </Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(135deg, #0a2463 0%, #1a3a8f 40%, #1a73e8 100%)", padding: "100px 5% 80px", position: "relative", overflow: "hidden" }} className="hero-pad">
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="hero-grid">
            <div>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#90caf9", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", letterSpacing: "1px", marginBottom: "24px" }}>
                BHAYANDER EAST, MUMBAI
              </div>
              <h1 style={{ color: "white", fontSize: "clamp(32px, 5vw, 58px)", fontWeight: "700", lineHeight: "1.15", marginBottom: "12px", letterSpacing: "-0.5px" }}>
                Neel Orthopaedic<br />
                <span style={{ color: "#90caf9" }}>&amp; Multi Speciality</span><br />
                Hospital
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "clamp(14px, 2vw, 18px)", fontStyle: "italic", marginBottom: "16px" }}>— pain to painless —</p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "clamp(14px, 1.8vw, 16px)", lineHeight: "1.7", marginBottom: "32px", maxWidth: "500px" }}>
                Home to Mumbai's first <strong style={{ color: "white" }}>VELYS™ Robotic Knee Replacement</strong> system by Johnson &amp; Johnson MedTech.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link href="/book" style={{ background: "white", color: "#0a2463", padding: "14px 28px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "700", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>Book Appointment</Link>
                <a href="tel:+917021094941" style={{ background: "transparent", color: "white", padding: "14px 28px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "600", border: "2px solid rgba(255,255,255,0.5)" }}>Call Us</a>
              </div>
            </div>

            {/* stats */}
            <div>
              <div className="stats-grid">
                {stats.map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "16px", padding: "24px", textAlign: "center" }}>
                    <div style={{ color: "white", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "800", letterSpacing: "-1px", lineHeight: 1 }}>{s.n}</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", marginTop: "6px" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* OPD timings card */}
              <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "16px", padding: "20px 24px", marginTop: "16px" }}>
                <div style={{ color: "#90caf9", fontSize: "12px", marginBottom: "10px", letterSpacing: "1px" }}>OPD TIMINGS</div>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontWeight: "600", color: "white", fontSize: "14px" }}>10:00 AM – 1:15 PM</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>Morning · 72 slots</div>
                  </div>
                  <div style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />
                  <div>
                    <div style={{ fontWeight: "600", color: "white", fontSize: "14px" }}>3:30 PM – 6:45 PM</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>Evening · 72 slots</div>
                  </div>
                </div>
                {/* Sunday note */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                  <div style={{ color: "#90caf9", fontSize: "12px" }}>
                    🗓 <strong>Sunday:</strong> Morning only — 10:00 AM – 1:00 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ padding: "80px 5%", background: "white" }} className="section-pad">
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "48px" }}>
            <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>SPECIALITIES</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", color: "#0a2463", fontWeight: "700", marginBottom: "8px" }}>What we treat</h2>
          </div>
          <div className="services-grid">
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {services.map((s, i) => (
                  <button key={i} onClick={() => setActiveService(i)}
                    style={{ padding: "16px 20px", borderRadius: "12px", border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.25s", background: activeService === i ? "#0a2463" : "#f8f9fc", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "20px" }}>{s.icon}</span>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: activeService === i ? "white" : "#0a2463" }}>{s.title}</div>
                      <div style={{ fontSize: "12px", color: activeService === i ? "rgba(255,255,255,0.7)" : "#888", marginTop: "2px" }}>{s.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: "#f0f4ff", borderRadius: "20px", padding: "36px", border: "1px solid #e0e7ff", minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>{services[activeService].icon}</div>
                <h3 style={{ fontSize: "clamp(20px, 2.5vw, 26px)", color: "#0a2463", fontWeight: "700", marginBottom: "8px" }}>{services[activeService].title}</h3>
                <p style={{ color: "#888", fontSize: "15px" }}>{services[activeService].sub}</p>
                {activeService === 0 && (
                  <div style={{ background: "#e8f0ff", borderRadius: "10px", padding: "12px 16px", marginTop: "16px" }}>
                    <div style={{ fontSize: "11px", color: "#1a73e8", fontWeight: "600", marginBottom: "4px" }}>FEATURED TECHNOLOGY</div>
                    <div style={{ fontWeight: "600", color: "#0a2463", fontSize: "14px" }}>Johnson &amp; Johnson VELYS™ Robotic System</div>
                  </div>
                )}
              </div>
              <Link href="/book" style={{ marginTop: "24px", color: "#1a73e8", fontWeight: "700", fontSize: "14px", textDecoration: "none" }}>
                Book a consultation →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: "80px 5%", background: "#f8f9fc" }} className="section-pad">
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>OUR TEAM</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", color: "#0a2463", fontWeight: "700" }}>Specialists you can trust</h2>
          </div>
          <div className="team-grid">
            {[
              { name: "Dr. G.K. Boob", role: "Orthopaedic Surgeon", qual: "DNB Ortho | Fellowship Spine, Germany", highlight: true },
              { name: "Dr. Vijay Rangani", role: "Anaesthetist", qual: "MBBS / DA", highlight: false },
              { name: "Dr. Jay Pathak", role: "Physiotherapist", qual: "B.PTH", highlight: false },
              { name: "Dr. Chetan Bhambure", role: "Cardiologist", qual: "DM Cardiology", highlight: false },
            ].map((t, i) => (
              <div key={i} style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e8edf5" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: t.highlight ? "#0a2463" : "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", color: t.highlight ? "white" : "#555", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>
                  {t.name.split(" ")[1][0]}
                </div>
                <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "15px", marginBottom: "4px" }}>{t.name}</div>
                <div style={{ color: "#1a73e8", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>{t.role}</div>
                <div style={{ color: "#888", fontSize: "12px" }}>{t.qual}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link href="/team" style={{ color: "#1a73e8", fontWeight: "700", textDecoration: "none", fontSize: "15px" }}>View full team profiles →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 5%", background: "#0a2463" }} className="section-pad">
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "white", fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: "700", marginBottom: "16px" }}>Book Your Appointment Online</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "clamp(14px, 2vw, 16px)", marginBottom: "32px", lineHeight: "1.6" }}>
            Skip the queue. Book your OPD slot, get a token number and SMS confirmation — all in under 2 minutes.
          </p>
          <div className="cta-grid" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/book" style={{ background: "white", color: "#0a2463", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "700" }}>Book Now</Link>
            <Link href="/walkin" style={{ background: "transparent", color: "white", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "600", border: "2px solid rgba(255,255,255,0.4)" }}>Walk-in Token</Link>
            <a href="tel:+917021094941" style={{ background: "transparent", color: "white", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "600", border: "2px solid rgba(255,255,255,0.4)" }}>+91 70210 94941</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#06142e", padding: "60px 5% 30px", color: "rgba(255,255,255,0.5)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="footer-grid" style={{ marginBottom: "40px" }}>
            <div>
              <div style={{ color: "white", fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>Neel Orthopaedic Multispeciality Hospital</div>
              <p style={{ fontSize: "14px", lineHeight: "1.8", marginBottom: "12px", maxWidth: "300px" }}>1st Floor, Shrinath Apartment, Goddev Naka, B.P. Road, Bhayander East, Mumbai — 401105</p>
              <div style={{ fontSize: "14px" }}>📞 +91 70210 94941</div>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: "600", marginBottom: "16px", fontSize: "13px", letterSpacing: "1px" }}>QUICK LINKS</div>
              {[
                { label: "Book Appointment", href: "/book" },
                { label: "Our Services", href: "/services" },
                { label: "Our Doctors", href: "/team" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map(l => (
                <div key={l.label} style={{ marginBottom: "10px" }}>
                  <a href={l.href} style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: "14px" }}>{l.label}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: "white", fontWeight: "600", marginBottom: "16px", fontSize: "13px", letterSpacing: "1px" }}>OPD TIMINGS</div>
              <div style={{ fontSize: "14px", lineHeight: "2" }}>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: "600" }}>Mon – Sat</div>
                <div>Morning: <span style={{ color: "white" }}>10:00 AM – 1:15 PM</span></div>
                <div>Evening: <span style={{ color: "white" }}>3:30 PM – 6:45 PM</span></div>
                <div style={{ marginTop: "10px", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: "600" }}>Sunday</div>
                <div>Morning only: <span style={{ color: "white" }}>10:00 AM – 1:00 PM</span></div>
                <div style={{ marginTop: "8px", color: "#90caf9" }}>Emergency: 24/7</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "13px" }}>
            <span>© 2026 Neel Orthopaedic Multispeciality Hospital</span>
            <span style={{ fontStyle: "italic" }}>pain to painless</span>
          </div>
        </div>
      </footer>
    </div>
  );
}