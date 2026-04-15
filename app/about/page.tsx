"use client";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ background: "#fff", fontFamily: "Georgia, 'Times New Roman', serif", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#0a2463", padding: "0 5%", height: "65px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "#1a73e8", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "16px" }}>N</div>
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>Neel Orthopaedic</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px" }}>MULTISPECIALITY HOSPITAL</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Doctors", href: "/team" }, { label: "Contact", href: "/contact" }].map(l => (
            <a key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "14px" }}>{l.label}</a>
          ))}
          <Link href="/book" style={{ background: "#1a73e8", color: "white", padding: "8px 20px", borderRadius: "20px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Book OPD</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0a2463 0%, #1a3a8f 60%, #1a73e8 100%)", padding: "80px 5%", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#90caf9", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", letterSpacing: "1px", marginBottom: "24px" }}>
          EST. 2011 · BHAYANDER EAST, MUMBAI
        </div>
        <h1 style={{ color: "white", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "700", marginBottom: "16px", lineHeight: 1.2 }}>
          About Neel Orthopaedic<br />&amp; Multispeciality Hospital
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "clamp(14px, 1.8vw, 18px)", fontStyle: "italic", maxWidth: "600px", margin: "0 auto" }}>
          — pain to painless —
        </p>
      </section>

      {/* ABOUT HOSPITAL */}
      <section style={{ padding: "80px 5%", background: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>OUR STORY</div>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", color: "#0a2463", fontWeight: "700", marginBottom: "20px", lineHeight: 1.3 }}>
              Trusted Orthopaedic Care Since 2011
            </h2>
            <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8", marginBottom: "16px" }}>
              Founded in 2011, Neel Orthopaedic &amp; Multispeciality Hospital has grown to become one of Bhayander's most trusted centres for orthopaedic and multispeciality care. What began as a vision to bring world-class surgical expertise closer to home has today served over 5,000 patients with dedicated, compassionate care.
            </p>
            <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8" }}>
              We offer the <strong style={{ color: "#0a2463" }}>VELYS™ Robotic Knee Replacement</strong> system by Johnson &amp; Johnson MedTech — bringing advanced joint replacement technology directly to our patients in Bhayander.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              { n: "2011", label: "Year Founded" },
              { n: "5000+", label: "Surgeries Performed" },
              { n: "15+", label: "Years Experience" },
              { n: "200+", label: "Patients Daily" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#f0f4ff", borderRadius: "16px", padding: "28px 20px", textAlign: "center", border: "1px solid #e0e7ff" }}>
                <div style={{ fontSize: "32px", fontWeight: "800", color: "#0a2463", letterSpacing: "-1px" }}>{s.n}</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DR. GK BOOB */}
      <section style={{ padding: "80px 5%", background: "#f8f9fc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>FOUNDER &amp; LEAD SURGEON</div>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", color: "#0a2463", fontWeight: "700" }}>Dr. Ganesh K. Boob</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "48px", alignItems: "start" }}>
            <div style={{ background: "#0a2463", borderRadius: "20px", padding: "36px", textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", background: "#1a73e8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "32px", fontWeight: "800", margin: "0 auto 20px" }}>B</div>
              <div style={{ color: "white", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Dr. G.K. Boob</div>
              <div style={{ color: "#90caf9", fontSize: "13px", marginBottom: "20px" }}>DNB Orthopaedic Surgery</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Qualification", value: "DNB Orthopaedic Surgery" },
                  { label: "Fellowship", value: "Spine Surgery, Germany" },
                  { label: "MBBS", value: "CMS, Nepal (ISME, USA)" },
                  { label: "MCI Reg.", value: "No. 24946" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", textAlign: "left" }}>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", letterSpacing: "1px", marginBottom: "2px" }}>{item.label.toUpperCase()}</div>
                    <div style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8", marginBottom: "20px" }}>
                Dr. Ganesh K. Boob is a fellowship-trained orthopaedic surgeon with over 15 years of experience in spine surgery, joint replacement, and trauma care. He completed his DNB in Orthopaedic Surgery from K.J. Somaiya Medical College, Mumbai — one of India's top 20 medical institutions — passing in the first attempt, a rare distinction.
              </p>
              <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8", marginBottom: "28px" }}>
                He served as Junior Consultant at the prestigious <strong style={{ color: "#0a2463" }}>MIOT Hospitals, Chennai</strong> — an AO Spine recognised institute — where he gained advanced training in spine surgery. He later pursued a fellowship in Spine Surgery in Germany, bringing international expertise back to Mumbai.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[
                  { title: "Academic Excellence", items: ["DNB passed in First Attempt", "Prof. Jaysunder Gold Medal — 1st Rank in Pharmacology", "Distinction in 8/13 MBBS subjects"] },
                  { title: "Specialisations", items: ["Robotic Knee Replacement (VELYS™)", "Spine Surgery (Lumbar & Cervical)", "Joint Replacement (Hip & Knee)", "Arthroscopy & Trauma Surgery"] },
                ].map((card, i) => (
                  <div key={i} style={{ background: "white", borderRadius: "12px", padding: "20px", border: "1px solid #e8edf5" }}>
                    <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "14px", marginBottom: "12px" }}>{card.title}</div>
                    {card.items.map((item, j) => (
                      <div key={j} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                        <span style={{ color: "#1a73e8", fontSize: "12px", marginTop: "3px" }}>●</span>
                        <span style={{ color: "#555", fontSize: "13px", lineHeight: "1.5" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section style={{ padding: "80px 5%", background: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>CUTTING-EDGE TECHNOLOGY</div>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", color: "#0a2463", fontWeight: "700", marginBottom: "16px" }}>VELYS™ Robotic System</h2>
          <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8", maxWidth: "700px", margin: "0 auto 48px" }}>
            Neel Orthopaedic Hospital offers the <strong>VELYS™ Robotic Knee Replacement System</strong> by Johnson &amp; Johnson MedTech — enabling unprecedented precision in joint replacement surgery.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {[
              { icon: "🎯", title: "Precision Surgery", desc: "Sub-millimetre accuracy with robotic-assisted planning and execution" },
              { icon: "⚡", title: "Faster Recovery", desc: "Minimally invasive approach means less pain and shorter hospital stays" },
              { icon: "🏆", title: "Best Outcomes", desc: "Internationally proven technology used by top orthopaedic centres worldwide" },
            ].map((f, i) => (
              <div key={i} style={{ background: "#f0f4ff", borderRadius: "16px", padding: "32px 24px", border: "1px solid #e0e7ff", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "16px" }}>{f.icon}</div>
                <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px", marginBottom: "10px" }}>{f.title}</div>
                <div style={{ color: "#666", fontSize: "14px", lineHeight: "1.6" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ padding: "80px 5%", background: "#f8f9fc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#1a73e8", letterSpacing: "2px", fontWeight: "600", marginBottom: "12px" }}>OUR SPECIALISTS</div>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", color: "#0a2463", fontWeight: "700", marginBottom: "48px" }}>Meet the Team</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {[
              { name: "Dr. G.K. Boob", role: "Orthopaedic Surgeon", qual: "DNB Ortho | Fellowship Spine, Germany", highlight: true },
              { name: "Dr. Vijay Rangani", role: "Anaesthetist", qual: "MBBS / DA", highlight: false },
              { name: "Dr. Jay Pathak", role: "Physiotherapist", qual: "B.PTH", highlight: false },
              { name: "Dr. Chetan Bhambure", role: "Cardiologist", qual: "DM Cardiology", highlight: false },
            ].map((t, i) => (
              <div key={i} style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e8edf5" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: t.highlight ? "#0a2463" : "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", color: t.highlight ? "white" : "#555", fontWeight: "800", fontSize: "18px", margin: "0 auto 16px" }}>
                  {t.name.split(" ")[1][0]}
                </div>
                <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "15px", marginBottom: "4px" }}>{t.name}</div>
                <div style={{ color: "#1a73e8", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>{t.role}</div>
                <div style={{ color: "#888", fontSize: "12px" }}>{t.qual}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 5%", background: "#0a2463", textAlign: "center" }}>
        <h2 style={{ color: "white", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: "700", marginBottom: "16px" }}>Ready to experience the difference?</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", marginBottom: "32px" }}>Book your OPD appointment online in under 2 minutes.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/book" style={{ background: "white", color: "#0a2463", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "700" }}>Book Appointment</Link>
          <a href="tel:+917021094941" style={{ background: "transparent", color: "white", padding: "14px 32px", borderRadius: "30px", textDecoration: "none", fontSize: "15px", fontWeight: "600", border: "2px solid rgba(255,255,255,0.4)" }}>+91 70210 94941</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#06142e", padding: "40px 5%", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
        <div style={{ fontSize: "13px", marginBottom: "8px" }}>1st Floor, Shrinath Apartment, Goddev Naka, B.P. Road, Bhayander East, Mumbai — 401105</div>
        <div style={{ fontSize: "13px", marginBottom: "16px" }}>📞 +91 70210 94941</div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", fontSize: "13px", display: "flex", justifyContent: "center", gap: "24px" }}>
          <span>© 2026 Neel Orthopaedic Multispeciality Hospital</span>
          <span style={{ fontStyle: "italic" }}>pain to painless</span>
        </div>
      </footer>
    </div>
  );
}