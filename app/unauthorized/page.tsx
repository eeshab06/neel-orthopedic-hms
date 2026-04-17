"use client";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
        <h1 style={{ color: "#0a2463", fontSize: 28, margin: "0 0 8px" }}>Access Denied</h1>
        <p style={{ color: "#666", fontSize: 16, margin: "0 0 28px" }}>You don't have permission to access this page.</p>
        <Link href="/login" style={{ background: "#0a2463", color: "#fff", padding: "12px 28px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}