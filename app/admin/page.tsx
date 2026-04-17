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
  staff_id: number;
  name: string;
  department: string;
  phone: string | null;
  shift: string | null;
  joining_date: string | null;
  salary: number;
  is_active: boolean;
}

interface Leave {
  leave_id: number;
  staff_id: number;
  leave_date: string;
  leave_type: string;
  approved: boolean;
  note: string | null;
  staff?: { name: string; department: string };
}

interface Supply {
  supply_id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  last_ordered: string | null;
  notes: string | null;
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
      name: newStaff.name.trim().toUpperCase(),
      department: newStaff.department,
      phone: newStaff.phone.trim() || null,
      shift: newStaff.shift.trim() || null,
      joining_date: newStaff.joining_date || null,
      salary: parseFloat(newStaff.salary) || 0,
    });
    if (error) { setStaffError("Failed: " + error.message); }
    else { setShowAddStaff(false); setNewStaff({ name: "", department: "OPD", phone: "", shift: "9AM - 6PM", joining_date: "", salary: "" }); await fetchAll(); }
  };

  const handleSaveStaff = async () => {
    if (!editStaff) return;
    setSaving(true); setStaffSaveMsg("");
    const { error } = await supabase.from("staff").update({
      phone: editStaff.phone, shift: editStaff.shift,
      salary: editStaff.salary, is_active: editStaff.is_active,
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
    const conflict = leaves.find(l =>
      l.leave_date === leaveDate &&
      l.staff?.department === staffMember.department &&
      l.staff_id !== parseInt(leaveStaffId)
    );
    if (conflict) { setLeaveError(`⚠️ ${conflict.staff?.name} from ${staffMember.department} already has leave on ${leaveDate}.`); return; }
    const dup = leaves.find(l => l.staff_id === parseInt(leaveStaffId) && l.leave_date === leaveDate);
    if (dup) { setLeaveError("Leave already marked for this date."); return; }
    const { error } = await supabase.from("staff_leave").insert({
      staff_id: parseInt(leaveStaffId), leave_date: leaveDate,
      leave_type: leaveType, approved: true, note: leaveNote.trim() || null,
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
      quantity: parseInt(editSupplyQty) || 0,
      reorder_level: parseInt(editSupplyReorder) || 5,
      last_ordered: editSupply.last_ordered,
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
    const matchMonth = d.getMonth() === leaveMonthFilter && d.getFullYear() === leaveYearFilter;
    const matchDept = leaveDeptFilter === "All" || l.staff?.department === leaveDeptFilter;
    return matchMonth && matchDept;
  });

  const filteredSupplies = supplies.filter(s => {
    const matchCat = supplyCategory === "All" || s.category === supplyCategory;
    const matchSearch = !supplySearch || s.name.toLowerCase().includes(supplySearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowSupplies = supplies.filter(s => s.quantity <= s.reorder_level);

  const getSalaryData = () => {
    const daysInMonth = getMonthDays(salaryYear, salaryMonth);
    const perDaySalary = (salary: number) => salary / daysInMonth;
    return staff.filter(s => s.is_active && (salaryDept === "All" || s.department === salaryDept)).map(s => {
      const leavesThisMonth = leaves.filter(l => {
        const d = new Date(l.leave_date);
        return l.staff_id === s.staff_id && d.getMonth() === salaryMonth && d.getFullYear() === salaryYear;
      });
      const totalLeaves = leavesThisMonth.length;
      const extraLeaves = Math.max(0, totalLeaves - 4);
      const deduction = extraLeaves * perDaySalary(s.salary);
      const net = s.salary - deduction;
      return { ...s, totalLeaves, extraLeaves, deduction, net };
    });
  };

  const salaryData = getSalaryData();
  const totalPayroll = salaryData.reduce((sum, s) => sum + s.net, 0);

  const buildSupplyAlert = () => {
    const items = lowSupplies.map(s => `• ${s.name} — ${s.quantity} ${s.unit} left (reorder at ${s.reorder_level})`).join("\n");
    return `🏥 *Neel Orthopaedic Hospital — Supply Alert*\n\nThe following items need to be restocked:\n\n${items}\n\nPlease arrange for reorder at the earliest.\n\n— Admin System`;
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const inp = { width: "100%", padding: "10px 14px", border: "1.5px solid #dbeafe", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "Georgia, serif", background: "#fff" };
  const lbl = { display: "block" as const, fontSize: 12, color: "#555", marginBottom: 5, fontWeight: 600 as const };

  if (authLoading || !user) {
    return <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", color: "#0a2463" }}>Loading…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>
      <StaffNavbar user={user} onSignOut={signOut} />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>
        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Staff", value: staff.filter(s => s.is_active).length, color: "#0a2463", icon: "👥" },
            { label: "Leaves This Month", value: leaves.filter(l => { const d = new Date(l.leave_date); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).length, color: "#d97706", icon: "📅" },
            { label: "Monthly Payroll", value: `₹${staff.filter(s=>s.is_active).reduce((sum,s)=>sum+s.salary,0).toLocaleString()}`, color: "#16a34a", icon: "💰" },
            { label: "Total Supplies", value: supplies.length, color: "#6d28d9", icon: "📦" },
            { label: "Low Stock Supplies", value: lowSupplies.length, color: "#dc2626", icon: "⚠️" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(10,36,99,0.07)", borderTop: `4px solid ${s.color}` }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: typeof s.value === "string" ? 18 : 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {lowSupplies.length > 0 && (
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ color: "#dc2626", fontWeight: 600, fontSize: 14 }}>⚠️ {lowSupplies.length} supplies need restocking</span>
            <a href={waLink(MOM_PHONE, buildSupplyAlert())} target="_blank" rel="noreferrer"
              style={{ background: "#25D366", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700 }}>
              💬 WhatsApp Alert to Mom
            </a>
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(10,36,99,0.07)" }}>
          <div style={{ display: "flex", borderBottom: "2px solid #e8eef8", padding: "0 16px", overflowX: "auto" }}>
            {([
              { key: "staff", label: `👥 Staff (${staff.filter(s=>s.is_active).length})` },
              { key: "leaves", label: "📅 Leaves & Attendance" },
              { key: "salary", label: "💰 Salary Summary" },
              { key: "supplies", label: `📦 Hospital Supplies (${supplies.length})` },
            ] as { key: TabType; label: string }[]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: "16px 20px", border: "none", background: "transparent", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: activeTab === t.key ? 700 : 400, color: activeTab === t.key ? "#0a2463" : "#666", borderBottom: activeTab === t.key ? "3px solid #0a2463" : "3px solid transparent", cursor: "pointer", marginBottom: -2, whiteSpace: "nowrap" }}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "staff" && (
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <input type="text" placeholder="🔍 Search name or phone..." value={staffSearch} onChange={e => setStaffSearch(e.target.value)} style={{ ...inp, flex: 1, minWidth: 200 }} />
                <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ ...inp, width: "auto" }}>
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button onClick={() => setShowAddStaff(true)} style={{ background: "#1a73e8", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 600 }}>+ Add Staff</button>
              </div>
              {DEPARTMENTS.filter(d => deptFilter === "All" || d === deptFilter).map(dept => {
                const deptStaff = filteredStaff.filter(s => s.department === dept);
                if (deptStaff.length === 0) return null;
                return (
                  <div key={dept} style={{ marginBottom: 24 }}>
                    <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: "#0a2463", fontSize: 15 }}>{dept}</span>
                      <span style={{ fontSize: 12, color: "#888" }}>{deptStaff.length} staff</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "#f8faff" }}>
                            {["Name", "Phone", "Shift", "Joining Date", "Monthly Salary", "Action"].map(h => (
                              <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#0a2463", fontWeight: 700, borderBottom: "2px solid #e8eef8" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {deptStaff.map((s, idx) => (
                            <tr key={s.staff_id} style={{ background: idx % 2 === 0 ? "#fff" : "#f8faff" }}>
                              <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0a2463" }}>{s.name}</td>
                              <td style={{ padding: "10px 14px", color: "#555" }}>{s.phone || "—"}</td>
                              <td style={{ padding: "10px 14px", color: "#555" }}>{s.shift || "—"}</td>
                              <td style={{ padding: "10px 14px", color: "#555" }}>{s.joining_date || "Senior Staff"}</td>
                              <td style={{ padding: "10px 14px", fontWeight: 600, color: "#16a34a" }}>₹{s.salary.toLocaleString()}</td>
                              <td style={{ padding: "10px 14px" }}>
                                <button onClick={() => { setEditStaff({ ...s }); setStaffSaveMsg(""); }}
                                  style={{ background: "#0a2463", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>Edit</button>
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

          {activeTab === "leaves" && (
            <div style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
                <div style={{ background: "#f8faff", borderRadius: 12, padding: 20, border: "1px solid #e8eef8" }}>
                  <h3 style={{ margin: "0 0 16px", color: "#0a2463", fontSize: 16 }}>Mark Leave</h3>
                  <div style={{ marginBottom: 14 }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={lbl}>Date *</label>
                      <input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} style={inp} />
                    </div>
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
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>Note (optional)</label>
                    <input type="text" value={leaveNote} onChange={e => setLeaveNote(e.target.value)} placeholder="Reason..." style={inp} />
                  </div>
                  {leaveError && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 10px", background: "#fff1f2", padding: "8px 12px", borderRadius: 6 }}>{leaveError}</p>}
                  {leaveSuccess && <p style={{ color: "#16a34a", fontSize: 13, margin: "0 0 10px" }}>{leaveSuccess}</p>}
                  <button onClick={handleMarkLeave} style={{ background: "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 600 }}>Mark Leave</button>
                </div>
                <div style={{ background: "#f8faff", borderRadius: 12, padding: 20, border: "1px solid #e8eef8" }}>
                  <h3 style={{ margin: "0 0 16px", color: "#0a2463", fontSize: 16 }}>Today's Leave Status</h3>
                  {DEPARTMENTS.map(dept => {
                    const today = new Date().toISOString().split("T")[0];
                    const onLeave = leaves.filter(l => l.leave_date === today && l.staff?.department === dept);
                    return (
                      <div key={dept} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e8eef8", fontSize: 13 }}>
                        <span style={{ color: "#333", fontWeight: 600 }}>{dept}</span>
                        {onLeave.length > 0
                          ? <span style={{ color: "#dc2626", fontWeight: 600 }}>⚠️ {onLeave.map(l => l.staff?.name).join(", ")} on leave</span>
                          : <span style={{ color: "#16a34a" }}>✅ All present</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "#0a2463" }}>Leave History:</span>
                <select value={leaveMonthFilter} onChange={e => setLeaveMonthFilter(parseInt(e.target.value))} style={{ ...inp, width: "auto" }}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={leaveYearFilter} onChange={e => setLeaveYearFilter(parseInt(e.target.value))} style={{ ...inp, width: "auto" }}>
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={leaveDeptFilter} onChange={e => setLeaveDeptFilter(e.target.value)} style={{ ...inp, width: "auto" }}>
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8faff" }}>
                      {["Staff Name", "Department", "Date", "Type", "Note", "Action"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#0a2463", fontWeight: 700, borderBottom: "2px solid #e8eef8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>No leaves found for this period.</td></tr>
                    ) : filteredLeaves.map((l, idx) => (
                      <tr key={l.leave_id} style={{ background: idx % 2 === 0 ? "#fff" : "#f8faff" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0a2463" }}>{l.staff?.name || "—"}</td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>{l.staff?.department || "—"}</td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>{l.leave_date}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ background: l.leave_type === "weekly_off" ? "#dbeafe" : "#fee2e2", color: l.leave_type === "weekly_off" ? "#1e40af" : "#dc2626", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                            {l.leave_type.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#888", fontSize: 12 }}>{l.note || "—"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <button onClick={() => handleDeleteLeave(l.leave_id)}
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "salary" && (
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "#0a2463" }}>Month:</span>
                <select value={salaryMonth} onChange={e => setSalaryMonth(parseInt(e.target.value))} style={{ ...inp, width: "auto" }}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={salaryYear} onChange={e => setSalaryYear(parseInt(e.target.value))} style={{ ...inp, width: "auto" }}>
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={salaryDept} onChange={e => setSalaryDept(e.target.value)} style={{ ...inp, width: "auto" }}>
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div style={{ marginLeft: "auto", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 20px", fontWeight: 700, color: "#16a34a", fontSize: 15 }}>
                  Total Payroll: ₹{totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8faff" }}>
                      {["Name", "Department", "Base Salary", "Leaves Taken", "Allowed (4)", "Extra Leaves", "Deduction", "Net Payable"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#0a2463", fontWeight: 700, borderBottom: "2px solid #e8eef8", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {salaryData.map((s, idx) => (
                      <tr key={s.staff_id} style={{ background: s.extraLeaves > 0 ? "#fff7ed" : idx % 2 === 0 ? "#fff" : "#f8faff" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0a2463" }}>{s.name}</td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>{s.department}</td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>₹{s.salary.toLocaleString()}</td>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: s.totalLeaves > 4 ? "#dc2626" : "#333" }}>{s.totalLeaves}</td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>4</td>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: s.extraLeaves > 0 ? "#dc2626" : "#16a34a" }}>{s.extraLeaves}</td>
                        <td style={{ padding: "10px 14px", color: s.deduction > 0 ? "#dc2626" : "#888" }}>{s.deduction > 0 ? `−₹${s.deduction.toFixed(0)}` : "—"}</td>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: "#16a34a", fontSize: 14 }}>₹{s.net.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "supplies" && (
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <input type="text" placeholder="🔍 Search supplies..." value={supplySearch} onChange={e => setSupplySearch(e.target.value)} style={{ ...inp, flex: 1, minWidth: 200 }} />
                <select value={supplyCategory} onChange={e => setSupplyCategory(e.target.value)} style={{ ...inp, width: "auto" }}>
                  {SUPPLY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => setShowAddSupply(true)} style={{ background: "#1a73e8", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 600 }}>+ Add Item</button>
                {lowSupplies.length > 0 && (
                  <a href={waLink(MOM_PHONE, buildSupplyAlert())} target="_blank" rel="noreferrer"
                    style={{ background: "#25D366", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    💬 Alert Mom ({lowSupplies.length} low)
                  </a>
                )}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8faff" }}>
                      {["Item Name", "Category", "Quantity", "Unit", "Reorder At", "Status", "Action"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#0a2463", fontWeight: 700, borderBottom: "2px solid #e8eef8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSupplies.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>No supplies found.</td></tr>
                    ) : filteredSupplies.map((s, idx) => {
                      const low = s.quantity <= s.reorder_level;
                      return (
                        <tr key={s.supply_id} style={{ background: low ? "#fff7ed" : idx % 2 === 0 ? "#fff" : "#f8faff" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0a2463" }}>{s.name}</td>
                          <td style={{ padding: "10px 14px" }}><span style={{ background: "#f0f4ff", color: "#0a2463", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{s.category}</span></td>
                          <td style={{ padding: "10px 14px", fontWeight: 700, color: low ? "#dc2626" : "#16a34a", fontSize: 15 }}>{s.quantity}</td>
                          <td style={{ padding: "10px 14px", color: "#555" }}>{s.unit}</td>
                          <td style={{ padding: "10px 14px", color: "#555" }}>{s.reorder_level}</td>
                          <td style={{ padding: "10px 14px" }}>
                            {low ? <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>REORDER NOW</span>
                              : <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>OK</span>}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <button onClick={() => { setEditSupply({ ...s }); setEditSupplyQty(String(s.quantity)); setEditSupplyReorder(String(s.reorder_level)); setSupplySaveMsg(""); }}
                              style={{ background: "#0a2463", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>Edit</button>
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

      {/* Edit Staff Modal */}
      {editStaff && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "Georgia, serif" }}>
            <h3 style={{ margin: "0 0 4px", color: "#0a2463" }}>Edit Staff</h3>
            <p style={{ margin: "0 0 20px", color: "#888", fontSize: 13 }}>{editStaff.name} — {editStaff.department}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {[
                { label: "Phone", value: editStaff.phone || "", key: "phone" },
                { label: "Shift", value: editStaff.shift || "", key: "shift" },
                { label: "Monthly Salary (₹)", value: String(editStaff.salary), key: "salary" },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.key === "salary" ? "1 / -1" : "auto" }}>
                  <label style={lbl}>{f.label}</label>
                  <input type="text" value={f.value}
                    onChange={e => setEditStaff(s => s ? { ...s, [f.key]: f.key === "salary" ? parseFloat(e.target.value) || 0 : e.target.value } : s)}
                    style={inp} />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" checked={editStaff.is_active} onChange={e => setEditStaff(s => s ? { ...s, is_active: e.target.checked } : s)} id="active" />
                <label htmlFor="active" style={{ fontSize: 13, color: "#555" }}>Active</label>
              </div>
            </div>
            {staffSaveMsg && <p style={{ color: staffSaveMsg.startsWith("✅") ? "#16a34a" : "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{staffSaveMsg}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleSaveStaff} disabled={saving} style={{ flex: 1, background: "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 600 }}>{saving ? "Saving…" : "Save Changes"}</button>
              <button onClick={() => setEditStaff(null)} style={{ flex: 1, background: "#f1f5f9", color: "#333", border: "none", borderRadius: 8, padding: 12, fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "Georgia, serif" }}>
            <h3 style={{ margin: "0 0 20px", color: "#0a2463" }}>Add New Staff</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {[
                { label: "Full Name *", key: "name", ph: "e.g. RAHUL SHARMA", full: true },
                { label: "Phone", key: "phone", ph: "10-digit number" },
                { label: "Shift", key: "shift", ph: "e.g. 9AM - 6PM" },
                { label: "Joining Date", key: "joining_date", ph: "", type: "date" },
                { label: "Monthly Salary (₹)", key: "salary", ph: "e.g. 15000" },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
                  <label style={lbl}>{f.label}</label>
                  <input type={f.type || "text"} placeholder={f.ph} value={(newStaff as any)[f.key]}
                    onChange={e => setNewStaff(n => ({ ...n, [f.key]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Department</label>
                <select value={newStaff.department} onChange={e => setNewStaff(n => ({ ...n, department: e.target.value }))} style={inp}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            {staffError && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{staffError}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleAddStaff} style={{ flex: 1, background: "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 600 }}>Add Staff</button>
              <button onClick={() => { setShowAddStaff(false); setStaffError(""); }} style={{ flex: 1, background: "#f1f5f9", color: "#333", border: "none", borderRadius: 8, padding: 12, fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supply Modal */}
      {editSupply && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "Georgia, serif" }}>
            <h3 style={{ margin: "0 0 4px", color: "#0a2463" }}>Edit Supply</h3>
            <p style={{ margin: "0 0 20px", color: "#888", fontSize: 13 }}>{editSupply.name}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div><label style={lbl}>Quantity</label><input type="number" value={editSupplyQty} onChange={e => setEditSupplyQty(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Reorder Level</label><input type="number" value={editSupplyReorder} onChange={e => setEditSupplyReorder(e.target.value)} style={inp} /></div>
              <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Last Ordered</label><input type="date" value={editSupply.last_ordered || ""} onChange={e => setEditSupply(s => s ? { ...s, last_ordered: e.target.value } : s)} style={inp} /></div>
            </div>
            {supplySaveMsg && <p style={{ color: supplySaveMsg.startsWith("✅") ? "#16a34a" : "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{supplySaveMsg}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleSaveSupply} disabled={saving} style={{ flex: 1, background: "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 600 }}>{saving ? "Saving…" : "Save"}</button>
              <button onClick={() => setEditSupply(null)} style={{ flex: 1, background: "#f1f5f9", color: "#333", border: "none", borderRadius: 8, padding: 12, fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supply Modal */}
      {showAddSupply && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "Georgia, serif" }}>
            <h3 style={{ margin: "0 0 20px", color: "#0a2463" }}>Add New Supply Item</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {[
                { label: "Item Name *", key: "name", ph: "e.g. Bedsheets", full: true },
                { label: "Quantity", key: "quantity", ph: "0" },
                { label: "Unit", key: "unit", ph: "pcs / bottles" },
                { label: "Reorder Level", key: "reorder_level", ph: "5" },
                { label: "Notes", key: "notes", ph: "Optional", full: true },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
                  <label style={lbl}>{f.label}</label>
                  <input type="text" placeholder={f.ph} value={(newSupply as any)[f.key]}
                    onChange={e => setNewSupply(n => ({ ...n, [f.key]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Category</label>
                <select value={newSupply.category} onChange={e => setNewSupply(n => ({ ...n, category: e.target.value }))} style={inp}>
                  {SUPPLY_CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {supplyError && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{supplyError}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleAddSupply} style={{ flex: 1, background: "#0a2463", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 600 }}>Add Item</button>
              <button onClick={() => { setShowAddSupply(false); setSupplyError(""); }} style={{ flex: 1, background: "#f1f5f9", color: "#333", border: "none", borderRadius: 8, padding: 12, fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}