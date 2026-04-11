"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [activeService, setActiveService] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
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
    { title: "Robotic Knee Replacement", sub: "VELYS™ by Johnson & Johnson", icon: "⟡" },
    { title: "Total Hip Replacement", sub: "Minimally invasive technique", icon: "⟡" },
    { title: "Spine Surgery", sub: "Fellowship trained, Germany", icon: "⟡" },
    { title: "Arthroscopic Surgery", sub: "Knee & shoulder injuries", icon: "⟡" },
    { title: "Trauma & Reconstruction", sub: "Emergency & elective care", icon: "⟡" },
  ];

  const stats = [
    { n: "200+", label: "Patients daily" },
    { n: "72", label: "Online slots/session" },
    { n: "15+", label: "Years experience" },
    { n: "24/7", label: "Emergency care" },
  ];

  const team = [
    { name: "Dr. G.K. Boob", role: "Orthopaedic Surgeon", qual: "DNB Ortho | Fellowship Spine Surgery, Germany", time: "OPD: 10am–1:15pm & 3:30–6:45pm" },
    { name: "Dr. Vijay Rangani", role: "Anaesthetist", qual: "MBBS / DA", time: "Pre-anaesthetic checkup & anaesthesia" },
    { name: "Dr. Jay Pathak", role: "Physiotherapist", qual: "B.PTH", time: "Post-surgical rehabilitation" },
    { name: "Dr. Chetan Bhambure", role: "Physician & Cardiologist", qual: "DM Cardiology", time: "9am–10am | Pre-surgery fitness" },
  ];

  const rooms = [
    { type: "AC Economy Ward", rooms: "1101–1104", beds: 4 },
    { type: "Single AC Deluxe", rooms: "1105, 2101, 2102, 2107", beds: 4 },
    { type: "Twin Sharing AC", rooms: "2103–2106", beds: 4 },
    { type: "ICU", rooms: "Critical care", beds: 3 },
  ];

  const navScrolled = scrollY > 60;

  return (
    <div style={{ background: "#fff", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,300&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #0066ff22; }
        .nav-link { color: #111; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: -0.2px; transition: color 0.2s; position: relative; }
        .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1.5px; background: #0066ff; transition: width 0.25s; }
        .nav-link:hover { color: #0066ff; }
        .nav-link:hover::after { width: 100%; }
        .stat-card { border: 1px solid #e8e8e8; border-radius: 16px; padding: 28px 24px; transition: all 0.3s; cursor: default; }
        .stat-card:hover { border-color: #0066ff; transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,102,255,0.08); }
        .service-pill { padding: 10px 20px; border-radius: 100px; border: 1.5px solid #e8e8e8; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.25s; background: white; color: #333; }
        .service-pill:hover, .service-pill.active { background: #0066ff; border-color: #0066ff; color: white; }
        .team-card { border: 1px solid #f0f0f0; border-radius: 20px; padding: 28px; transition: all 0.3s; }
        .team-card:hover { border-color: #0066ff22; box-shadow: 0 16px 48px rgba(0,102,255,0.08); transform: translateY(-2px); }
        .room-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #f5f5f5; }
        .room-row:last-child { border-bottom: none; }
        .book-btn { background: #0066ff; color: white; padding: 14px 32px; border-radius: 100px; font-size: 15px; font-weight: 600; text-decoration: none; transition: all 0.25s; display: inline-block; letter-spacing: -0.2px; }
        .book-btn:hover { background: #0052cc; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,102,255,0.3); }
        .outline-btn { background: transparent; color: #111; padding: 14px 32px; border-radius: 100px; font-size: 15px; font-weight: 500; text-decoration: none; transition: all 0.25s; display: inline-block; border: 1.5px solid #e0e0e0; letter-spacing: -0.2px; }
        .outline-btn:hover { border-color: #0066ff; color: #0066ff; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: #f0f5ff; border: 1px solid #ddeaff; color: #0066ff; padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 500; margin-bottom: 32px; }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: #0066ff; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(0,102,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.04) 1px, transparent 1px); background-size: 48px 48px; }
        .fade-in { animation: fadeIn 0.8s ease forwards; opacity: 0; }
        @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } from { opacity: 0; transform: translateY(20px); } }
        .section-label { font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #0066ff; text-transform: uppercase; margin-bottom: 12px; }
        .section-title { font-family: 'DM Serif Display', serif; font-size: clamp(32px, 4vw, 48px); color: #0a0a0a; line-height: 1.15; letter-spacing: -1px; margin-bottom: 16px; }
        .section-sub { font-size: 17px; color: #666; line-height: 1.7; max-width: 520px; font-weight: 300; }
        .feature-chip { display: inline-flex; align-items: center; gap: 6px; background: #f8f8f8; border: 1px solid #efefef; border-radius: 100px; padding: 6px 14px; font-size: 13px; color: #444; font-weight: 500; }
        .cta-section { background: #0a0a0a; border-radius: 32px; padding: 80px 60px; position: relative; overflow: hidden; }
        .cta-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(0,102,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.08) 1px, transparent 1px); background-size: 48px 48px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 5%", height: "68px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: navScrolled ? "rgba(255,255,255,0.92)" : "white",
        backdropFilter: navScrolled ? "blur(20px)" : "none",
        borderBottom: navScrolled ? "1px solid #f0f0f0" : "1px solid transparent",
        transition: "all 0.3s"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", background: "#0066ff",
            borderRadius: "10px", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white", fontWeight: "700", fontSize: "16px",
            fontFamily: "'DM Serif Display', serif"
          }}>N</div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#0a0a0a", letterSpacing: "-0.3px" }}>Neel Orthopaedic</div>
            <div style={{ fontSize: "10px", color: "#999", letterSpacing: "1.5px", fontWeight: "500" }}>MULTISPECIALITY HOSPITAL</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {["Services", "Doctors", "Rooms", "Contact"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">{item}</a>
          ))}
          <Link href="/book" className="book-btn" style={{ padding: "10px 22px", fontSize: "14px" }}>Book OPD</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 5% 80px", position: "relative" }}>
        <div className="grid-bg" />
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div className="fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="hero-badge">
              <span className="dot" />
              Bhayander East, Mumbai — Est. 2009
            </div>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(40px, 5.5vw, 68px)",
              color: "#0a0a0a", lineHeight: "1.08",
              letterSpacing: "-2px", marginBottom: "24px"
            }}>
              Advanced<br />
              <span style={{ color: "#0066ff" }}>Orthopaedic</span><br />
              Care.
            </h1>
            <p style={{ fontSize: "18px", color: "#555", lineHeight: "1.75", marginBottom: "16px", fontWeight: "300", maxWidth: "440px" }}>
              Home to Mumbai's first <strong style={{ color: "#0a0a0a", fontWeight: "600" }}>VELYS™ Robotic Knee Replacement</strong> system. Where technology meets precision surgery.
            </p>
            <p style={{ fontSize: "15px", color: "#888", fontStyle: "italic", marginBottom: "36px" }}>— pain to painless —</p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
              <Link href="/book" className="book-btn">Book Appointment →</Link>
              <a href="tel:+917021094941" className="outline-btn">+91 70210 94941</a>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["VELYS™ Robotic System", "Cashless Mediclaim", "Digital Prescriptions", "24/7 Emergency"].map(f => (
                <span key={f} className="feature-chip">
                  <span style={{ color: "#0066ff", fontSize: "10px" }}>●</span> {f}
                </span>
              ))}
            </div>
          </div>

          {/* right side stats */}
          <div className="fade-in" style={{ animationDelay: "0.3s", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "42px", color: "#0066ff", letterSpacing: "-2px", lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px", fontWeight: "400" }}>{s.label}</div>
              </div>
            ))}
            <div className="stat-card" style={{ gridColumn: "1/-1", background: "#f7faff", border: "1px solid #ddeaff" }}>
              <div style={{ fontSize: "12px", color: "#0066ff", fontWeight: "600", letterSpacing: "1px", marginBottom: "8px" }}>OPD TIMINGS</div>
              <div style={{ display: "flex", gap: "24px" }}>
                <div>
                  <div style={{ fontWeight: "600", color: "#0a0a0a", fontSize: "15px" }}>10:00 AM – 1:15 PM</div>
                  <div style={{ color: "#888", fontSize: "13px" }}>Morning session · 72 slots</div>
                </div>
                <div style={{ width: "1px", background: "#ddeaff" }} />
                <div>
                  <div style={{ fontWeight: "600", color: "#0a0a0a", fontSize: "15px" }}>3:30 PM – 6:45 PM</div>
                  <div style={{ color: "#888", fontSize: "13px" }}>Evening session · 72 slots</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: "100px 5%", background: "#fafafa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>
            <div>
              <div className="section-label">Specialities</div>
              <h2 className="section-title">Surgical procedures<br />we specialise in</h2>
              <p className="section-sub">From robotic-assisted joint replacements to complex spine surgeries — advanced orthopaedic care under one roof.</p>
              <div style={{ marginTop: "32px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {services.map((s, i) => (
                  <button key={i} className={`service-pill ${activeService === i ? "active" : ""}`}
                    onClick={() => setActiveService(i)}>
                    {s.title.split(" ")[0]} {s.title.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: "white", borderRadius: "24px", padding: "40px", border: "1px solid #f0f0f0", minHeight: "280px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ width: "48px", height: "48px", background: "#f0f5ff", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#0066ff", marginBottom: "24px" }}>+</div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: "#0a0a0a", letterSpacing: "-0.5px", marginBottom: "8px" }}>
                  {services[activeService].title}
                </h3>
                <p style={{ color: "#888", fontSize: "15px", fontWeight: "300" }}>{services[activeService].sub}</p>
              </div>
              {activeService === 0 && (
                <div style={{ background: "#f0f5ff", borderRadius: "12px", padding: "16px 20px", marginTop: "24px" }}>
                  <div style={{ fontSize: "12px", color: "#0066ff", fontWeight: "600", letterSpacing: "1px", marginBottom: "4px" }}>FEATURED TECHNOLOGY</div>
                  <div style={{ fontWeight: "600", color: "#0a0a0a" }}>Johnson & Johnson VELYS™ Robotic System</div>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>World's most advanced robotic knee replacement platform</div>
                </div>
              )}
              <Link href="/book" style={{ marginTop: "32px", color: "#0066ff", fontWeight: "600", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                Book a consultation →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SURGERY TIMINGS ── */}
      <section style={{ padding: "60px 5%", background: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ background: "#f7faff", border: "1px solid #ddeaff", borderRadius: "20px", padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "32px", flexWrap: "wrap" }}>
            <div>
              <div className="section-label" style={{ marginBottom: "6px" }}>Surgery Schedule</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#0a0a0a" }}>Elective surgeries: 7:00 AM – 10:00 AM & 2:00 PM – 3:00 PM</div>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ textAlign: "center", background: "white", borderRadius: "12px", padding: "16px 24px", border: "1px solid #e8e8e8" }}>
                <div style={{ fontWeight: "700", color: "#0066ff", fontSize: "18px" }}>7–10 AM</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Morning OT</div>
              </div>
              <div style={{ textAlign: "center", background: "white", borderRadius: "12px", padding: "16px 24px", border: "1px solid #e8e8e8" }}>
                <div style={{ fontWeight: "700", color: "#0066ff", fontSize: "18px" }}>2–3 PM</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Afternoon OT</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="doctors" style={{ padding: "100px 5%", background: "#fafafa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "56px" }}>
            <div className="section-label">Our Team</div>
            <h2 className="section-title">Specialists you<br />can trust</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {team.map((t, i) => (
              <div key={i} className="team-card">
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: i === 0 ? "#0066ff" : "#f5f5f5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "20px", color: i === 0 ? "white" : "#333",
                  marginBottom: "20px", fontWeight: "700"
                }}>
                  {t.name.split(" ")[1][0]}
                </div>
                <div style={{ fontWeight: "600", fontSize: "16px", color: "#0a0a0a", marginBottom: "4px" }}>{t.name}</div>
                <div style={{ color: "#0066ff", fontSize: "13px", fontWeight: "500", marginBottom: "8px" }}>{t.role}</div>
                <div style={{ color: "#888", fontSize: "13px", marginBottom: "12px", fontWeight: "300" }}>{t.qual}</div>
                <div style={{ fontSize: "12px", color: "#aaa", borderTop: "1px solid #f5f5f5", paddingTop: "12px" }}>{t.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROOMS ── */}
      <section id="rooms" style={{ padding: "100px 5%", background: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>
          <div>
            <div className="section-label">Facilities</div>
            <h2 className="section-title">Comfortable<br />recovery rooms</h2>
            <p className="section-sub">All AC rooms with modern amenities. ICU with 3 dedicated beds for critical care.</p>
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["Cashless Mediclaim", "24/7 Nursing Care", "ICU Available"].map(f => (
                <span key={f} className="feature-chip">
                  <span style={{ color: "#0066ff", fontSize: "10px" }}>●</span> {f}
                </span>
              ))}
            </div>
          </div>
          <div style={{ background: "#fafafa", borderRadius: "20px", padding: "32px", border: "1px solid #f0f0f0" }}>
            {rooms.map((r, i) => (
              <div key={i} className="room-row">
                <div>
                  <div style={{ fontWeight: "600", color: "#0a0a0a", fontSize: "15px" }}>{r.type}</div>
                  <div style={{ color: "#888", fontSize: "13px", marginTop: "2px" }}>Room {r.rooms}</div>
                </div>
                <div style={{
                  background: "#f0f5ff", color: "#0066ff",
                  padding: "4px 12px", borderRadius: "100px",
                  fontSize: "12px", fontWeight: "600"
                }}>{r.beds} beds</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "60px 5% 100px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="cta-section">
            <div className="cta-grid" />
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr auto", gap: "60px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "2px", color: "#0066ff", marginBottom: "16px" }}>BOOK ONLINE</div>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 3.5vw, 44px)", color: "white", letterSpacing: "-1px", marginBottom: "16px", lineHeight: 1.15 }}>
                  Skip the queue.<br />Book your token online.
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", fontWeight: "300", maxWidth: "480px", lineHeight: 1.7 }}>
                  144 online slots available daily. Book your OPD appointment in under 2 minutes and get your token number instantly.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
                <Link href="/book" style={{ background: "#0066ff", color: "white", padding: "16px 36px", borderRadius: "100px", textDecoration: "none", fontSize: "15px", fontWeight: "600", textAlign: "center", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                  Book OPD Appointment
                </Link>
                <a href="tel:+917021094941" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", padding: "16px 36px", borderRadius: "100px", textDecoration: "none", fontSize: "15px", fontWeight: "400", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)", whiteSpace: "nowrap" }}>
                  +91 70210 94941
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" style={{ background: "#0a0a0a", padding: "60px 5% 40px", color: "rgba(255,255,255,0.4)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", background: "#0066ff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px" }}>N</div>
                <div style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>Neel Orthopaedic</div>
              </div>
              <p style={{ fontSize: "14px", lineHeight: "1.8", maxWidth: "280px", fontWeight: "300" }}>
                1st Floor, Shrinath Apartment,<br />Goddev Naka, B.P. Road,<br />Bhayander East, Thane,<br />Mumbai — 401105, MH
              </p>
              <div style={{ marginTop: "16px", color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>📞 +91 70210 94941</div>
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", letterSpacing: "1.5px", fontWeight: "600", marginBottom: "16px" }}>SERVICES</div>
              {["Robotic Knee Replacement", "Hip Replacement", "Spine Surgery", "Arthroscopy", "Trauma Care"].map(s => (
                <div key={s} style={{ marginBottom: "10px", fontSize: "13px", fontWeight: "300" }}>{s}</div>
              ))}
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", letterSpacing: "1.5px", fontWeight: "600", marginBottom: "16px" }}>HOSPITAL</div>
              {["Book Appointment", "Token Status", "Our Doctors", "Room Facilities", "Emergency"].map(s => (
                <div key={s} style={{ marginBottom: "10px", fontSize: "13px", fontWeight: "300" }}>{s}</div>
              ))}
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", letterSpacing: "1.5px", fontWeight: "600", marginBottom: "16px" }}>TIMINGS</div>
              <div style={{ fontSize: "13px", lineHeight: "1.9", fontWeight: "300" }}>
                <div style={{ color: "rgba(255,255,255,0.6)", fontWeight: "500" }}>OPD</div>
                <div>10:00 – 13:15</div>
                <div>15:30 – 18:45</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontWeight: "500", marginTop: "12px" }}>Surgery OT</div>
                <div>07:00 – 10:00</div>
                <div>14:00 – 15:00</div>
                <div style={{ color: "#0066ff", marginTop: "12px", fontWeight: "500" }}>Emergency 24/7</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span>© 2026 Neel Orthopaedic & Multi Speciality Hospital</span>
            <span style={{ fontStyle: "italic" }}>pain to painless</span>
          </div>
        </div>
      </footer>
    </div>
  );
}