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
    if (error) { setImplantSaveMsg("Error saving."); }
    else { setImplantSaveMsg("Saved!"); await fetchMedicines(); setTimeout(() => { setEditImplant(null); setImplantSaveMsg(""); }, 1000); }
    setSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true); setSaveMsg("");
    const { error } = await supabase.from("medicine_list").update({ stock_qty: parseInt(editQty) || 0, reorder_level: parseInt(editReorder) || REORDER_DEFAULT, mrp: parseFloat(editMrp) || 0, batch_no: editBatch, exp_date: editExp || null }).eq("id", editItem.id);
    if (error) { setSaveMsg("Error saving. Try again."); }
    else { setSaveMsg("Saved successfully!"); await fetchMedicines(); setTimeout(() => { setEditItem(null); setSaveMsg(""); }, 1000); }
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

  if (authLoading || !user) return <div style={{ minHeight: "100vh", background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", color: "#0a2463" }}>Loading…</div>;

  const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid #e3e6ef", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", background: "#fff", color: "#1e293b" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" };

  return (
    <div style={{ minHeight: "100vh", background: "#eef4ff", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        input,select,textarea{color:#1e293b!important;font-size:14px!important;font-family:'DM Sans',sans-serif!important;}
        input::placeholder,textarea::placeholder{color:#94a3b8!important;}
        input:focus,select:focus,textarea:focus{border-color:#0a2463!important;outline:none!important;}
        th,td{font-family:'DM Sans',sans-serif;font-size:13px;}
        button{font-family:'DM Sans',sans-serif!important;}
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      {/* Header */}
      <div style={{ background: "#0a2463", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" }}>Stock Management</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: "3px 0 0", fontSize: 13 }}>Neel Orthopaedic Hospital — Pharmacy & Implant Inventory</p>
        </div>
        <button onClick={() => activeTab === "implants" ? setShowAddImplant(true) : setShowAdd(true)}
          style={{ background: "white", color: "#0a2463", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
          {activeTab === "implants" ? "+ Add Implant" : "+ Add Medicine"}
        </button>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Medicines", value: totalMeds, border: "#93c5fd" },
            { label: "OPD Stock", value: opdCount, border: "#93c5fd" },
            { label: "IPD Medicines", value: ipdCount, border: "#c4b5fd" },
            { label: "Implants", value: implants.length, border: "#93c5fd" },
            { label: "Low Stock", value: lowStockCount, border: "#fca5a5" },
            { label: "Expiring / Expired", value: expiringCount, border: "#fcd34d" },
          ].map(s => (
            <div key={s.label} style={{ background: "#dbeafe", borderRadius: 10, padding: "16px 14px", border: "1px solid #bfdbfe", borderLeft: `5px solid ${s.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: "#0a2463", lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Alert banner */}
        {(lowStockCount > 0 || expiringCount > 0 || lowImplants > 0) && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 18px", marginBottom: 18, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            {lowStockCount > 0 && <span style={{ color: "#9f1239", fontWeight: 600, fontSize: 13 }}>⚠️ {lowStockCount} medicine{lowStockCount > 1 ? "s" : ""} at or below reorder level</span>}
            {lowImplants > 0 && <span style={{ color: "#1e40af", fontWeight: 600, fontSize: 13 }}>🦴 {lowImplants} implant{lowImplants > 1 ? "s" : ""} at or below reorder level</span>}
            {expiringCount > 0 && <span style={{ color: "#854d0e", fontWeight: 600, fontSize: 13 }}>📅 {expiringCount} item{expiringCount > 1 ? "s" : ""} expiring within 3 months{expiredCount > 0 ? ` (${expiredCount} expired)` : ""}</span>}
            <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: "auto" }}>Click the relevant tab to view</span>
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e3e6ef", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          {/* Search */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input type="text"
              placeholder={activeTab === "implants" ? "Search implants..." : "Search by name, batch, packing..."}
              value={activeTab === "implants" ? implantSearch : search}
              onChange={e => activeTab === "implants" ? setImplantSearch(e.target.value) : setSearch(e.target.value)}
              style={{ ...inp, flex: 1, minWidth: 240 }} />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>{activeTab === "implants" ? filteredImplants.length : filtered.length} results</span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 14px", overflowX: "auto" }}>
            {([
              { key: "all", label: `All (${totalMeds})` },
              { key: "opd", label: `OPD (${opdCount})` },
              { key: "ipd", label: `IPD Medicines (${ipdCount})` },
              { key: "low", label: `Low Stock (${lowStockCount})` },
              { key: "expiring", label: `Expiring (${expiringCount})` },
              { key: "implants", label: `Implants (${implants.length})` },
            ] as { key: TabType; label: string }[]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ padding: "12px 16px", border: "none", background: "transparent", fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500, color: activeTab === t.key ? "#0a2463" : "#94a3b8", borderBottom: activeTab === t.key ? "2px solid #0a2463" : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Table */}
          {activeTab === "implants" ? (
            loading ? <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>Loading…</div> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["#", "Implant Name", "Manufacturer", "Stock Qty", "Reorder Level", "Unit Price (₹)", "Status", "Action"].map(h => (
                        <th key={h} style={{ padding: "11px 14px", textAlign: "left", color: "#475569", fontWeight: 600, borderBottom: "1px solid #e3e6ef", whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImplants.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>No implants found.</td></tr>
                    ) : filteredImplants.map((imp, idx) => {
                      const low = imp.quantity_in_stock <= imp.reorder_level;
                      return (
                        <tr key={imp.implant_id} style={{ background: low ? "#fff7ed" : idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "11px 14px", color: "#94a3b8", fontSize: 12 }}>{imp.implant_id}</td>
                          <td style={{ padding: "11px 14px", fontWeight: 600, color: "#0a2463" }}>{imp.name}</td>
                          <td style={{ padding: "11px 14px", color: "#475569" }}>{imp.manufacturer}</td>
                          <td style={{ padding: "11px 14px", fontWeight: 700, color: low ? "#9f1239" : "#166534", fontSize: 15 }}>{imp.quantity_in_stock}</td>
                          <td style={{ padding: "11px 14px", color: "#475569" }}>{imp.reorder_level}</td>
                          <td style={{ padding: "11px 14px", color: "#475569" }}>₹{Number(imp.unit_price).toLocaleString()}</td>
                          <td style={{ padding: "11px 14px" }}>
                            {low
                              ? <span style={{ background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Low</span>
                              : <span style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>OK</span>}
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <button onClick={() => { setEditImplant(imp); setEditImplantQty(String(imp.quantity_in_stock)); setEditImplantPrice(String(imp.unit_price)); setEditImplantReorder(String(imp.reorder_level)); setImplantSaveMsg(""); }}
                              style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: 6, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Edit</button>
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
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[{ label: "Medicine Name", key: "name" as const }, { label: "Type", key: null }, { label: "Packing", key: null }, { label: "Batch No.", key: null }, { label: "Expiry", key: "expiry" as const }, { label: "Stock Qty", key: "stock" as const }, { label: "Reorder Lvl", key: null }, { label: "MRP (₹)", key: null }, { label: "Status", key: null }, { label: "Action", key: null }].map(col => (
                      <th key={col.label} onClick={col.key ? () => handleSort(col.key!) : undefined}
                        style={{ padding: "11px 14px", textAlign: "left", color: "#475569", fontWeight: 600, borderBottom: "1px solid #e3e6ef", cursor: col.key ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap", fontSize: 12 }}>
                        {col.label}{col.key && sortBy === col.key && (sortDir === "asc" ? " ↑" : " ↓")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>No medicines found.</td></tr>
                  ) : filtered.map((m, idx) => {
                    const low = m.stock_qty <= (m.reorder_level ?? REORDER_DEFAULT);
                    const expSoon = isExpiringSoon(m.exp_date);
                    const expired = isExpired(m.exp_date);
                    const rowBg = idx % 2 === 0 ? "#fff" : "#f8fafc";
                    const alertBg = expired ? "#fff1f2" : expSoon ? "#fffbeb" : low ? "#fff7ed" : rowBg;
                    return (
                      <tr key={m.id} style={{ background: alertBg }}>
                        <td style={{ padding: "11px 14px", fontWeight: 600, color: "#1e293b", maxWidth: 280 }}>{m.name}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ background: m.type === "opd" ? "#eff6ff" : "#f5f3ff", color: m.type === "opd" ? "#1e40af" : "#6d28d9", border: `1px solid ${m.type === "opd" ? "#bfdbfe" : "#ddd6fe"}`, borderRadius: 5, padding: "2px 8px", fontWeight: 600, fontSize: 11 }}>{m.type.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: "11px 14px", color: "#64748b" }}>{m.packing || "—"}</td>
                        <td style={{ padding: "11px 14px", color: "#64748b" }}>{m.batch_no || "—"}</td>
                        <td style={{ padding: "11px 14px", color: expired ? "#9f1239" : expSoon ? "#854d0e" : "#64748b", fontWeight: expired || expSoon ? 600 : 400 }}>
                          {formatExpDate(m.exp_date)}{expired && " 🔴"}{!expired && expSoon && " ⚠️"}
                        </td>
                        <td style={{ padding: "11px 14px", fontWeight: 700, color: low ? "#9f1239" : "#166534", fontSize: 15 }}>{m.stock_qty}</td>
                        <td style={{ padding: "11px 14px", color: "#64748b" }}>{m.reorder_level ?? REORDER_DEFAULT}</td>
                        <td style={{ padding: "11px 14px", color: "#64748b" }}>{m.mrp > 0 ? `₹${Number(m.mrp).toFixed(2)}` : "—"}</td>
                        <td style={{ padding: "11px 14px" }}>
                          {expired
                            ? <span style={{ background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Expired</span>
                            : expSoon
                            ? <span style={{ background: "#fffbeb", color: "#854d0e", border: "1px solid #fde68a", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Exp Soon</span>
                            : low
                            ? <span style={{ background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Low Stock</span>
                            : <span style={{ background: "#f0fdf4", color: "#166634", border: "1px solid #bbf7d0", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>OK</span>}
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <button onClick={() => openEdit(m)}
                            style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: 6, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Edit</button>
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

      {/* EDIT IMPLANT MODAL */}
      {editImplant && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 4px", color: "#0a2463", fontSize: 17, fontWeight: 700 }}>Edit Implant</h3>
            <p style={{ margin: "0 0 18px", color: "#94a3b8", fontSize: 13 }}>{editImplant.name} — {editImplant.manufacturer}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[{ label: "Stock Qty", value: editImplantQty, set: setEditImplantQty }, { label: "Unit Price (₹)", value: editImplantPrice, set: setEditImplantPrice }, { label: "Reorder Level", value: editImplantReorder, set: setEditImplantReorder }].map(f => (
                <div key={f.label}><label style={lbl}>{f.label}</label><input type="number" value={f.value} onChange={e => f.set(e.target.value)} style={inp} /></div>
              ))}
            </div>
            {implantSaveMsg && <p style={{ color: "#166534", fontSize: 13, margin: "0 0 12px" }}>{implantSaveMsg}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSaveImplant} disabled={saving} style={{ flex: 1, background: "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>{saving ? "Saving…" : "Save Changes"}</button>
              <button onClick={() => setEditImplant(null)} style={{ flex: 1, background: "#f6f8fb", color: "#64748b", border: "1px solid #e3e6ef", borderRadius: 8, padding: 11, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD IMPLANT MODAL */}
      {showAddImplant && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 18px", color: "#0a2463", fontSize: 17, fontWeight: 700 }}>Add New Implant</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              {[{ label: "Implant Name *", key: "name", ph: "e.g. Titanium Knee Implant", full: true }, { label: "Manufacturer", key: "manufacturer", ph: "e.g. Zimmer Biomet" }, { label: "Stock Qty", key: "quantity_in_stock", ph: "0" }, { label: "Unit Price (₹)", key: "unit_price", ph: "0.00" }, { label: "Reorder Level", key: "reorder_level", ph: "2" }].map(f => (
                <div key={f.key} style={{ gridColumn: (f as any).full ? "1 / -1" : "auto" }}>
                  <label style={lbl}>{f.label}</label>
                  <input type="text" placeholder={(f as any).ph} value={(newImplant as any)[f.key]} onChange={e => setNewImplant(n => ({ ...n, [f.key]: e.target.value }))} style={inp} />
                </div>
              ))}
            </div>
            {implantError && <p style={{ color: "#9f1239", fontSize: 13, margin: "0 0 12px" }}>{implantError}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleAddImplant} style={{ flex: 1, background: "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Add Implant</button>
              <button onClick={() => { setShowAddImplant(false); setImplantError(""); }} style={{ flex: 1, background: "#f6f8fb", color: "#64748b", border: "1px solid #e3e6ef", borderRadius: 8, padding: 11, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MEDICINE MODAL */}
      {editItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 4px", color: "#0a2463", fontSize: 17, fontWeight: 700 }}>Edit Stock Entry</h3>
            <p style={{ margin: "0 0 18px", color: "#94a3b8", fontSize: 13 }}>{editItem.name}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[{ label: "Stock Qty", value: editQty, set: setEditQty, type: "number" }, { label: "Reorder Level", value: editReorder, set: setEditReorder, type: "number" }, { label: "MRP (₹)", value: editMrp, set: setEditMrp, type: "number" }, { label: "Batch No.", value: editBatch, set: setEditBatch, type: "text" }].map(f => (
                <div key={f.label}><label style={lbl}>{f.label}</label><input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} style={inp} /></div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Expiry Date (MM/YYYY)</label>
              <input type="text" value={editExp} onChange={e => setEditExp(e.target.value)} placeholder="e.g. 06/2027" style={inp} />
            </div>
            {saveMsg && <p style={{ color: "#166534", fontSize: 13, margin: "0 0 12px" }}>{saveMsg}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 1, background: "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}>{saving ? "Saving…" : "Save Changes"}</button>
              <button onClick={() => setEditItem(null)} style={{ flex: 1, background: "#f6f8fb", color: "#64748b", border: "1px solid #e3e6ef", borderRadius: 8, padding: 11, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEDICINE MODAL */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 18px", color: "#0a2463", fontSize: 17, fontWeight: 700 }}>Add New Medicine</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Medicine / Item Name *</label>
              <input type="text" value={addName} onChange={e => setAddName(e.target.value)} placeholder="e.g. PARACETAMOL 500MG TAB" style={inp} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Type</label>
              <select value={addType} onChange={e => setAddType(e.target.value as "opd" | "ipd")} style={inp}>
                <option value="opd">OPD (Pharmacy)</option>
                <option value="ipd">IPD / Surgical</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[{ label: "Stock Qty", value: addQty, set: setAddQty, ph: "0" }, { label: "Reorder Level", value: addReorder, set: setAddReorder, ph: "10" }, { label: "MRP (₹)", value: addMrp, set: setAddMrp, ph: "0.00" }, { label: "Packing", value: addPacking, set: setAddPacking, ph: "10TAB / 500ML" }, { label: "Batch No.", value: addBatch, set: setAddBatch, ph: "e.g. ABC1234" }, { label: "Expiry (MM/YYYY)", value: addExp, set: setAddExp, ph: "06/2027" }].map(f => (
                <div key={f.label}><label style={lbl}>{f.label}</label><input type="text" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={inp} /></div>
              ))}
            </div>
            {addError && <p style={{ color: "#9f1239", fontSize: 13, margin: "0 0 12px" }}>{addError}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleAddMedicine} style={{ flex: 1, background: "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Add Medicine</button>
              <button onClick={() => { setShowAdd(false); setAddError(""); }} style={{ flex: 1, background: "#f6f8fb", color: "#64748b", border: "1px solid #e3e6ef", borderRadius: 8, padding: 11, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}