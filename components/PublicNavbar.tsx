"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Doctors", href: "/team" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(10,36,99,0.97)" : "#0a2463",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s",
        padding: "0 5%", height: "65px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.15)" : "none"
      }}>
        {/* logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: "36px", height: "36px", background: "#1a73e8", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "16px", flexShrink: 0 }}>N</div>
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "14px", letterSpacing: "-0.3px" }}>Neel Orthopaedic</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px" }}>MULTISPECIALITY HOSPITAL</div>
          </div>
        </Link>

        {/* desktop links */}
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }} className="nav-desktop-links">
          {links.map(l => (
            <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "14px", fontWeight: "500", fontFamily: "Georgia, serif" }}>
              {l.label}
            </Link>
          ))}
          <Link href="/book" style={{ background: "#1a73e8", color: "white", padding: "10px 22px", borderRadius: "25px", textDecoration: "none", fontSize: "14px", fontWeight: "600", fontFamily: "Georgia, serif" }}>
            Book OPD
          </Link>
        </div>

        {/* hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", flexDirection: "column", gap: "5px", padding: "4px" }}
          className="hamburger-btn">
          <span style={{ width: "22px", height: "2px", background: "white", display: "block", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ width: "22px", height: "2px", background: "white", display: "block", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ width: "22px", height: "2px", background: "white", display: "block", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      </nav>

      {/* mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: "65px", left: 0, right: 0,
          background: "#0a2463", padding: "20px 5%",
          display: "flex", flexDirection: "column", gap: "4px",
          zIndex: 99, borderTop: "1px solid rgba(255,255,255,0.1)"
        }} className="mobile-menu">
          {links.map(l => (
            <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "16px", fontWeight: "500", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "Georgia, serif" }}>
              {l.label}
            </Link>
          ))}
          <Link href="/book" onClick={() => setMenuOpen(false)}
            style={{ background: "#1a73e8", color: "white", padding: "14px", borderRadius: "10px", textDecoration: "none", fontSize: "16px", fontWeight: "700", textAlign: "center", marginTop: "8px", display: "block", fontFamily: "Georgia, serif" }}>
            Book OPD Appointment
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>

      {/* spacer for fixed navbar */}
      <div style={{ height: "65px" }} />
    </>
  );
}