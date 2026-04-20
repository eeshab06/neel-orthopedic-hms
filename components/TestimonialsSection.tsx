"use client";
import { useState, useEffect, useRef } from "react";

const reviews = [
  {
    name: "Giri V M",
    badge: "Local Guide · 30 reviews",
    initials: "G",
    color: "#1a56db",
    time: "2 months ago",
    text: "Dr G K Boob is an Excellent Doctor and an Extraordinary Human being. My Mom underwent Total Knee Surgery — started walking the very next day. Thanks to the entire staff of Neel Orthopedic. Felt like home during the entire stay.",
    tag: "Total Knee Surgery",
  },
  {
    name: "Vandana H Bhagwat",
    badge: "Local Guide · 39 reviews",
    initials: "V",
    color: "#0e7490",
    time: "7 months ago",
    text: "I got my sister treated here for a sprain and hairline fracture. We had a very good experience with Dr. Boob. The treatment and the diagnosis was perfect.",
    tag: "Fracture Treatment",
  },
  {
    name: "Vaibhav Gupta",
    badge: "4 reviews",
    initials: "V",
    color: "#7c3aed",
    time: "1 year ago",
    text: "I had a wonderful experience here. Dr. GK Boob is a professional in ortho. My left hand bone was broken into 2 parts — after 7 months it has fully recovered and it doesn't feel like there was ever any issue. I would recommend everyone who has any bone issue to please visit.",
    tag: "Bone Fracture Recovery",
  },
  {
    name: "Mandar Rane",
    badge: "6 reviews · 3 photos",
    initials: "M",
    color: "#b45309",
    time: "1 year ago",
    text: "The entire staff here is exceptionally polite, cooperative, and supportive. From the doctors and nurses to the helpers, everyone played a crucial role in ensuring a smooth and speedy recovery. Their dedication and care truly made a difference. Thank you for your outstanding service!",
    tag: "Staff & Care",
  },
  {
    name: "Manoj Chhaparwal",
    badge: "1 review",
    initials: "M",
    color: "#be123c",
    time: "1 year ago",
    text: "We came in contact with Dr. Boob when my daughter suffered an ACL tear in Canada — doctors there had suggested surgery. We did her surgery on 26th December 2024 and were very much satisfied with the results. Dr. Boob has done a fantastic job. We will recommend him for every orthopaedic consultation to all our friends and family.",
    tag: "ACL Surgery",
  },
];

const Stars = () => (
  <div style={{ display: "flex", gap: "3px", marginBottom: "16px" }}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#F4B942">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const intervalRef = useRef<any>(null);

  const goTo = (idx: number, dir: "left" | "right") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setAnimating(false);
    }, 350);
  };

  const next = () => goTo((active + 1) % reviews.length, "right");
  const prev = () => goTo((active - 1 + reviews.length) % reviews.length, "left");

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const r = reviews[active];

  return (
    <section style={{
      background: "linear-gradient(160deg, #030a1e 0%, #0a1628 60%, #0f2044 100%)",
      padding: "96px 5%",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        .testimonial-card {
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .testimonial-card.exit-left {
          opacity: 0;
          transform: translateX(-40px);
        }
        .testimonial-card.exit-right {
          opacity: 0;
          transform: translateX(40px);
        }
        .testimonial-card.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .dot-btn {
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          background: none;
          padding: 4px;
        }
        .nav-btn {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .nav-btn:hover {
          background: rgba(201,168,76,0.15) !important;
          border-color: #C9A84C !important;
        }
        .google-badge {
          transition: all 0.2s ease;
        }
      `}</style>

      {/* Background decorations */}
      <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,86,219,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Decorative quote mark */}
      <div style={{ position: "absolute", top: "40px", left: "5%", fontSize: "200px", lineHeight: 1, color: "rgba(201,168,76,0.04)", fontFamily: "'Playfair Display', serif", pointerEvents: "none", userSelect: "none" }}>"</div>

      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "30px", padding: "8px 20px", marginBottom: "24px" }}>
            <GoogleIcon />
            <span style={{ color: "#C9A84C", fontSize: "13px", fontWeight: "700", letterSpacing: "1.5px", fontFamily: "'Lora', serif" }}>VERIFIED GOOGLE REVIEWS</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "900", color: "white", margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-1px" }}>
            What Our Patients Say
          </h2>
          <p style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.5)", fontSize: "17px", margin: 0, fontStyle: "italic" }}>
            Real stories from real patients — unedited, straight from Google
          </p>
        </div>

        {/* Rating summary bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginBottom: "56px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px 28px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "44px", fontWeight: "900", color: "#C9A84C", lineHeight: 1 }}>5.0</div>
              <div style={{ display: "flex", gap: "3px", justifyContent: "center", margin: "6px 0 4px" }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F4B942">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "'Lora', serif" }}>Google Rating</div>
            </div>
            <div style={{ width: "1px", height: "50px", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "44px", fontWeight: "900", color: "white", lineHeight: 1 }}>5</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "10px", fontFamily: "'Lora', serif" }}>Featured Reviews</div>
            </div>
            <div style={{ width: "1px", height: "50px", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "44px", fontWeight: "900", color: "white", lineHeight: 1 }}>15+</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "10px", fontFamily: "'Lora', serif" }}>Years Experience</div>
            </div>
          </div>
        </div>

        {/* Main card */}
        <div style={{ position: "relative", minHeight: "280px" }}>
          <div
            className={`testimonial-card ${animating ? (direction === "right" ? "exit-left" : "exit-right") : "visible"}`}
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "24px",
              padding: "44px 52px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Gold accent top bar */}
            <div style={{ position: "absolute", top: 0, left: "52px", right: "52px", height: "2px", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />

            {/* Tag */}
            <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "20px", padding: "5px 14px", marginBottom: "20px" }}>
              <span style={{ color: "#C9A84C", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", fontFamily: "'Lora', serif" }}>{r.tag.toUpperCase()}</span>
            </div>

            <Stars />

            {/* Review text */}
            <p style={{
              fontFamily: "'Lora', serif",
              fontSize: "clamp(16px, 2vw, 19px)",
              color: "rgba(255,255,255,0.88)",
              lineHeight: "1.8",
              margin: "0 0 32px",
              fontStyle: "italic",
            }}>
              "{r.text}"
            </p>

            {/* Reviewer info */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: r.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: "800", fontSize: "18px",
                  fontFamily: "'Playfair Display', serif",
                  flexShrink: 0,
                  boxShadow: `0 4px 16px ${r.color}55`,
                }}>
                  {r.initials}
                </div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: "700", color: "white", fontSize: "17px" }}>{r.name}</div>
                  <div style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{r.badge} · {r.time}</div>
                </div>
              </div>

              {/* Google badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", padding: "8px 14px" }}>
                <GoogleIcon />
                <span style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>Google Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginTop: "40px" }}>
          <button className="nav-btn" onClick={prev} style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white", fontSize: "18px", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>←</button>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {reviews.map((_, i) => (
              <button key={i} className="dot-btn" onClick={() => goTo(i, i > active ? "right" : "left")}>
                <div style={{
                  width: i === active ? "28px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: i === active ? "#C9A84C" : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s ease",
                }} />
              </button>
            ))}
          </div>

          <button className="nav-btn" onClick={next} style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white", fontSize: "18px", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>→</button>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "52px" }}>
          <a
            href="/testimonials"
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              background: "linear-gradient(135deg, #C9A84C, #e6c96a)",
              color: "#030a1e", textDecoration: "none",
              padding: "16px 36px", borderRadius: "50px",
              fontFamily: "'Playfair Display', serif",
              fontWeight: "700", fontSize: "16px",
              boxShadow: "0 8px 32px rgba(201,168,76,0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Watch Patient Stories & All Reviews
            <span style={{ fontSize: "20px" }}>→</span>
          </a>
          <p style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.3)", fontSize: "13px", marginTop: "14px", fontStyle: "italic" }}>
            Including video testimonials from recovered patients
          </p>
        </div>
      </div>
    </section>
  );
}