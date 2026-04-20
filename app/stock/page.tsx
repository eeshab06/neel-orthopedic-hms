"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const REORDER_DEFAULT = 10;

interface Medicine {
  id: number; name: string; type: "opd" | "ipd";
  stock_qty: number; mrp: number; packing: string;
  batch_no: string; exp_date: string | null; reorder_level: number;
}
type TabType = "all" | "opd" | "ipd" | "low" | "expiring" | "implants";
interface Implant {
  implant_id: number; name: string; manufacturer: string;
  quantity_in_stock: number; unit_price: number; reorder_level: number;
}

function parseExpDate(exp: string | null): Date | null {
  if (!exp || exp.trim() === "" || exp === "/" || exp === "  /  ") return null;
  const m = exp.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(parseInt(m[2]), parseInt(m[1]) - 1, 28);
  return null;
}
function isExpiringSoon(exp: string | null): boolean {
  const d = parseExpDate(exp);
  if (!d) return false;
  const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
  return diff <= 3 && diff >= 0;
}
function isExpired(exp: string | null): boolean {
  const d = parseExpDate(exp);
  if (!d) return false;
  return d < new Date();
}
function formatExpDate(exp: string | null): string {
  if (!exp || exp.trim() === "" || exp === "/" || exp === "  /  ") return "—";
  return exp;
}

export default function StockPage() {
  const { user, loading: authLoading, signOut } = useAuth("/stock");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [sortBy, setSortBy] = useState<"name" | "stock" | "expiry">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editItem, setEditItem] = useState<Medicine | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editReorder, setEditReorder] = useState("");
  const [editMrp, setEditMrp] = useState("");
  const [editBatch, setEditBatch] = useState("");
  const [editExp, setEditExp] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addType, setAddType] = useState<"opd" | "ipd">("opd");
  const [addQty, setAddQty] = useState("");
  const [addMrp, setAddMrp] = useState("");
  const [addPacking, setAddPacking] = useState("");
  const [addBatch, setAddBatch] = useState("");
  const [addExp, setAddExp] = useState("");
  const [addReorder, setAddReorder] = useState("10");
  const [addError, setAddError] = useState("");
  const [implants, setImplants] = useState<Implant[]>([]);
  const [implantSearch, setImplantSearch] = useState("");
  const [showAddImplant, setShowAddImplant] = useState(false);
  const [newImplant, setNewImplant] = useState({ name: "", manufacturer: "", quantity_in_stock: "", unit_price: "", reorder_level: "2" });
  const [editImplant, setEditImplant] = useState<Implant | null>(null);
  const [editImplantQty, setEditImplantQty] = useState("");
  const [editImplantPrice, setEditImplantPrice] = useState("");
  const [editImplantReorder, setEditImplantReorder] = useState("");
  const [implantError, setImplantError] = useState("");
  const [implantSaveMsg, setImplantSaveMsg] = useState("");

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    const [medRes, impRes] = await Promise.all([
      supabase.from("medicine_list").select("*").order("name", { ascending: true }),
      supabase.from("implant").select("*").order("name", { ascending: true }),
    ]);
    if (!medRes.error && medRes.data) setMedicines(medRes.data as Medicine[]);
    if (!impRes.error && impRes.data) setImplants(impRes.data as Implant[]);
    setLoading(false);
  }, []);

  useEffect(() => { if (user) fetchMedicines(); }, [user, fetchMedicines]);

  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || (m.batch_no || "").toLowerCase().includes(q) || (m.packing || "").toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (activeTab === "opd") return m.type === "opd";
    if (activeTab === "ipd") return m.type === "ipd";
    if (activeTab === "low") return m.stock_qty <= (m.reorder_level ?? REORDER_DEFAULT);
    if (activeTab === "expiring") return isExpiringSoon(m.exp_date) || isExpired(m.exp_date);
    return true;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortBy === "name") cmp = a.name.localeCompare(b.name);
    else if (sortBy === "stock") cmp = a.stock_qty - b.stock_qty;
    else if (sortBy === "expiry") {
      const da = parseExpDate(a.exp_date)?.getTime() ?? Infinity;
      const db = parseExpDate(b.exp_date)?.getTime() ?? Infinity;
      cmp = da - db;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalMeds = medicines.length;
  const lowStockCount = medicines.filter(m => m.stock_qty <= (m.reorder_level ?? REORDER_DEFAULT)).length;
  const expiringCount = medicines.filter(m => isExpiringSoon(m.exp_date) || isExpired(m.exp_date)).length;
  const expiredCount = medicines.filter(m => isExpired(m.exp_date)).length;
  const opdCount = medicines.filter(m => m.type === "opd").length;
  const ipdCount = medicines.filter(m => m.type === "ipd").length;
  const lowImplants = implants.filter(i => i.quantity_in_stock <= i.reorder_level).length;
  const filteredImplants = implants.filter(i => !implantSearch || i.name.toLowerCase().includes(implantSearch.toLowerCase()) || i.manufacturer.toLowerCase().includes(implantSearch.toLowerCase()));

  const handleAddImplant = async () => {
    setImplantError("");
    if (!newImplant.name.trim()) { setImplantError("Name required."); return; }
    const { error } = await supabase.from("implant").insert({ name: newImplant.name.trim(), manufacturer: newImplant.manufacturer.trim(), quantity_in_stock: parseInt(newImplant.quantity_in_stock) || 0, unit_price: parseFloat(newImplant.unit_price) || 0, reorder_level: parseInt(newImplant.reorder_level) || 2 });
    if (error) { setImplantError("Failed: " + error.message); }
    else { setShowAddImplant(false); setNewImplant({ name: "", manufacturer: "", quantity_in_stock: "", unit_price: "", reorder_level: "2" }); await fetchMedicines(); }
  };

  const handleSaveImplant = async () => {
    if (!editImplant) return;
    setSaving(true); setImplantSaveMsg("");
    const { error } = await supabase.from("implant").update({ quantity_in_stock: parseInt(editImplantQty) || 0, unit_price: parseFloat(editImplantPrice) || 0, reorder_level: parseInt(editImplantReorder) || 2 }).eq("implant_id", editImplant.implant_id);
    if (error) { setImplantSaveMsg("❌ Error saving."); }
    else { setImplantSaveMsg("✅ Saved!"); await fetchMedicines(); setTimeout(() => { setEditImplant(null); setImplantSaveMsg(""); }, 1000); }
    setSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true); setSaveMsg("");
    const { error } = await supabase.from("medicine_list").update({ stock_qty: parseInt(editQty) || 0, reorder_level: parseInt(editReorder) || REORDER_DEFAULT, mrp: parseFloat(editMrp) || 0, batch_no: editBatch, exp_date: editExp || null }).eq("id", editItem.id);
    if (error) { setSaveMsg("❌ Error saving. Try again."); }
    else { setSaveMsg("✅ Saved successfully!"); await fetchMedicines(); setTimeout(() => { setEditItem(null); setSaveMsg(""); }, 1000); }
    setSaving(false);
  };

  const handleAddMedicine = async () => {
    setAddError("");
    if (!addName.trim()) { setAddError("Medicine name is required."); return; }
    const { error } = await supabase.from("medicine_list").insert({ name: addName.trim().toUpperCase(), type: addType, stock_qty: parseInt(addQty) || 0, mrp: parseFloat(addMrp) || 0, packing: addPacking.trim(), batch_no: addBatch.trim(), exp_date: addExp.trim() || null, reorder_level: parseInt(addReorder) || REORDER_DEFAULT });
    if (error) { setAddError("Failed to add. " + error.message); }
    else { setShowAdd(false); setAddName(""); setAddType("opd"); setAddQty(""); setAddMrp(""); setAddPacking(""); setAddBatch(""); setAddExp(""); setAddReorder("10"); await fetchMedicines(); }
  };

  const openEdit = (m: Medicine) => { setEditItem(m); setEditQty(String(m.stock_qty ?? 0)); setEditReorder(String(m.reorder_level ?? REORDER_DEFAULT)); setEditMrp(String(m.mrp ?? 0)); setEditBatch(m.batch_no ?? ""); setEditExp(m.exp_date ?? ""); setSaveMsg(""); };
  const handleSort = (col: "name" | "stock" | "expiry") => { if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortBy(col); setSortDir("asc"); } };

  if (authLoading || !user) return <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", color: "#0a2463", fontSize: 18 }}>Loading…</div>;

  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", border: "1.5px solid #e0e7ff", borderRadius: 10, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "'Inter',sans-serif", background: "#fff", color: "#030a1e" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 600, fontFamily: "'Inter',sans-serif" };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        input,select,textarea{color:#030a1e!important;font-size:15px!important;font-family:'Inter',sans-serif!important;}
        input::placeholder,textarea::placeholder{color:#9ca3af!important;}
        input:focus,select:focus,textarea:focus{border-color:#1a56db!important;outline:none!important;}
        th,td{font-family:'Inter',sans-serif;font-size:14px;}
        button{font-family:'Inter',sans-serif!important;}
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      {/* Premium header */}
      <div style={{ background: "linear-gradient(135deg,#0a1628,#1a2f6e)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 900, fontFamily: "'Playfair Display',serif", letterSpacing: "-0.5px" }}>💊 Stock Management</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: "4px 0 0", fontSize: 14 }}>Neel Orthopaedic Hospital — Pharmacy & Implant Inventory</p>
        </div>
        <button onClick={() => activeTab === "implants" ? setShowAddImplant(true) : setShowAdd(true)}
          style={{ background: "linear-gradient(135deg,#1a56db,#60a5fa)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontFamily: "'Inter',sans-serif", fontSize: 15, cursor: "pointer", fontWeight: 700, boxShadow: "0 4px 14px rgba(26,86,219,0.35)" }}>
          {activeTab === "implants" ? "+ Add Implant" : "+ Add Medicine"}
        </button>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px" }}>
        {/* Stat cards - gradient */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Medicines", value: totalMeds, bg: "linear-gradient(135deg,#0f2d6b,#1a56db)", icon: "💊" },
            { label: "OPD Stock", value: opdCount, bg: "linear-gradient(135deg,#064e3b,#10b981)", icon: "🏥" },
            { label: "IPD Medicines", value: ipdCount, bg: "linear-gradient(135deg,#1e1b4b,#7c3aed)", icon: "🩺" },
            { label: "Implants", value: implants.length, bg: "linear-gradient(135deg,#0c4a6e,#0ea5e9)", icon: "🦴" },
            { label: "Low Stock", value: lowStockCount, bg: "linear-gradient(135deg,#7f1d1d,#ef4444)", icon: "⚠️" },
            { label: "Expiring / Expired", value: expiringCount, bg: "linear-gradient(135deg,#92400e,#f59e0b)", icon: "📅" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "20px 16px", color: "white", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Playfair Display',serif", letterSpacing: "-1px", lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {(lowStockCount > 0 || expiringCount > 0 || lowImplants > 0) && (
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap" }}>
            {lowStockCount > 0 && <span style={{ color: "#dc2626", fontWeight: 600, fontSize: 14 }}>⚠️ {lowStockCount} medicine{lowStockCount > 1 ? "s" : ""} at or below reorder level</span>}
            {lowImplants > 0 && <span style={{ color: "#0891b2", fontWeight: 600, fontSize: 14 }}>🦴 {lowImplants} implant{lowImplants > 1 ? "s" : ""} at or below reorder level</span>}
            {expiringCount > 0 && <span style={{ color: "#d97706", fontWeight: 600, fontSize: 14 }}>📅 {expiringCount} item{expiringCount > 1 ? "s" : ""} expiring within 3 months{expiredCount > 0 ? ` (${expiredCount} expired)` : ""}</span>}
            <span style={{ color: "#888", fontSize: 13, marginLeft: "auto" }}>Click the relevant tab to view</span>
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(10,36,99,0.07)", marginBottom: 4 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8eef8", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input type="text"
              placeholder={activeTab === "implants" ? "🔍  Search implants..." : "🔍  Search by name, batch, packing..."}
              value={activeTab === "implants" ? implantSearch : search}
              onChange={e => activeTab === "implants" ? setImplantSearch(e.target.value) : setSearch(e.target.value)}
              style={{ ...inp, flex: 1, minWidth: 240 }} />
            <span style={{ color: "#888", fontSize: 14 }}>{activeTab === "implants" ? filteredImplants.length : filtered.length} results</span>
          </div>

          <div style={{ display: "flex", borderBottom: "1px solid #e8eef8", padding: "0 16px", overflowX: "auto" }}>
            {([
              { key: "all", label: `All (${totalMeds})` },
              { key: "opd", label: `OPD (${opdCount})` },
              { key: "ipd", label: `IPD Medicines (${ipdCount})` },
              { key: "low", label: `⚠️ Low Stock (${lowStockCount})` },
              { key: "expiring", label: `📅 Expiring (${expiringCount})` },
              { key: "implants", label: `🦴 Implants (${implants.length})` },
            ] as { key: TabType; label: string }[]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ padding: "14px 18px", border: "none", background: "transparent", fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: activeTab === t.key ? 700 : 500, color: activeTab === t.key ? "#0a2463" : "#9ca3af", borderBottom: activeTab === t.key ? "3px solid #1a56db" : "3px solid transparent", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "implants" ? (
            loading ? <div style={{ textAlign: "center", padding: 60, color: "#888", fontSize: 15 }}>Loading…</div> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f8faff" }}>
                      {["#", "Implant Name", "Manufacturer", "Stock Qty", "Reorder Level", "Unit Price (₹)", "Status", "Action"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#374151", fontWeight: 700, borderBottom: "2px solid #e8eef8", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImplants.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#aaa", fontSize: 15 }}>No implants found.</td></tr>
                    ) : filteredImplants.map((imp, idx) => {
                      const low = imp.quantity_in_stock <= imp.reorder_level;
                      return (
                        <tr key={imp.implant_id} style={{ background: low ? "#fff7ed" : idx % 2 === 0 ? "#fff" : "#f8faff" }}>
                          <td style={{ padding: "12px 16px", color: "#9ca3af" }}>{imp.implant_id}</td>
                          <td style={{ padding: "12px 16px", fontWeight: 700, color: "#030a1e", fontSize: 15 }}>{imp.name}</td>
                          <td style={{ padding: "12px 16px", color: "#555" }}>{imp.manufacturer}</td>
                          <td style={{ padding: "12px 16px", fontWeight: 800, color: low ? "#dc2626" : "#16a34a", fontSize: 16 }}>{imp.quantity_in_stock}</td>
                          <td style={{ padding: "12px 16px", color: "#555" }}>{imp.reorder_level}</td>
                          <td style={{ padding: "12px 16px", color: "#555" }}>₹{Number(imp.unit_price).toLocaleString()}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {low ? <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>LOW STOCK</span>
                              : <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>OK</span>}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <button onClick={() => { setEditImplant(imp); setEditImplantQty(String(imp.quantity_in_stock)); setEditImplantPrice(String(imp.unit_price)); setEditImplantReorder(String(imp.reorder_level)); setImplantSaveMsg(""); }}
                              style={{ background: "#eff6ff", color: "#1a56db", border: "1.5px solid #bfdbfe", borderRadius: 8, padding: "6px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Edit</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f8faff" }}>
                    {[{ label: "Medicine Name", key: "name" as const }, { label: "Type", key: null }, { label: "Packing", key: null }, { label: "Batch No.", key: null }, { label: "Expiry", key: "expiry" as const }, { label: "Stock Qty", key: "stock" as const }, { label: "Reorder Lvl", key: null }, { label: "MRP (₹)", key: null }, { label: "Status", key: null }, { label: "Action", key: null }].map(col => (
                      <th key={col.label} onClick={col.key ? () => handleSort(col.key!) : undefined}
                        style={{ padding: "12px 16px", textAlign: "left", color: "#374151", fontWeight: 700, borderBottom: "2px solid #e8eef8", cursor: col.key ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap" }}>
                        {col.label}{col.key && sortBy === col.key && (sortDir === "asc" ? " ↑" : " ↓")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#aaa", fontSize: 15 }}>No medicines found.</td></tr>
                  ) : filtered.map((m, idx) => {
                    const low = m.stock_qty <= (m.reorder_level ?? REORDER_DEFAULT);
                    const expSoon = isExpiringSoon(m.exp_date);
                    const expired = isExpired(m.exp_date);
                    const rowBg = idx % 2 === 0 ? "#fff" : "#f8faff";
                    const alertBg = expired ? "#fff1f2" : expSoon ? "#fffbeb" : low ? "#fff7ed" : rowBg;
                    return (
                      <tr key={m.id} style={{ background: alertBg }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#030a1e", maxWidth: 280, fontSize: 15 }}>{m.name}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: m.type === "opd" ? "#dbeafe" : "#ede9fe", color: m.type === "opd" ? "#1e40af" : "#6d28d9", borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>{m.type.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#555" }}>{m.packing || "—"}</td>
                        <td style={{ padding: "12px 16px", color: "#555", fontSize: 13 }}>{m.batch_no || "—"}</td>
                        <td style={{ padding: "12px 16px", color: expired ? "#dc2626" : expSoon ? "#d97706" : "#555", fontWeight: expired || expSoon ? 600 : 400 }}>
                          {formatExpDate(m.exp_date)}{expired && " 🔴"}{!expired && expSoon && " ⚠️"}
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: low ? "#dc2626" : "#16a34a", fontSize: 16 }}>{m.stock_qty}</td>
                        <td style={{ padding: "12px 16px", color: "#555" }}>{m.reorder_level ?? REORDER_DEFAULT}</td>
                        <td style={{ padding: "12px 16px", color: "#555" }}>{m.mrp > 0 ? `₹${Number(m.mrp).toFixed(2)}` : "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {expired ? <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>EXPIRED</span>
                            : expSoon ? <span style={{ background: "#fef3c7", color: "#d97706", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>EXP SOON</span>
                            : low ? <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>LOW STOCK</span>
                            : <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>OK</span>}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => openEdit(m)}
                            style={{ background: "#eff6ff", color: "#1a56db", border: "1.5px solid #bfdbfe", borderRadius: 8, padding: "6px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Edit</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editImplant && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "'Inter',sans-serif" }}>
            <h3 style={{ margin: "0 0 4px", color: "#030a1e", fontSize: 20, fontWeight: 900, fontFamily: "'Playfair Display',serif" }}>Edit Implant</h3>
            <p style={{ margin: "0 0 20px", color: "#888", fontSize: 14 }}>{editImplant.name} — {editImplant.manufacturer}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[{ label: "Stock Qty", value: editImplantQty, set: setEditImplantQty }, { label: "Unit Price (₹)", value: editImplantPrice, set: setEditImplantPrice }, { label: "Reorder Level", value: editImplantReorder, set: setEditImplantReorder }].map(f => (
                <div key={f.label}><label style={lbl}>{f.label}</label><input type="number" value={f.value} onChange={e => f.set(e.target.value)} style={inp} /></div>
              ))}
            </div>
            {implantSaveMsg && <p style={{ color: implantSaveMsg.startsWith("✅") ? "#16a34a" : "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{implantSaveMsg}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleSaveImplant} disabled={saving} style={{ flex: 1, background: "linear-gradient(135deg,#0f2d6b,#1a56db)", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, cursor: saving ? "not-allowed" : "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Save Changes"}</button>
              <button onClick={() => setEditImplant(null)} style={{ flex: 1, background: "#f1f5f9", color: "#333", border: "none", borderRadius: 10, padding: 13, fontSize: 15, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddImplant && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "'Inter',sans-serif" }}>
            <h3 style={{ margin: "0 0 20px", color: "#030a1e", fontSize: 20, fontWeight: 900, fontFamily: "'Playfair Display',serif" }}>Add New Implant</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {[{ label: "Implant Name *", key: "name", ph: "e.g. Titanium Knee Implant", full: true }, { label: "Manufacturer", key: "manufacturer", ph: "e.g. Zimmer Biomet" }, { label: "Stock Qty", key: "quantity_in_stock", ph: "0" }, { label: "Unit Price (₹)", key: "unit_price", ph: "0.00" }, { label: "Reorder Level", key: "reorder_level", ph: "2" }].map(f => (
                <div key={f.key} style={{ gridColumn: (f as any).full ? "1 / -1" : "auto" }}>
                  <label style={lbl}>{f.label}</label>
                  <input type="text" placeholder={(f as any).ph} value={(newImplant as any)[f.key]} onChange={e => setNewImplant(n => ({ ...n, [f.key]: e.target.value }))} style={inp} />
                </div>
              ))}
            </div>
            {implantError && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{implantError}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleAddImplant} style={{ flex: 1, background: "linear-gradient(135deg,#0f2d6b,#1a56db)", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, cursor: "pointer", fontWeight: 700 }}>Add Implant</button>
              <button onClick={() => { setShowAddImplant(false); setImplantError(""); }} style={{ flex: 1, background: "#f1f5f9", color: "#333", border: "none", borderRadius: 10, padding: 13, fontSize: 15, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "'Inter',sans-serif" }}>
            <h3 style={{ margin: "0 0 4px", color: "#030a1e", fontSize: 20, fontWeight: 900, fontFamily: "'Playfair Display',serif" }}>Edit Stock Entry</h3>
            <p style={{ margin: "0 0 20px", color: "#888", fontSize: 13 }}>{editItem.name}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {[{ label: "Stock Qty", value: editQty, set: setEditQty, type: "number" }, { label: "Reorder Level", value: editReorder, set: setEditReorder, type: "number" }, { label: "MRP (₹)", value: editMrp, set: setEditMrp, type: "number" }, { label: "Batch No.", value: editBatch, set: setEditBatch, type: "text" }].map(f => (
                <div key={f.label}><label style={lbl}>{f.label}</label><input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} style={inp} /></div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Expiry Date (MM/YYYY)</label>
              <input type="text" value={editExp} onChange={e => setEditExp(e.target.value)} placeholder="e.g. 06/2027" style={inp} />
            </div>
            {saveMsg && <p style={{ color: saveMsg.startsWith("✅") ? "#16a34a" : "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{saveMsg}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 1, background: "linear-gradient(135deg,#0f2d6b,#1a56db)", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, cursor: saving ? "not-allowed" : "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Save Changes"}</button>
              <button onClick={() => setEditItem(null)} style={{ flex: 1, background: "#f1f5f9", color: "#333", border: "none", borderRadius: 10, padding: 13, fontSize: 15, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "'Inter',sans-serif", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", color: "#030a1e", fontSize: 20, fontWeight: 900, fontFamily: "'Playfair Display',serif" }}>Add New Medicine / Item</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Medicine / Item Name *</label>
              <input type="text" value={addName} onChange={e => setAddName(e.target.value)} placeholder="e.g. PARACETAMOL 500MG TAB" style={inp} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Type</label>
              <select value={addType} onChange={e => setAddType(e.target.value as "opd" | "ipd")} style={inp}>
                <option value="opd">OPD (Pharmacy)</option>
                <option value="ipd">IPD / Surgical</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[{ label: "Stock Qty", value: addQty, set: setAddQty, ph: "0" }, { label: "Reorder Level", value: addReorder, set: setAddReorder, ph: "10" }, { label: "MRP (₹)", value: addMrp, set: setAddMrp, ph: "0.00" }, { label: "Packing", value: addPacking, set: setAddPacking, ph: "10TAB / 500ML" }, { label: "Batch No.", value: addBatch, set: setAddBatch, ph: "e.g. ABC1234" }, { label: "Expiry (MM/YYYY)", value: addExp, set: setAddExp, ph: "06/2027" }].map(f => (
                <div key={f.label}><label style={lbl}>{f.label}</label><input type="text" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={inp} /></div>
              ))}
            </div>
            {addError && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{addError}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleAddMedicine} style={{ flex: 1, background: "linear-gradient(135deg,#0f2d6b,#1a56db)", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, cursor: "pointer", fontWeight: 700 }}>Add Medicine</button>
              <button onClick={() => { setShowAdd(false); setAddError(""); }} style={{ flex: 1, background: "#f1f5f9", color: "#333", border: "none", borderRadius: 10, padding: 13, fontSize: 15, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}