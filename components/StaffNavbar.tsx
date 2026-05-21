"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserProfile } from "@/lib/useAuth";

interface StaffNavbarProps {
  user: UserProfile;
  onSignOut: () => void;
}

const ROLE_LINKS: Record<string, { href: string; label: string; icon: string }[]> = {
  doctor: [
    { href: "/doctor",          label: "My Portal",       icon: "👨‍⚕️" },
    { href: "/ipd",             label: "IPD & Surgery",   icon: "🔬" },
    { href: "/dashboard",       label: "Dashboard",       icon: "📊" },
    { href: "/prescription",    label: "Prescription",    icon: "📝" },
    { href: "/patient-history", label: "Patient History", icon: "👤" },
  ],
  admin: [
    { href: "/admin",     label: "Admin Panel", icon: "🔐" },
    { href: "/dashboard", label: "Dashboard",   icon: "📊" },
    { href: "/stock",     label: "Stock",       icon: "💊" },
  ],
  staff: [
    { href: "/rooms",           label: "Rooms",           icon: "🛏️" },
    { href: "/stock",           label: "Stock",           icon: "💊" },
    { href: "/ipd",             label: "IPD & Surgery",   icon: "🔬" },
    { href: "/patient-history", label: "Patient History", icon: "👤" },
  ],
  reception: [
    { href: "/reception",       label: "Reception",       icon: "📋" },
    { href: "/walkin",          label: "Walk-in",         icon: "🚶" },
    { href: "/rooms",           label: "Rooms",           icon: "🛏️" },
    { href: "/prescription",    label: "Prescription",    icon: "📝" },
    { href: "/patient-history", label: "Patient History", icon: "👤" },
  ],
};

const ROLE_COLORS: Record<string, string> = {
  doctor:    "#7c3aed",
  admin:     "#0a2463",
  staff:     "#1a73e8",
  reception: "#16a34a",
};

export default function StaffNavbar({ user, onSignOut }: StaffNavbarProps) {
  const pathname = usePathname();
  const links = ROLE_LINKS[user.role] || [];
  const color = ROLE_COLORS[user.role] || "#0a2463";

  return (
    <div style={{
      background: color, padding: "0 24px", height: 58,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontFamily: "Georgia, serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img
            src="/logo.png"
            alt="Neel Orthopaedic Hospital"
            style={{ height: 42, width: "auto", objectFit: "contain" }}
          />
        </Link>

        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.2)" }} />

        <div style={{ display: "flex", gap: 4 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              style={{
                color: pathname === l.href ? "#fff" : "rgba(255,255,255,0.7)",
                textDecoration: "none",
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 6,
                background: pathname === l.href ? "rgba(255,255,255,0.15)" : "transparent",
                fontWeight: pathname === l.href ? 700 : 400,
                whiteSpace: "nowrap",
              }}>
              {l.icon} {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{user.name}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, textTransform: "capitalize" }}>{user.role}</div>
        </div>
        <button onClick={onSignOut}
          style={{
            background: "rgba(255,255,255,0.15)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8,
            padding: "6px 14px", fontSize: 12, cursor: "pointer",
            fontFamily: "Georgia, serif",
          }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}