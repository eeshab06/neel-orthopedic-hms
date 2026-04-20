"use client";
import Link from "next/link";
import { useState } from "react";

const videos = [
  { id: "1exlzP1S4vhmlUeH44u26CeEQ61LG2WMs", num: "01" },
  { id: "1xtSHTy45jCYXrPu5yteNNTNmzcOo30k3", num: "02" },
  { id: "16z0N21shVXnyGT2dfEs8oq92Cfzvr4-S", num: "03" },
];

const reviews = [
  { name: "Giri V M", initials: "G", color: "#1a56db", badge: "Local Guide · 30 reviews", text: "Dr G K Boob is an Excellent Doctor and an Extraordinary Human being. My Mom underwent Total Knee Surgery — started walking the very next day. Felt like home during the entire stay." },
  { name: "Manoj Chhaparwal", initials: "M", color: "#be123c", badge: "1 review", text: "My daughter suffered an ACL tear in Canada. We did her surgery on 26th December 2024 and were very much satisfied. Dr. Boob has done a fantastic job. We will recommend him to all our friends and family." },
  { name: "Vaibhav Gupta", initials: "V", color: "#7c3aed", badge: "4 reviews", text: "My left hand bone was broken into 2 parts — after 7 months it has fully recovered and it doesn't feel like there was ever any issue. I would recommend everyone with any bone issue to please visit." },
  { name: "Mandar Rane", initials: "M", color: "#b45309", badge: "6 reviews", text: "The entire staff here is exceptionally polite, cooperative, and supportive. Everyone played a crucial role in ensuring a smooth and speedy recovery. Their dedication truly made a difference." },
  { name: "Vandana H Bhagwat", initials: "V", color: "#0e7490", badge: "Local Guide · 39 reviews", text: "I got my sister treated here for a sprain and hairline fracture. We had a very good experience with Dr. Boob. The treatment and the diagnosis was perfect." },
  { name: "Savitha Talashilkar", initials: "S", color: "#059669", badge: "8 reviews", text: "Got my ACL reconstruction surgery done 3 months back — excellent result and very affordable doctor." },
  { name: "Vijay Sitapara", initials: "V", color: "#0369a1", badge: "2 reviews", text: "Best orthopedic surgeon. I was suffering from back pain since 5 years — got well in just 2 visits. God bless him. Recommended to all for bone and joint problems." },
  { name: "Amol Patil", initials: "A", color: "#7c3aed", badge: "5 reviews", text: "Best orthopedic doctor and he is very skilled — always recommends exercise over medicine. Had a shoulder injury and his recommendation for physiotherapy gave me an excellent result." },
  { name: "Vishal Shah", initials: "V", color: "#9f1239", badge: "5 reviews", text: "Went under shoulder surgery. Got excellent result in 2 months. Best and very polite doctor. 100% recommended to all. Very affordable charges and very quick diagnosis." },
  { name: "Pinky Kaur", initials: "P", color: "#92400e", badge: "2 reviews", text: "Excellent Orthopaedic Surgeon. In today's scenario very difficult to see such a doctor. Salute to his spirit for serving humanity. Efficient smiling staff. GOD BLESS HIM AND HIS TEAM 🙏" },
  { name: "Anuj Gupta", initials: "A", color: "#1d4ed8", badge: "9 reviews", text: "Very good doctor. He genuinely attempts to treat patients without surgery as far as possible." },
  { name: "Kalpesh B Patel", initials: "K", color: "#065f46", badge: "Local Guide · 24 reviews", text: "Doctor has very good experience. He is very expert. If you face any bone, muscle, back pain or joint pain issue, kindly visit once." },
  { name: "Haren Ahir", initials: "H", color: "#6d28d9", badge: "6 reviews", text: "Excellent service with great hospitality. The staff is so friendly and caring. Overall the hospital was great with excellent service and great hospitality." },
];

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Stars = () => (
  <div style={{ display: "flex", gap: "2px" }}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F4B942">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

export default function TestimonialsPage() {
  const [activeVideo, setActiveVideo] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: "#030a1e", fontFamily: "Georgia, serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .fu { animation: fadeUp 0.8s ease forwards; }
        .fu2 { animation: fadeUp 0.8s 0.15s ease forwards; opacity: 0; }
        .fu3 { animation: fadeUp 0.8s 0.3s ease forwards; opacity: 0; }
        .video-thumb { cursor: pointer; transition: all 0.3s ease; }
        .video-thumb:hover { transform: translateY(-4px); }
        .review-card { transition: all 0.3s ease; break-inside: avoid; }
        .review-card:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.35) !important; box-shadow: 0 20px 50px rgba(0,0,0,0.4) !important; }
        .book-btn { transition: all 0.2s ease; }
        .book-btn:hover { transform: translateY(-2px); }

        .masonry {
          columns: 4;
          column-gap: 16px;
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 16px;
        }

        @media (max-width: 1100px) { .masonry { columns: 3; } }
        @media (max-width: 768px) { .masonry { columns: 2; } }
        @media (max-width: 480px) { .masonry { columns: 1; } }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ padding: "0 6%", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 50, background: "rgba(3,10,30,0.95)", backdropFilter: "blur(20px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #1a56db, #60a5fa)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "900", fontSize: "18px", fontFamily: "'Playfair Display', serif" }}>N</div>
          <span style={{ color: "white", fontWeight: "700", fontSize: "15px", fontFamily: "'Lora', serif" }}>Neel Orthopaedic</span>
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "14px", fontFamily: "'Lora', serif", background: "rgba(255,255,255,0.06)", padding: "8px 18px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>← Home</Link>
          <Link href="/book" className="book-btn" style={{ background: "linear-gradient(135deg, #C9A84C, #e6c96a)", color: "#030a1e", textDecoration: "none", fontSize: "14px", fontFamily: "'Lora', serif", fontWeight: "700", padding: "9px 22px", borderRadius: "20px" }}>Book OPD</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 6% 64px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "30px", padding: "8px 20px", marginBottom: "28px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9A84C", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ color: "#C9A84C", fontSize: "12px", fontWeight: "700", letterSpacing: "2px", fontFamily: "'Lora', serif" }}>REAL PATIENTS · REAL STORIES</span>
          </div>
          <h1 className="fu2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 6vw, 68px)", fontWeight: "900", color: "white", lineHeight: 1.1, letterSpacing: "-2px", marginBottom: "24px" }}>
            Lives Changed at<br />
            <span style={{ background: "linear-gradient(135deg, #C9A84C 0%, #e6c96a 50%, #C9A84C 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 3s linear infinite" }}>Neel Orthopaedic</span>
          </h1>
          <p className="fu3" style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.5)", fontSize: "18px", fontStyle: "italic", lineHeight: 1.8 }}>
            Hear directly from our patients — unscripted, unedited, straight from their hearts
          </p>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section style={{ padding: "0 6% 100px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.3)", fontSize: "12px", letterSpacing: "3px", whiteSpace: "nowrap" }}>PATIENT VIDEO STORIES</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Main player */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "24px", overflow: "hidden", marginBottom: "20px", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
            <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
            <div style={{ padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: "900", color: "#C9A84C", lineHeight: 1, opacity: 0.4 }}>0{activeVideo + 1}</div>
              <div style={{ width: "1px", height: "32px", background: "rgba(255,255,255,0.1)" }} />
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "18px", fontWeight: "700" }}>Patient {videos[activeVideo].num}</div>
                <div style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.35)", fontSize: "13px", fontStyle: "italic" }}>Patient Testimonial · Neel Orthopaedic</div>
              </div>
            </div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000" }}>
              <iframe
                src={`https://drive.google.com/file/d/${videos[activeVideo].id}/preview`}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                allow="autoplay"
                title={`Patient ${videos[activeVideo].num} testimonial`}
              />
            </div>
          </div>

          {/* Thumbnails */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            {videos.map((v, i) => (
              <div key={i} className="video-thumb" onClick={() => setActiveVideo(i)}
                style={{ background: activeVideo === i ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)", border: `2px solid ${activeVideo === i ? "#C9A84C" : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", padding: "18px 22px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: "900", color: activeVideo === i ? "#C9A84C" : "rgba(255,255,255,0.15)", lineHeight: 1, transition: "all 0.3s" }}>{v.num}</div>
                <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.08)" }} />
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", color: activeVideo === i ? "white" : "rgba(255,255,255,0.5)", fontSize: "15px", fontWeight: "700" }}>Patient {v.num}</div>
                  <div style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.25)", fontSize: "12px", fontStyle: "italic", marginTop: "2px" }}>Tap to play</div>
                </div>
                <div style={{ marginLeft: "auto", width: "32px", height: "32px", borderRadius: "50%", background: activeVideo === i ? "#C9A84C" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", transition: "all 0.3s" }}>
                  {activeVideo === i ? "▶" : "▷"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS MASONRY */}
      <section style={{ padding: "80px 6% 100px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "30px", padding: "8px 20px", marginBottom: "20px" }}>
              <GoogleIcon />
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: "700", letterSpacing: "2px", fontFamily: "'Lora', serif" }}>VERIFIED GOOGLE REVIEWS</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "900", color: "white", letterSpacing: "-1.5px", marginBottom: "8px" }}>What Patients Are Saying</h2>
            <p style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.35)", fontStyle: "italic", fontSize: "15px" }}>{reviews.length} five-star reviews · Unedited · From Google Maps</p>
          </div>

          {/* Masonry grid */}
          <div className="masonry">
            {reviews.map((r, i) => (
              <div key={i} className="masonry-item review-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px", padding: "22px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}>
                {/* Subtle color top line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${r.color}, ${r.color}88, transparent)` }} />

                {/* Reviewer row */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: r.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "14px", fontFamily: "'Playfair Display', serif", flexShrink: 0 }}>{r.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Lora', serif", color: "white", fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                    <div style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>{r.badge}</div>
                  </div>
                  <GoogleIcon />
                </div>

                <Stars />

                <p style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: "1.8", marginTop: "12px", fontStyle: "italic" }}>
                  "{r.text}"
                </p>
              </div>
            ))}
          </div>

          {/* Google Maps CTA */}
          <div style={{ textAlign: "center", marginTop: "52px" }}>
            <a href="https://maps.app.goo.gl/1SzWbWRuMnLrNidV8" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "14px 28px", borderRadius: "40px", fontFamily: "'Lora', serif", fontSize: "15px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
              <GoogleIcon /> View all reviews on Google Maps →
            </a>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding: "80px 6%", background: "linear-gradient(135deg, #0a1628, #0f2044)", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🦴</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "900", letterSpacing: "-1.5px", marginBottom: "16px" }}>Ready to Start Your<br />Recovery Journey?</h2>
          <p style={{ fontFamily: "'Lora', serif", color: "rgba(255,255,255,0.5)", fontSize: "17px", fontStyle: "italic", marginBottom: "40px", lineHeight: 1.8 }}>Join thousands of patients who have reclaimed their lives at Neel Orthopaedic</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/book" className="book-btn" style={{ background: "linear-gradient(135deg, #C9A84C, #e6c96a)", color: "#030a1e", textDecoration: "none", padding: "16px 36px", borderRadius: "40px", fontFamily: "'Playfair Display', serif", fontWeight: "700", fontSize: "17px", boxShadow: "0 8px 32px rgba(201,168,76,0.35)" }}>Book Appointment →</Link>
            <a href="tel:+917021094941" style={{ background: "transparent", color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "16px 36px", borderRadius: "40px", fontFamily: "'Lora', serif", fontSize: "17px", border: "1px solid rgba(255,255,255,0.2)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}>
              📞 +91 70210 94941
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}