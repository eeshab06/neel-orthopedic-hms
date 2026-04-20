"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MOM_PHONE = "919876543210";
const DEPARTMENTS = ["Housekeeping", "Admin", "OPD", "OT", "IPD", "Pharmacy", "Amit Staff"];
const SUPPLY_CATEGORIES = ["All", "Linen", "Cleaning", "Biomedical Waste", "Stationery", "Pantry", "PPE", "Laundry"];

type TabType = "staff" | "leaves" | "salary" | "supplies";

interface Staff {
  staff_id: number; name: string; department: string; phone: string | null;
  shift: string | null; joining_date: string | null; salary: number; is_active: boolean;
}
interface Leave {
  leave_id: number; staff_id: number; leave_date: string; leave_type: string;
  approved: boolean; note: string | null; staff?: { name: string; department: string };
}
interface Supply {
  supply_id: number; name: string; category: string; quantity: number;
  unit: string; reorder_level: number; last_ordered: string | null; notes: string | null;
}

function waLink(phone: string, msg: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}
function getMonthDays(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth("/admin");
  const [activeTab, setActiveTab] = useState<TabType>("staff");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);

  const [staffSearch, setStaffSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState({ name: "", department: "OPD", phone: "", shift: "9AM - 6PM", joining_date: "", salary: "" });
  const [staffError, setStaffError] = useState("");
  const [staffSaveMsg, setStaffSaveMsg] = useState("");

  const [leaveStaffId, setLeaveStaffId] = useState("");
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split("T")[0]);
  const [leaveType, setLeaveType] = useState("weekly_off");
  const [leaveNote, setLeaveNote] = useState("");
  const [leaveError, setLeaveError] = useState("");
  const [leaveSuccess, setLeaveSuccess] = useState("");
  const [leaveMonthFilter, setLeaveMonthFilter] = useState(new Date().getMonth());
  const [leaveYearFilter, setLeaveYearFilter] = useState(new Date().getFullYear());
  const [leaveDeptFilter, setLeaveDeptFilter] = useState("All");

  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth());
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [salaryDept, setSalaryDept] = useState("All");

  const [supplyCategory, setSupplyCategory] = useState("All");
  const [supplySearch, setSupplySearch] = useState("");
  const [editSupply, setEditSupply] = useState<Supply | null>(null);
  const [editSupplyQty, setEditSupplyQty] = useState("");
  const [editSupplyReorder, setEditSupplyReorder] = useState("");
  const [showAddSupply, setShowAddSupply] = useState(false);
  const [newSupply, setNewSupply] = useState({ name: "", category: "Linen", quantity: "", unit: "pcs", reorder_level: "5", notes: "" });
  const [supplyError, setSupplyError] = useState("");
  const [supplySaveMsg, setSupplySaveMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [sRes, lRes, supRes] = await Promise.all([
      supabase.from("staff").select("*").order("department").order("name"),
      supabase.from("staff_leave").select("*, staff:staff_id(name, department)").order("leave_date", { ascending: false }),
      supabase.from("hospital_supply").select("*").order("category").order("name"),
    ]);
    if (sRes.data) setStaff(sRes.data as Staff[]);
    if (lRes.data) setLeaves(lRes.data as Leave[]);
    if (supRes.data) setSupplies(supRes.data as Supply[]);
    setLoading(false);
  }, []);

  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  const handleAddStaff = async () => {
    setStaffError("");
    if (!newStaff.name.trim()) { setStaffError("Name required."); return; }
    const { error } = await supabase.from("staff").insert({
      name: newStaff.name.trim().toUpperCase(), department: newStaff.department,
      phone: newStaff.phone.trim() || null, shift: newStaff.shift.trim() || null,
      joining_date: newStaff.joining_date || null, salary: parseFloat(newStaff.salary) || 0,
    });
    if (error) { setStaffError("Failed: " + error.message); }
    else { setShowAddStaff(false); setNewStaff({ name: "", department: "OPD", phone: "", shift: "9AM - 6PM", joining_date: "", salary: "" }); await fetchAll(); }
  };

  const handleSaveStaff = async () => {
    if (!editStaff) return;
    setSaving(true); setStaffSaveMsg("");
    const { error } = await supabase.from("staff").update({
      phone: editStaff.phone, shift: editStaff.shift, salary: editStaff.salary, is_active: editStaff.is_active,
    }).eq("staff_id", editStaff.staff_id);
    if (error) { setStaffSaveMsg("❌ Error saving."); }
    else { setStaffSaveMsg("✅ Saved!"); await fetchAll(); setTimeout(() => { setEditStaff(null); setStaffSaveMsg(""); }, 1000); }
    setSaving(false);
  };

  const handleMarkLeave = async () => {
    setLeaveError(""); setLeaveSuccess("");
    if (!leaveStaffId) { setLeaveError("Select a staff member."); return; }
    if (!leaveDate) { setLeaveError("Select a date."); return; }
    const staffMember = staff.find(s => s.staff_id === parseInt(leaveStaffId));
    if (!staffMember) { setLeaveError("Staff not found."); return; }
    const conflict = leaves.find(l => l.leave_date === leaveDate && l.staff?.department === staffMember.department && l.staff_id !== parseInt(leaveStaffId));
    if (conflict) { setLeaveError(`⚠️ ${conflict.staff?.name} from ${staffMember.department} already has leave on ${leaveDate}.`); return; }
    const dup = leaves.find(l => l.staff_id === parseInt(leaveStaffId) && l.leave_date === leaveDate);
    if (dup) { setLeaveError("Leave already marked for this date."); return; }
    const { error } = await supabase.from("staff_leave").insert({
      staff_id: parseInt(leaveStaffId), leave_date: leaveDate, leave_type: leaveType, approved: true, note: leaveNote.trim() || null,
    });
    if (error) { setLeaveError("Failed: " + error.message); }
    else { setLeaveSuccess(`✅ Leave marked for ${staffMember.name} on ${leaveDate}`); setLeaveNote(""); await fetchAll(); setTimeout(() => setLeaveSuccess(""), 3000); }
  };

  const handleDeleteLeave = async (leaveId: number) => {
    await supabase.from("staff_leave").delete().eq("leave_id", leaveId);
    await fetchAll();
  };

  const handleSaveSupply = async () => {
    if (!editSupply) return;
    setSaving(true); setSupplySaveMsg("");
    const { error } = await supabase.from("hospital_supply").update({
      quantity: parseInt(editSupplyQty) || 0, reorder_level: parseInt(editSupplyReorder) || 5, last_ordered: editSupply.last_ordered,
    }).eq("supply_id", editSupply.supply_id);
    if (error) { setSupplySaveMsg("❌ Error."); }
    else { setSupplySaveMsg("✅ Saved!"); await fetchAll(); setTimeout(() => { setEditSupply(null); setSupplySaveMsg(""); }, 1000); }
    setSaving(false);
  };

  const handleAddSupply = async () => {
    setSupplyError("");
    if (!newSupply.name.trim()) { setSupplyError("Name required."); return; }
    const { error } = await supabase.from("hospital_supply").insert({
      name: newSupply.name.trim(), category: newSupply.category,
      quantity: parseInt(newSupply.quantity) || 0, unit: newSupply.unit.trim() || "pcs",
      reorder_level: parseInt(newSupply.reorder_level) || 5, notes: newSupply.notes.trim() || null,
    });
    if (error) { setSupplyError("Failed: " + error.message); }
    else { setShowAddSupply(false); setNewSupply({ name: "", category: "Linen", quantity: "", unit: "pcs", reorder_level: "5", notes: "" }); await fetchAll(); }
  };

  const filteredStaff = staff.filter(s => {
    const matchDept = deptFilter === "All" || s.department === deptFilter;
    const q = staffSearch.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || (s.phone || "").includes(q);
    return matchDept && matchSearch && s.is_active;
  });

  const filteredLeaves = leaves.filter(l => {
    const d = new Date(l.leave_date);
    return d.getMonth() === leaveMonthFilter && d.getFullYear() === leaveYearFilter && (leaveDeptFilter === "All" || l.staff?.department === leaveDeptFilter);
  });

  const filteredSupplies = supplies.filter(s => {
    return (supplyCategory === "All" || s.category === supplyCategory) && (!supplySearch || s.name.toLowerCase().includes(supplySearch.toLowerCase()));
  });

  const lowSupplies = supplies.filter(s => s.quantity <= s.reorder_level);

  const getSalaryData = () => {
    const daysInMonth = getMonthDays(salaryYear, salaryMonth);
    return staff.filter(s => s.is_active && (salaryDept === "All" || s.department === salaryDept)).map(s => {
      const leavesThisMonth = leaves.filter(l => { const d = new Date(l.leave_date); return l.staff_id === s.staff_id && d.getMonth() === salaryMonth && d.getFullYear() === salaryYear; });
      const totalLeaves = leavesThisMonth.length;
      const extraLeaves = Math.max(0, totalLeaves - 4);
      const deduction = extraLeaves * (s.salary / daysInMonth);
      return { ...s, totalLeaves, extraLeaves, deduction, net: s.salary - deduction };
    });
  };

  const salaryData = getSalaryData();
  const totalPayroll = salaryData.reduce((sum, s) => sum + s.net, 0);

  const buildSupplyAlert = () => {
    const items = lowSupplies.map(s => `• ${s.name} — ${s.quantity} ${s.unit} left (reorder at ${s.reorder_level})`).join("\n");
    return `🏥 *Neel Orthopaedic Hospital — Supply Alert*\n\nThe following items need to be restocked:\n\n${items}\n\nPlease arrange for reorder at the earliest.\n\n— Admin System`;
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #e0e7ff",
    borderRadius: "10px", fontSize: "15px", outline: "none",
    boxSizing: "border-box", fontFamily: "'Inter', sans-serif",
    background: "white", color: "#030a1e", transition: "border-color 0.2s",
  };

  const lbl: React.CSSProperties = {
    display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px", fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  };

  if (authLoading || !user) {
    return <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", color: "#0a2463", fontSize: "18px" }}>Loading…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        .display-font { font-family: 'Playfair Display', Georgia, serif !important; }
        .body-font { font-family: 'Inter', sans-serif !important; }
        input, select, textarea { color: #030a1e !important; font-size: 15px !important; }
        input::placeholder, textarea::placeholder { color: #9ca3af !important; }
        input:focus, select:focus, textarea:focus { border-color: #1a56db !important; outline: none !important; }
        table { font-family: 'Inter', sans-serif; }
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>
        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Staff", value: staff.filter(s => s.is_active).length, color: "#1a56db", bg: "linear-gradient(135deg, #0f2d6b, #1a56db)", icon: "👥" },
            { label: "Leaves This Month", value: leaves.filter(l => { const d = new Date(l.leave_date); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).length, color: "#d97706", bg: "linear-gradient(135deg, #92400e, #f59e0b)", icon: "📅" },
            { label: "Monthly Payroll", value: `₹${staff.filter(s=>s.is_active).reduce((sum,s)=>sum+s.salary,0).toLocaleString()}`, color: "#059669", bg: "linear-gradient(135deg, #064e3b, #10b981)", icon: "💰" },
            { label: "Total Supplies", value: supplies.length, color: "#7c3aed", bg: "linear-gradient(135deg, #1e1b4b, #7c3aed)", icon: "📦" },
            { label: "Low Stock", value: lowSupplies.length, color: "#dc2626", bg: "linear-gradient(135deg, #7f1d1d, #ef4444)", icon: "⚠️" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: "20px 22px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", color: "white" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div className="display-font" style={{ fontSize: typeof s.value === "string" ? 20 : 32, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
              <div className="body-font" style={{ fontSize: 13, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {lowSupplies.length > 0 && (
          <div style={{ background: "white", border: "1.5px solid #fed7aa", borderRadius: 14, padding: "16px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <span className="body-font" style={{ color: "#dc2626", fontWeight: 700, fontSize: 15 }}>⚠️ {lowSupplies.length} supplies need restocking</span>
            <a href={waLink(MOM_PHONE, buildSupplyAlert())} target="_blank" rel="noreferrer"
              style={{ background: "#25D366", color: "white", textDecoration: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
              💬 WhatsApp Alert to Mom
            </a>
          </div>
        )}

        <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(10,36,99,0.07)" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #e8eef8", padding: "0 20px", overflowX: "auto" }}>
            {([
              { key: "staff", label: `👥 Staff (${staff.filter(s=>s.is_active).length})` },
              { key: "leaves", label: "📅 Leaves & Attendance" },
              { key: "salary", label: "💰 Salary Summary" },
              { key: "supplies", label: `📦 Supplies (${supplies.length})` },
            ] as { key: TabType; label: string }[]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className="body-font"
                style={{ padding: "16px 22px", border: "none", background: "transparent", fontSize: 15, fontWeight: activeTab === t.key ? 700 : 500, color: activeTab === t.key ? "#0a2463" : "#9ca3af", borderBottom: activeTab === t.key ? "3px solid #1a56db" : "3px solid transparent", cursor: "pointer", marginBottom: -2, whiteSpace: "nowrap", transition: "all 0.2s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* STAFF TAB */}
          {activeTab === "staff" && (
            <div style={{ padding: 28 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
                <input type="text" placeholder="🔍 Search name or phone..." value={staffSearch} onChange={e => setStaffSearch(e.target.value)} style={{ ...inp, flex: 1, minWidth: 200 }} />
                <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ ...inp, width: "auto" }}>
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button onClick={() => setShowAddStaff(true)} className="body-font"
                  style={{ background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 15, cursor: "pointer", fontWeight: 700, boxShadow: "0 4px 12px rgba(26,86,219,0.3)" }}>
                  + Add Staff
                </button>
              </div>
              {DEPARTMENTS.filter(d => deptFilter === "All" || d === deptFilter).map(dept => {
                const deptStaff = filteredStaff.filter(s => s.department === dept);
                if (deptStaff.length === 0) return null;
                return (
                  <div key={dept} style={{ marginBottom: 28 }}>
                    <div style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderRadius: 10, padding: "12px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #bfdbfe" }}>
                      <span className="body-font" style={{ fontWeight: 800, color: "#1e3a8a", fontSize: 16 }}>{dept}</span>
                      <span className="body-font" style={{ fontSize: 13, color: "#6b7280" }}>{deptStaff.length} staff</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                        <thead>
                          <tr style={{ background: "#f8faff" }}>
                            {["Name", "Phone", "Shift", "Joining Date", "Monthly Salary", "Action"].map(h => (
                              <th key={h} className="body-font" style={{ padding: "12px 16px", textAlign: "left", color: "#374151", fontWeight: 700, borderBottom: "2px solid #e8eef8", fontSize: 13 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {deptStaff.map((s, idx) => (
                            <tr key={s.staff_id} style={{ background: idx % 2 === 0 ? "white" : "#f8faff", transition: "background 0.15s" }}>
                              <td className="body-font" style={{ padding: "12px 16px", fontWeight: 700, color: "#030a1e", fontSize: 15 }}>{s.name}</td>
                              <td className="body-font" style={{ padding: "12px 16px", color: "#6b7280" }}>{s.phone || "—"}</td>
                              <td className="body-font" style={{ padding: "12px 16px", color: "#6b7280" }}>{s.shift || "—"}</td>
                              <td className="body-font" style={{ padding: "12px 16px", color: "#6b7280" }}>{s.joining_date || "Senior Staff"}</td>
                              <td className="body-font" style={{ padding: "12px 16px", fontWeight: 700, color: "#059669", fontSize: 15 }}>₹{s.salary.toLocaleString()}</td>
                              <td style={{ padding: "12px 16px" }}>
                                <button onClick={() => { setEditStaff({ ...s }); setStaffSaveMsg(""); }} className="body-font"
                                  style={{ background: "#eff6ff", color: "#1a56db", border: "1.5px solid #bfdbfe", borderRadius: 8, padding: "6px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LEAVES TAB */}
          {activeTab === "leaves" && (
            <div style={{ padding: 28 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
                <div style={{ background: "#f8faff", borderRadius: 14, padding: 24, border: "1px solid #e0e7ff" }}>
                  <h3 className="body-font" style={{ margin: "0 0 20px", color: "#030a1e", fontSize: 18, fontWeight: 800 }}>Mark Leave</h3>
                  <div style={{ marginBottom: 16 }}>
                    <label style={lbl}>Staff Member *</label>
                    <select value={leaveStaffId} onChange={e => setLeaveStaffId(e.target.value)} style={inp}>
                      <option value="">Select staff...</option>
                      {DEPARTMENTS.map(dept => (
                        <optgroup key={dept} label={dept}>
                          {staff.filter(s => s.department === dept && s.is_active).map(s => (
                            <option key={s.staff_id} value={s.staff_id}>{s.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div><label style={lbl}>Date *</label><input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} style={inp} /></div>
                    <div>
                      <label style={lbl}>Leave Type</label>
                      <select value={leaveType} onChange={e => setLeaveType(e.target.value)} style={inp}>
                        <option value="weekly_off">Weekly Off</option>
                        <option value="sick">Sick Leave</option>
                        <option value="casual">Casual Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={lbl}>Note (optional)</label>
                    <input type="text" value={leaveNote} onChange={e => setLeaveNote(e.target.value)} placeholder="Reason..." style={inp} />
                  </div>
                  {leaveError && <p className="body-font" style={{ color: "#dc2626", fontSize: 14, margin: "0 0 12px", background: "#fff1f2", padding: "10px 14px", borderRadius: 8 }}>{leaveError}</p>}
                  {leaveSuccess && <p className="body-font" style={{ color: "#16a34a", fontSize: 14, margin: "0 0 12px" }}>{leaveSuccess}</p>}
                  <button onClick={handleMarkLeave} className="body-font"
                    style={{ background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: 10, padding: "13px 26px", fontSize: 15, cursor: "pointer", fontWeight: 700, boxShadow: "0 4px 12px rgba(26,86,219,0.3)" }}>
                    Mark Leave
                  </button>
                </div>
                <div style={{ background: "#f8faff", borderRadius: 14, padding: 24, border: "1px solid #e0e7ff" }}>
                  <h3 className="body-font" style={{ margin: "0 0 20px", color: "#030a1e", fontSize: 18, fontWeight: 800 }}>Today's Status</h3>
                  {DEPARTMENTS.map(dept => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    const onLeave = leaves.filter(l => l.leave_date === todayStr && l.staff?.department === dept);
                    return (
                      <div key={dept} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e0e7ff", fontSize: 14 }}>
                        <span className="body-font" style={{ color: "#030a1e", fontWeight: 600 }}>{dept}</span>
                        {onLeave.length > 0
                          ? <span className="body-font" style={{ color: "#dc2626", fontWeight: 700 }}>⚠️ {onLeave.map(l => l.staff?.name).join(", ")}</span>
                          : <span className="body-font" style={{ color: "#16a34a", fontWeight: 600 }}>✅ All present</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
                <span className="body-font" style={{ fontWeight: 700, color: "#030a1e", fontSize: 15 }}>Leave History:</span>
                <select value={leaveMonthFilter} onChange={e => setLeaveMonthFilter(parseInt(e.target.value))} style={{ ...inp, width: "auto" }}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={leaveYearFilter} onChange={e => setLeaveYearFilter(parseInt(e.target.value))} style={{ ...inp, width: "auto" }}>
                  {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={leaveDeptFilter} onChange={e => setLeaveDeptFilter(e.target.value)} style={{ ...inp, width: "auto" }}>
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f8faff" }}>
                      {["Staff Name","Department","Date","Type","Note","Action"].map(h => (
                        <th key={h} className="body-font" style={{ padding: "12px 16px", textAlign: "left", color: "#374151", fontWeight: 700, borderBottom: "2px solid #e8eef8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.length === 0 ? (
                      <tr><td colSpan={6} className="body-font" style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 15 }}>No leaves found for this period.</td></tr>
                    ) : filteredLeaves.map((l, idx) => (
                      <tr key={l.leave_id} style={{ background: idx % 2 === 0 ? "white" : "#f8faff" }}>
                        <td className="body-font" style={{ padding: "12px 16px", fontWeight: 700, color: "#030a1e" }}>{l.staff?.name || "—"}</td>
                        <td className="body-font" style={{ padding: "12px 16px", color: "#6b7280" }}>{l.staff?.department || "—"}</td>
                        <td className="body-font" style={{ padding: "12px 16px", color: "#6b7280" }}>{l.leave_date}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span className="body-font" style={{ background: l.leave_type === "weekly_off" ? "#dbeafe" : "#fee2e2", color: l.leave_type === "weekly_off" ? "#1e40af" : "#dc2626", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                            {l.leave_type.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="body-font" style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 13 }}>{l.note || "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => handleDeleteLeave(l.leave_id)} className="body-font"
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SALARY TAB */}
          {activeTab === "salary" && (
            <div style={{ padding: 28 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap", alignItems: "center" }}>
                <span className="body-font" style={{ fontWeight: 700, color: "#030a1e", fontSize: 15 }}>Month:</span>
                <select value={salaryMonth} onChange={e => setSalaryMonth(parseInt(e.target.value))} style={{ ...inp, width: "auto" }}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={salaryYear} onChange={e => setSalaryYear(parseInt(e.target.value))} style={{ ...inp, width: "auto" }}>
                  {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={salaryDept} onChange={e => setSalaryDept(e.target.value)} style={{ ...inp, width: "auto" }}>
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div style={{ marginLeft: "auto", background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "1px solid #6ee7b7", borderRadius: 12, padding: "12px 22px", fontWeight: 800, color: "#065f46", fontSize: 16, fontFamily: "'Inter', sans-serif" }}>
                  Total Payroll: ₹{totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f8faff" }}>
                      {["Name","Department","Base Salary","Leaves","Allowed (4)","Extra","Deduction","Net Payable"].map(h => (
                        <th key={h} className="body-font" style={{ padding: "12px 16px", textAlign: "left", color: "#374151", fontWeight: 700, borderBottom: "2px solid #e8eef8", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {salaryData.map((s, idx) => (
                      <tr key={s.staff_id} style={{ background: s.extraLeaves > 0 ? "#fff7ed" : idx % 2 === 0 ? "white" : "#f8faff" }}>
                        <td className="body-font" style={{ padding: "12px 16px", fontWeight: 700, color: "#030a1e" }}>{s.name}</td>
                        <td className="body-font" style={{ padding: "12px 16px", color: "#6b7280" }}>{s.department}</td>
                        <td className="body-font" style={{ padding: "12px 16px", color: "#6b7280" }}>₹{s.salary.toLocaleString()}</td>
                        <td className="body-font" style={{ padding: "12px 16px", fontWeight: 700, color: s.totalLeaves > 4 ? "#dc2626" : "#030a1e" }}>{s.totalLeaves}</td>
                        <td className="body-font" style={{ padding: "12px 16px", color: "#9ca3af" }}>4</td>
                        <td className="body-font" style={{ padding: "12px 16px", fontWeight: 700, color: s.extraLeaves > 0 ? "#dc2626" : "#16a34a" }}>{s.extraLeaves}</td>
                        <td className="body-font" style={{ padding: "12px 16px", color: s.deduction > 0 ? "#dc2626" : "#9ca3af" }}>{s.deduction > 0 ? `−₹${s.deduction.toFixed(0)}` : "—"}</td>
                        <td className="body-font" style={{ padding: "12px 16px", fontWeight: 800, color: "#059669", fontSize: 15 }}>₹{s.net.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUPPLIES TAB */}
          {activeTab === "supplies" && (
            <div style={{ padding: 28 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
                <input type="text" placeholder="🔍 Search supplies..." value={supplySearch} onChange={e => setSupplySearch(e.target.value)} style={{ ...inp, flex: 1, minWidth: 200 }} />
                <select value={supplyCategory} onChange={e => setSupplyCategory(e.target.value)} style={{ ...inp, width: "auto" }}>
                  {SUPPLY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => setShowAddSupply(true)} className="body-font"
                  style={{ background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 15, cursor: "pointer", fontWeight: 700 }}>
                  + Add Item
                </button>
                {lowSupplies.length > 0 && (
                  <a href={waLink(MOM_PHONE, buildSupplyAlert())} target="_blank" rel="noreferrer" className="body-font"
                    style={{ background: "#25D366", color: "white", textDecoration: "none", borderRadius: 10, padding: "11px 18px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    💬 Alert Mom ({lowSupplies.length} low)
                  </a>
                )}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f8faff" }}>
                      {["Item Name","Category","Quantity","Unit","Reorder At","Status","Action"].map(h => (
                        <th key={h} className="body-font" style={{ padding: "12px 16px", textAlign: "left", color: "#374151", fontWeight: 700, borderBottom: "2px solid #e8eef8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSupplies.length === 0 ? (
                      <tr><td colSpan={7} className="body-font" style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>No supplies found.</td></tr>
                    ) : filteredSupplies.map((s, idx) => {
                      const low = s.quantity <= s.reorder_level;
                      return (
                        <tr key={s.supply_id} style={{ background: low ? "#fff7ed" : idx % 2 === 0 ? "white" : "#f8faff" }}>
                          <td className="body-font" style={{ padding: "12px 16px", fontWeight: 700, color: "#030a1e" }}>{s.name}</td>
                          <td style={{ padding: "12px 16px" }}><span className="body-font" style={{ background: "#eff6ff", color: "#1e3a8a", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{s.category}</span></td>
                          <td className="body-font" style={{ padding: "12px 16px", fontWeight: 800, color: low ? "#dc2626" : "#059669", fontSize: 16 }}>{s.quantity}</td>
                          <td className="body-font" style={{ padding: "12px 16px", color: "#6b7280" }}>{s.unit}</td>
                          <td className="body-font" style={{ padding: "12px 16px", color: "#6b7280" }}>{s.reorder_level}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {low
                              ? <span className="body-font" style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>REORDER NOW</span>
                              : <span className="body-font" style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>OK</span>}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <button onClick={() => { setEditSupply({...s}); setEditSupplyQty(String(s.quantity)); setEditSupplyReorder(String(s.reorder_level)); setSupplySaveMsg(""); }} className="body-font"
                              style={{ background: "#eff6ff", color: "#1a56db", border: "1.5px solid #bfdbfe", borderRadius: 8, padding: "6px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Edit</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {[editStaff && (
        <div key="editStaff" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, width: 460, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            <h3 className="display-font" style={{ margin: "0 0 4px", color: "#030a1e", fontSize: 22, fontWeight: 900 }}>Edit Staff</h3>
            <p className="body-font" style={{ margin: "0 0 22px", color: "#9ca3af", fontSize: 14 }}>{editStaff.name} — {editStaff.department}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {[{ label: "Phone", key: "phone", val: editStaff.phone || "" }, { label: "Shift", key: "shift", val: editStaff.shift || "" }, { label: "Monthly Salary (₹)", key: "salary", val: String(editStaff.salary), full: true }].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
                  <label style={lbl}>{f.label}</label>
                  <input type="text" value={f.val} onChange={e => setEditStaff(s => s ? { ...s, [f.key]: f.key === "salary" ? parseFloat(e.target.value) || 0 : e.target.value } : s)} style={inp} />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" checked={editStaff.is_active} onChange={e => setEditStaff(s => s ? { ...s, is_active: e.target.checked } : s)} id="active" />
                <label htmlFor="active" className="body-font" style={{ fontSize: 14, color: "#374151" }}>Active Employee</label>
              </div>
            </div>
            {staffSaveMsg && <p className="body-font" style={{ color: staffSaveMsg.startsWith("✅") ? "#16a34a" : "#dc2626", fontSize: 14, margin: "0 0 14px" }}>{staffSaveMsg}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleSaveStaff} disabled={saving} className="body-font" style={{ flex: 1, background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 16, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Save Changes"}</button>
              <button onClick={() => setEditStaff(null)} className="body-font" style={{ flex: 1, background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 12, padding: 14, fontSize: 16, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      ), showAddStaff && (
        <div key="addStaff" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, width: 500, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            <h3 className="display-font" style={{ margin: "0 0 22px", color: "#030a1e", fontSize: 22, fontWeight: 900 }}>Add New Staff</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {[{ label: "Full Name *", key: "name", ph: "e.g. RAHUL SHARMA", full: true }, { label: "Phone", key: "phone", ph: "10-digit" }, { label: "Shift", key: "shift", ph: "9AM - 6PM" }, { label: "Joining Date", key: "joining_date", type: "date" }, { label: "Monthly Salary (₹)", key: "salary", ph: "15000" }].map(f => (
                <div key={f.key} style={{ gridColumn: (f as any).full ? "1 / -1" : "auto" }}>
                  <label style={lbl}>{f.label}</label>
                  <input type={(f as any).type || "text"} placeholder={(f as any).ph || ""} value={(newStaff as any)[f.key]} onChange={e => setNewStaff(n => ({ ...n, [f.key]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Department</label>
                <select value={newStaff.department} onChange={e => setNewStaff(n => ({ ...n, department: e.target.value }))} style={inp}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            {staffError && <p className="body-font" style={{ color: "#dc2626", fontSize: 14, margin: "0 0 14px" }}>{staffError}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleAddStaff} className="body-font" style={{ flex: 1, background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 16, cursor: "pointer", fontWeight: 700 }}>Add Staff</button>
              <button onClick={() => { setShowAddStaff(false); setStaffError(""); }} className="body-font" style={{ flex: 1, background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 12, padding: 14, fontSize: 16, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      ), editSupply && (
        <div key="editSupply" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, width: 420, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            <h3 className="display-font" style={{ margin: "0 0 4px", color: "#030a1e", fontSize: 22, fontWeight: 900 }}>Edit Supply</h3>
            <p className="body-font" style={{ margin: "0 0 22px", color: "#9ca3af", fontSize: 14 }}>{editSupply.name}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div><label style={lbl}>Quantity</label><input type="number" value={editSupplyQty} onChange={e => setEditSupplyQty(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Reorder Level</label><input type="number" value={editSupplyReorder} onChange={e => setEditSupplyReorder(e.target.value)} style={inp} /></div>
              <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Last Ordered</label><input type="date" value={editSupply.last_ordered || ""} onChange={e => setEditSupply(s => s ? { ...s, last_ordered: e.target.value } : s)} style={inp} /></div>
            </div>
            {supplySaveMsg && <p className="body-font" style={{ color: supplySaveMsg.startsWith("✅") ? "#16a34a" : "#dc2626", fontSize: 14, margin: "0 0 14px" }}>{supplySaveMsg}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleSaveSupply} disabled={saving} className="body-font" style={{ flex: 1, background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 16, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Save"}</button>
              <button onClick={() => setEditSupply(null)} className="body-font" style={{ flex: 1, background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 12, padding: 14, fontSize: 16, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      ), showAddSupply && (
        <div key="addSupply" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, width: 500, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            <h3 className="display-font" style={{ margin: "0 0 22px", color: "#030a1e", fontSize: 22, fontWeight: 900 }}>Add New Supply Item</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {[{ label: "Item Name *", key: "name", ph: "e.g. Bedsheets", full: true }, { label: "Quantity", key: "quantity", ph: "0" }, { label: "Unit", key: "unit", ph: "pcs / bottles" }, { label: "Reorder Level", key: "reorder_level", ph: "5" }, { label: "Notes", key: "notes", ph: "Optional", full: true }].map(f => (
                <div key={f.key} style={{ gridColumn: (f as any).full ? "1 / -1" : "auto" }}>
                  <label style={lbl}>{f.label}</label>
                  <input type="text" placeholder={(f as any).ph || ""} value={(newSupply as any)[f.key]} onChange={e => setNewSupply(n => ({ ...n, [f.key]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Category</label>
                <select value={newSupply.category} onChange={e => setNewSupply(n => ({ ...n, category: e.target.value }))} style={inp}>
                  {SUPPLY_CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {supplyError && <p className="body-font" style={{ color: "#dc2626", fontSize: 14, margin: "0 0 14px" }}>{supplyError}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleAddSupply} className="body-font" style={{ flex: 1, background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 16, cursor: "pointer", fontWeight: 700 }}>Add Item</button>
              <button onClick={() => { setShowAddSupply(false); setSupplyError(""); }} className="body-font" style={{ flex: 1, background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 12, padding: 14, fontSize: 16, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )]}
    </div>
  );
}