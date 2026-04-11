"use client";
import { useEffect, useState } from "react";

export default function QRPage() {
  const [QRCode, setQRCode] = useState<any>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.origin + "/walkin");
    import("react-qrcode-logo").then(mod => setQRCode(() => mod.QRCode));
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "white",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, serif", padding: "40px"
    }}>
      <div style={{
        border: "2px solid #e0e7ff", borderRadius: "24px",
        padding: "48px", textAlign: "center", maxWidth: "400px"
      }}>
        <div style={{ fontWeight: "800", fontSize: "22px", color: "#0a2463", marginBottom: "4px" }}>
          Neel Orthopaedic Hospital
        </div>
        <div style={{ color: "#666", fontSize: "14px", marginBottom: "32px" }}>
          Scan to get your walk-in token
        </div>

        {QRCode && url ? (
          <QRCode
            value={url}
            size={240}
            bgColor="#ffffff"
            fgColor="#0a2463"
            qrStyle="dots"
            eyeRadius={8}
          />
        ) : (
          <div style={{ width: 240, height: 240, background: "#f0f4ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
            Loading QR...
          </div>
        )}

        <div style={{ marginTop: "24px", color: "#0a2463", fontWeight: "700", fontSize: "16px" }}>
          Walk-in Token Registration
        </div>
        <div style={{ color: "#888", fontSize: "13px", marginTop: "4px", marginBottom: "24px" }}>
          Enter your name & phone to get a token instantly
        </div>

        <div style={{
          background: "#f0f4ff", borderRadius: "10px", padding: "12px 16px",
          fontSize: "13px", color: "#666"
        }}>
          OPD: 10:00 AM – 1:15 PM & 3:30 PM – 6:45 PM<br />
          Dr. G.K. Boob · +91 70210 94941
        </div>
      </div>

      <button
        onClick={() => window.print()}
        style={{
          marginTop: "32px", background: "#0a2463", color: "white",
          border: "none", padding: "14px 36px", borderRadius: "10px",
          fontSize: "15px", fontWeight: "700", cursor: "pointer"
        }}
      >
        🖨️ Print this QR Code
      </button>

      <style>{`
        @media print {
          button { display: none !important; }
          body { margin: 0; }
        }
      `}</style>
    </div>
  );
}