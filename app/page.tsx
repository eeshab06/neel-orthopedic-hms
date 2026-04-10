"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const services = [
    { icon: "🦾", title: "Robotic Knee Replacement", desc: "World's most advanced VELYS™ robotic system by Johnson & Johnson MedTech" },
    { icon: "🦴", title: "Hip Replacement", desc: "Minimally invasive hip replacement with faster recovery and less pain" },
    { icon: "🧠", title: "Spine Surgery", desc: "Advanced spinal procedures for disc, deformity and pain conditions" },
    { icon: "🩹", title: "Trauma & Fractures", desc: "Emergency and elective fracture care with modern fixation techniques" },
    { icon: "⚡", title: "Arthroscopic Surgery", desc: "Keyhole surgery for joints — knee, shoulder, ankle and sports injuries" },
  ];

  const stats = [
    { number: "5000+", label: "Surgeries Performed" },
    { number: "15+", label: "Years of Excellence" },
    { number: "98%", label: "Patient Satisfaction" },
    { number: "24/7", label: "Emergency Care" },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#f8f9fc", minHeight: "100vh" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(10,36,99,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s ease",
        padding: "0 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "70px",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.15)" : "none"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "50%",
            background: "linear-gradient(135deg, #1a73e8, #0a2463)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", color: "white", fontWeight: "bold"
          }}>N</div>
          <div>
            <div style={{ color: "white", fontWeight: "bold", fontSize: "15px", letterSpacing: "0.5px" }}>
              Neel Orthopaedic
            </div>
            <div style={{ color: "#90caf9", fontSize: "11px", letterSpacing: "1px" }}>
              MULTISPECIALITY HOSPITAL
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          {["Home", "Services", "Doctors", "About", "Contact"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              color: "rgba(255,255,255,0.85)", textDecoration: "none",
              fontSize: "14px", letterSpacing: "0.5px",
              transition: "color 0.2s"
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#90caf9")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
            >{item}</a>
          ))}
          <Link href="/book" style={{
            background: "#1a73e8", color: "white",
            padding: "9px 22px", borderRadius: "25px",
            textDecoration: "none", fontSize: "14px", fontWeight: "600",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(26,115,232,0.4)"
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1557b0"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1a73e8"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >Book Appointment</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a2463 0%, #1a3a8f 40%, #1a73e8 100%)",
        display: "flex", alignItems: "center",
        padding: "120px 5% 80px",
        position: "relative", overflow: "hidden"
      }}>
        {/* background circles */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: "-150px", left: "30%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: "60px" }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: "inline-block", background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#90caf9", padding: "6px 16px", borderRadius: "20px",
              fontSize: "13px", letterSpacing: "1px", marginBottom: "24px"
            }}>
              BHAYANDER EAST, MUMBAI
            </div>
            <h1 style={{
              color: "white", fontSize: "clamp(36px, 5vw, 58px)",
              fontWeight: "700", lineHeight: "1.15", margin: "0 0 12px",
              letterSpacing: "-0.5px"
            }}>
              Neel Orthopaedic<br />
              <span style={{ color: "#90caf9" }}>& Multi Speciality</span><br />
              Hospital
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.7)", fontSize: "18px",
              fontStyle: "italic", margin: "0 0 16px", letterSpacing: "0.5px"
            }}>
              — pain to painless —
            </p>
            <p style={{
              color: "rgba(255,255,255,0.75)", fontSize: "16px",
              lineHeight: "1.7", margin: "0 0 36px", maxWidth: "500px"
            }}>
              Home to Mumbai's first <strong style={{ color: "white" }}>VELYS™ Robotic Knee Replacement</strong> system by Johnson & Johnson MedTech. Where advanced technology meets compassionate care.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/book" style={{
                background: "white", color: "#0a2463",
                padding: "14px 32px", borderRadius: "30px",
                textDecoration: "none", fontSize: "15px", fontWeight: "700",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                transition: "all 0.2s"
              }}>Book Appointment</Link>
              <a href="tel:+917021094941" style={{
                background: "transparent", color: "white",
                padding: "14px 32px", borderRadius: "30px",
                textDecoration: "none", fontSize: "15px", fontWeight: "600",
                border: "2px solid rgba(255,255,255,0.5)",
                transition: "all 0.2s"
              }}>+91 70210 94941</a>
            </div>
          </div>

          {/* stats card */}
          <div style={{
            flex: "0 0 340px",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "20px", padding: "36px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px"
          }}>
            {stats.map(s => (
              <div key={s.number} style={{ textAlign: "center" }}>
                <div style={{ color: "white", fontSize: "28px", fontWeight: "800", letterSpacing: "-1px" }}>{s.number}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", marginTop: "4px", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            ))}
            <div style={{ gridColumn: "1/-1", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "20px", textAlign: "center" }}>
              <div style={{ color: "#90caf9", fontSize: "13px", marginBottom: "6px" }}>Emergency Helpline</div>
              <div style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>+91 70210 94941</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: "90px 5%", background: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ color: "#1a73e8", fontSize: "13px", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>WHAT WE TREAT</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "#0a2463", fontWeight: "700", margin: "0 0 16px" }}>Our Specialities</h2>
            <p style={{ color: "#666", fontSize: "16px", maxWidth: "500px", margin: "0 auto", lineHeight: "1.6" }}>
              Advanced orthopaedic care delivered by experienced specialists using the latest technology.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {services.map((s, i) => (
              <div key={i} style={{
                background: i === 0 ? "linear-gradient(135deg, #0a2463, #1a73e8)" : "#f8f9fc",
                borderRadius: "16px", padding: "32px",
                border: i === 0 ? "none" : "1px solid #e8edf5",
                transition: "all 0.3s",
                cursor: "pointer"
              }}
                onMouseEnter={e => { if (i !== 0) { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(26,115,232,0.15)"; } }}
                onMouseLeave={e => { if (i !== 0) { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; } }}
              >
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{s.icon}</div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: i === 0 ? "white" : "#0a2463", margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ color: i === 0 ? "rgba(255,255,255,0.75)" : "#666", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{s.desc}</p>
                {i === 0 && (
                  <div style={{
                    marginTop: "20px", display: "inline-block",
                    background: "rgba(255,255,255,0.15)", color: "white",
                    padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
                    border: "1px solid rgba(255,255,255,0.3)"
                  }}>VELYS™ Robotic System</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOK APPOINTMENT CTA ── */}
      <section style={{
        padding: "80px 5%",
        background: "linear-gradient(135deg, #0a2463, #1a3a8f)"
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "white", fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: "700", margin: "0 0 16px" }}>
            Book Your Appointment Online
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", margin: "0 0 36px", lineHeight: "1.6" }}>
            Skip the queue. Book your OPD slot online, get a token number and receive an SMS confirmation — all in under 2 minutes.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/book" style={{
              background: "white", color: "#0a2463",
              padding: "14px 36px", borderRadius: "30px",
              textDecoration: "none", fontSize: "16px", fontWeight: "700",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
            }}>Book Now</Link>
            <Link href="/token" style={{
              background: "transparent", color: "white",
              padding: "14px 36px", borderRadius: "30px",
              textDecoration: "none", fontSize: "16px", fontWeight: "600",
              border: "2px solid rgba(255,255,255,0.4)"
            }}>Check Token Status</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#06142e", padding: "50px 5% 30px", color: "rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "48px", marginBottom: "40px" }}>
            <div>
              <div style={{ color: "white", fontSize: "18px", fontWeight: "700", marginBottom: "12px" }}>
                Neel Orthopaedic & Multi Speciality Hospital
              </div>
              <p style={{ fontSize: "14px", lineHeight: "1.7", margin: "0 0 16px", maxWidth: "320px" }}>
                1st Floor, Shrinath Apartment, Goddev Naka, B.P. Road, Bhayander East, Thane, Mumbai — 401105, MH, India.
              </p>
              <div style={{ fontSize: "14px" }}>📞 +91 70210 94941</div>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: "600", marginBottom: "16px", fontSize: "14px", letterSpacing: "1px" }}>QUICK LINKS</div>
              {["Book Appointment", "Our Doctors", "Services", "Patient Testimonials", "Contact"].map(l => (
                <div key={l} style={{ marginBottom: "10px" }}>
                  <a href="#" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: "14px" }}>{l}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: "white", fontWeight: "600", marginBottom: "16px", fontSize: "14px", letterSpacing: "1px" }}>OPD TIMINGS</div>
              <div style={{ fontSize: "14px", lineHeight: "1.9" }}>
                <div>Mon – Sat</div>
                <div style={{ color: "white" }}>10:00 AM – 1:00 PM</div>
                <div style={{ marginTop: "8px" }}>Evening</div>
                <div style={{ color: "white" }}>6:00 PM – 8:00 PM</div>
                <div style={{ marginTop: "8px", color: "#90caf9" }}>Emergency: 24/7</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px", textAlign: "center", fontSize: "13px" }}>
            © 2026 Neel Orthopaedic & Multi Speciality Hospital. All rights reserved. — pain to painless
          </div>
        </div>
      </footer>
    </div>
  );
}