"use client";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

const facilities = [
  { icon: "🤖", title: "VELYS™ Robotic OT", desc: "State-of-the-art operation theatre with the VELYS™ robotic knee replacement system by J&J MedTech" },
  { icon: "🛏️", title: "AC Patient Rooms", desc: "Comfortable AC rooms from economy ward to single deluxe — for a peaceful recovery" },
  { icon: "🚨", title: "3-Bed ICU", desc: "Round-the-clock critical care monitoring with experienced nursing staff" },
  { icon: "💊", title: "In-house Pharmacy", desc: "24/7 pharmacy stocked with all required medicines and post-surgical supplies" },
  { icon: "🩻", title: "Diagnostics", desc: "X-ray, MRI referrals and on-site laboratory investigations available" },
  { icon: "🏃", title: "Physiotherapy Unit", desc: "Dedicated rehabilitation unit with expert physiotherapist for post-surgical recovery" },
  { icon: "💳", title: "Cashless Mediclaim", desc: "Cashless facility available for major insurance providers — hassle-free billing" },
  { icon: "📱", title: "Digital OPD", desc: "Paperless OPD prescriptions, online token booking, and QR-based check-in" },
];

const stats = [
  { n: "15+", label: "Years of Experience", color: "#1a56db", bg: "linear-gradient(135deg, #0f2d6b, #1a56db)" },
  { n: "5000+", label: "Surgeries Performed", color: "#059669", bg: "linear-gradient(135deg, #064e3b, #10b981)" },
  { n: "200+", label: "Patients Daily", color: "#d97706", bg: "linear-gradient(135deg, #92400e, #f59e0b)" },
  { n: "4.4★", label: "Google Rating", color: "#7c3aed", bg: "linear-gradient(135deg, #1e1b4b, #7c3aed)" },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#eef2ff", fontFamily: "Georgia, serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .display-font { font-family: 'Playfair Display', Georgia, serif !important; }
        .body-font { font-family: 'Inter', sans-serif !important; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fu { animation: fadeUp 0.6s ease forwards; }

        .facility-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .facility-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(10,36,99,0.1) !important; }

        .stat-card { transition: transform 0.3s ease; }
        .stat-card:hover { transform: translateY(-4px); }

        @media (max-width: 900px) {
          .mission-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .location-grid { grid-template-columns: 1fr !important; }
          .facilities-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .facilities-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
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
        <div style={{ position: "relative", maxWidth: "720px", margin: "0 auto" }}>
          <div className="body-font fu" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#93c5fd", padding: "8px 20px", borderRadius: "30px", fontSize: "12px", letterSpacing: "2.5px", marginBottom: "28px", fontWeight: "600" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", display: "inline-block", boxShadow: "0 0 8px #34d399" }} />
            WHO WE ARE
          </div>
          <h1 className="display-font fu" style={{ fontSize: "clamp(44px, 6vw, 80px)", fontWeight: "900", lineHeight: "1.05", letterSpacing: "-3px", marginBottom: "24px" }}>
            <span style={{ background: "linear-gradient(135deg, #93c5fd 0%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              About Us
            </span>
          </h1>
          <p className="body-font fu" style={{ color: "rgba(255,255,255,0.65)", fontSize: "18px", lineHeight: "1.8" }}>
            A trusted name in orthopaedic care in Mumbai — bringing world-class surgery and compassionate healing to every patient.
          </p>
        </div>
      </div>

      {/* ── MISSION ── */}
      <div style={{ padding: "90px 5%", background: "white" }}>
        <div className="mission-grid" style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <div style={{ width: "60px", height: "4px", borderRadius: "2px", background: "linear-gradient(90deg, #1a56db, #60a5fa)", marginBottom: "20px" }} />
            <div className="body-font" style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "3px", fontWeight: "700", marginBottom: "16px" }}>OUR MISSION</div>
            <h2 className="display-font" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: "900", color: "#030a1e", marginBottom: "28px", lineHeight: "1.15", letterSpacing: "-1.5px" }}>
              Pain to Painless —<br />
              <span style={{ background: "linear-gradient(135deg, #1a56db, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>our promise to every patient</span>
            </h2>
            <p className="body-font" style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.9", marginBottom: "20px" }}>
              At Neel Orthopaedic Multispeciality Hospital, we believe every patient deserves access to the most advanced orthopaedic care — delivered with genuine compassion and respect.
            </p>
            <p className="body-font" style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.9" }}>
              Led by Dr. G.K. Boob — a DNB-qualified orthopaedic surgeon with fellowship training in Germany — our hospital combines cutting-edge technology like the VELYS™ Robotic Knee Replacement system with personalised care that puts patients first.
            </p>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card" style={{ background: s.bg, borderRadius: "20px", padding: "32px 24px", textAlign: "center", boxShadow: `0 8px 32px ${s.color}30` }}>
                <div className="display-font" style={{ color: "white", fontSize: "42px", fontWeight: "900", letterSpacing: "-2px", lineHeight: 1, marginBottom: "10px" }}>{s.n}</div>
                <div className="body-font" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "500", lineHeight: "1.4" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── VELYS HIGHLIGHT ── */}
      <div style={{ padding: "0 5% 90px", background: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ background: "linear-gradient(135deg, #0f2d6b 0%, #1a56db 100%)", borderRadius: "24px", padding: "48px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "40%", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr auto", gap: "40px", alignItems: "center" }}>
              <div>
                <div className="body-font" style={{ color: "#93c5fd", fontSize: "11px", letterSpacing: "3px", fontWeight: "700", marginBottom: "16px" }}>FEATURED TECHNOLOGY</div>
                <h3 className="display-font" style={{ color: "white", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: "900", letterSpacing: "-1px", marginBottom: "14px", lineHeight: "1.2" }}>
                  VELYS™ Robotic Knee Replacement
                </h3>
                <p className="body-font" style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", lineHeight: "1.8", maxWidth: "560px" }}>
                  Neel Orthopaedic Multispeciality Hospital is proud to be among the select hospitals in Mumbai to offer the VELYS™ Robotic-Assisted Solution by Johnson & Johnson MedTech — delivering sub-millimetre precision and better patient outcomes.
                </p>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div className="display-font" style={{ fontSize: "72px", color: "rgba(255,255,255,0.3)", fontWeight: "900", lineHeight: 1 }}>𝕍</div>
                <div className="body-font" style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", marginTop: "8px" }}>VELYS™</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FACILITIES ── */}
      <div style={{ padding: "80px 5%", background: "#f8faff", borderTop: "1px solid #e0e7ff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ width: "60px", height: "4px", borderRadius: "2px", background: "linear-gradient(90deg, #1a56db, #60a5fa)", margin: "0 auto 20px" }} />
            <div className="body-font" style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "3px", fontWeight: "700", marginBottom: "14px" }}>WHAT WE OFFER</div>
            <h2 className="display-font" style={{ fontSize: "clamp(28px, 3.5vw, 48px)", color: "#030a1e", fontWeight: "900", letterSpacing: "-1.5px" }}>Our Facilities</h2>
          </div>
          <div className="facilities-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px" }}>
            {facilities.map((f, i) => (
              <div key={i} className="facility-card" style={{ background: "white", borderRadius: "18px", padding: "28px 24px", border: "1px solid #e8edf5", boxShadow: "0 2px 12px rgba(10,36,99,0.04)" }}>
                <div style={{ fontSize: "34px", marginBottom: "16px" }}>{f.icon}</div>
                <div className="body-font" style={{ fontWeight: "700", color: "#030a1e", fontSize: "15px", marginBottom: "10px" }}>{f.title}</div>
                <div className="body-font" style={{ color: "#6b7280", fontSize: "13px", lineHeight: "1.65" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOCATION ── */}
      <div style={{ padding: "80px 5%", background: "white" }}>
        <div className="location-grid" style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
          <div>
            <div style={{ width: "60px", height: "4px", borderRadius: "2px", background: "linear-gradient(90deg, #1a56db, #60a5fa)", marginBottom: "20px" }} />
            <div className="body-font" style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "3px", fontWeight: "700", marginBottom: "16px" }}>FIND US</div>
            <h2 className="display-font" style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: "900", color: "#030a1e", marginBottom: "28px", letterSpacing: "-1px" }}>Visit Us</h2>
            <div className="body-font" style={{ color: "#4b5563", fontSize: "15px", lineHeight: "2" }}>
              <div style={{ fontWeight: "700", color: "#030a1e", fontSize: "16px", marginBottom: "8px" }}>Neel Orthopaedic Multispeciality Hospital</div>
              <div>1st Floor, Shrinath Apartment,</div>
              <div>Goddev Naka, B.P. Road,</div>
              <div>Bhayander East, Thane,</div>
              <div>Mumbai — 401105, Maharashtra</div>
            </div>
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="body-font" style={{ display: "flex", alignItems: "center", gap: "10px", color: "#030a1e", fontSize: "15px", fontWeight: "600" }}>
                📞 <a href="tel:+917021094941" style={{ color: "#1a56db", textDecoration: "none" }}>+91 70210 94941</a>
              </div>
              <div className="body-font" style={{ display: "flex", alignItems: "center", gap: "10px", color: "#030a1e", fontSize: "15px", fontWeight: "600" }}>
                📞 <a href="tel:+919594314023" style={{ color: "#1a56db", textDecoration: "none" }}>+91 95943 14023</a>
              </div>
            </div>
            <a href="https://maps.app.goo.gl/1SzWbWRuMnLrNidV8"
              target="_blank" rel="noopener noreferrer"
              className="body-font"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "28px", background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", padding: "14px 28px", borderRadius: "32px", textDecoration: "none", fontSize: "15px", fontWeight: "700", boxShadow: "0 4px 16px rgba(26,86,219,0.3)", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
              📍 Get Directions →
            </a>
          </div>

          {/* Map + Timings */}
          <div>
            <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 32px rgba(10,36,99,0.1)", marginBottom: "20px" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.123456!2d72.8585668!3d19.3045692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b02e9efb02b5%3A0x2958a8f353e885fd!2sNeel%20Orthopedic%20Super%20Specialty%20Hospital!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Neel Orthopaedic Multispeciality Hospital"
              />
            </div>
            <div style={{ background: "#f8faff", borderRadius: "18px", padding: "28px", border: "1px solid #e0e7ff" }}>
              <div className="body-font" style={{ color: "#9ca3af", fontSize: "10px", letterSpacing: "3px", fontWeight: "700", marginBottom: "16px" }}>OPD TIMINGS</div>
              {[
                { label: "Morning OPD (Mon–Sat)", time: "10:00 AM – 1:15 PM", green: false },
                { label: "Evening OPD (Mon–Sat)", time: "3:30 PM – 6:45 PM", green: false },
                { label: "Sunday Morning only", time: "10:00 AM – 1:00 PM", green: false },
                { label: "Emergency", time: "24 Hours / 7 Days", green: true },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? "1px solid #e8edf5" : "none" }}>
                  <span className="body-font" style={{ color: "#6b7280", fontSize: "14px" }}>{t.label}</span>
                  <span className="body-font" style={{ fontWeight: "700", color: t.green ? "#059669" : "#030a1e", fontSize: "14px" }}>{t.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2f6e 100%)", padding: "90px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,86,219,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "620px", margin: "0 auto" }}>
          <h2 className="display-font" style={{ color: "white", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: "900", marginBottom: "18px", letterSpacing: "-2px", lineHeight: "1.1" }}>
            Ready to get started?
          </h2>
          <p className="body-font" style={{ color: "rgba(255,255,255,0.6)", fontSize: "17px", marginBottom: "40px", lineHeight: "1.8" }}>
            Book your OPD appointment online in under 2 minutes.
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