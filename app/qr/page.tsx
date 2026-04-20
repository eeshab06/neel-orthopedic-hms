"use client";
import { useEffect, useState } from "react";

export default function QRPage() {
  const [QRCode, setQRCode] = useState<any>(null);
  const [url, setUrl] = useState("");
  const [host, setHost] = useState("");

  useEffect(() => {
    // Use window.location.hostname — works for both localhost and LAN IP
    // When accessed via 192.168.x.x:3000/qr, this automatically gives the right IP
    const hostname = window.location.hostname;
    const port = window.location.port;
    const walkinUrl = `http://${hostname}${port ? ":" + port : ""}/walkin`;
    setUrl(walkinUrl);
    setHost(walkinUrl);
    import("react-qrcode-logo").then(mod => setQRCode(() => mod.QRCode));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #1a2f6e 50%, #0f4c8a 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, serif", padding: "40px",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        .display-font { font-family: 'Playfair Display', Georgia, serif !important; }
        .body-font { font-family: 'Inter', sans-serif !important; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,86,219,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{
        background: "white", borderRadius: "28px", padding: "44px 40px",
        width: "100%", maxWidth: "440px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)", textAlign: "center",
        position: "relative",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, #0f2d6b, #1a56db)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "28px", fontWeight: "900", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(26,86,219,0.35)", fontFamily: "'Inter', sans-serif" }}>N</div>
          <h1 className="display-font" style={{ color: "#030a1e", fontSize: "22px", fontWeight: "900", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Neel Orthopaedic</h1>
          <p className="body-font" style={{ color: "#9ca3af", fontSize: "14px", margin: 0 }}>Multispeciality Hospital · Bhayander East</p>
        </div>

        {/* Live dot */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", animation: "pulse 2s infinite" }} />
          <span className="body-font" style={{ color: "#059669", fontSize: "13px", fontWeight: "700" }}>Walk-in Token System · Active</span>
        </div>

        {/* QR Code */}
        <div style={{ background: "#f8faff", borderRadius: "20px", padding: "24px", marginBottom: "24px", border: "2px solid #e0e7ff", display: "inline-block", width: "100%" }}>
          {QRCode && url ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <QRCode
                value={url}
                size={220}
                bgColor="#f8faff"
                fgColor="#0a1628"
                qrStyle="dots"
                eyeRadius={8}
              />
            </div>
          ) : (
            <div style={{ width: 220, height: 220, background: "#e0e7ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", margin: "0 auto", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
              Loading QR...
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{ background: "#eff6ff", borderRadius: "14px", padding: "16px 20px", marginBottom: "24px", border: "1px solid #bfdbfe" }}>
          <div className="body-font" style={{ color: "#1e3a8a", fontSize: "15px", fontWeight: "700", marginBottom: "8px" }}>📱 How to get your token:</div>
          <div className="body-font" style={{ color: "#374151", fontSize: "14px", lineHeight: "1.8" }}>
            1. Open your phone camera<br />
            2. Point at the QR code above<br />
            3. Tap the link that appears<br />
            4. Enter your name & phone<br />
            5. Get your token instantly!
          </div>
        </div>

        {/* OPD timings */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
          <div style={{ background: "#f8faff", borderRadius: "12px", padding: "12px", border: "1px solid #e0e7ff" }}>
            <div style={{ fontSize: "18px", marginBottom: "4px" }}>🌅</div>
            <div className="body-font" style={{ color: "#030a1e", fontWeight: "700", fontSize: "13px" }}>Morning OPD</div>
            <div className="body-font" style={{ color: "#9ca3af", fontSize: "12px" }}>10:00 AM – 1:15 PM</div>
          </div>
          <div style={{ background: "#f8faff", borderRadius: "12px", padding: "12px", border: "1px solid #e0e7ff" }}>
            <div style={{ fontSize: "18px", marginBottom: "4px" }}>🌆</div>
            <div className="body-font" style={{ color: "#030a1e", fontWeight: "700", fontSize: "13px" }}>Evening OPD</div>
            <div className="body-font" style={{ color: "#9ca3af", fontSize: "12px" }}>3:30 PM – 6:45 PM</div>
          </div>
        </div>

        {/* URL display */}
        {host && (
          <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "10px 14px", border: "1px solid #bbf7d0", marginBottom: "20px" }}>
            <div className="body-font" style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", marginBottom: "4px" }}>QR POINTS TO</div>
            <div className="body-font" style={{ color: "#065f46", fontSize: "13px", fontWeight: "700", wordBreak: "break-all" }}>{host}</div>
          </div>
        )}

        <button onClick={() => window.print()}
          className="body-font"
          style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: "700", cursor: "pointer", boxShadow: "0 6px 20px rgba(26,86,219,0.35)" }}>
          🖨️ Print this QR Code
        </button>

        <p className="body-font" style={{ color: "#9ca3af", fontSize: "12px", marginTop: "14px" }}>
          Dr. G.K. Boob · +91 70210 94941
        </p>
      </div>

      <style>{`
        @media print {
          button { display: none !important; }
          body { margin: 0; background: white !important; }
        }
      `}</style>
    </div>
  );
}