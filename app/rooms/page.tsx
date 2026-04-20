"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

interface Room {
  room_id: number; room_number: string; room_type: string;
  price_per_day: number; doctor_charges_per_day: number; is_occupied: boolean;
  current_patient_id: number | null; current_ipd_id: number | null;
  admitted_on: string | null; patient?: { name: string; phone: string; uhid: string };
}
interface Patient { patient_id: number; name: string; phone: string; uhid: string; }
interface MedicineUsed { pres_id: number; name: string; quantity: number; notes: string; unit_price: number; }

function buildBillHTML(bill: any): string {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const admitDate = bill.room.admitted_on ? new Date(bill.room.admitted_on).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const patientName = (bill.room.patient as any)?.name || "—";
  const uhid = (bill.room.patient as any)?.uhid || "—";
  const phone = (bill.room.patient as any)?.phone || "—";
  const medRows = bill.medicinesList?.length > 0
    ? bill.medicinesList.map((m: any, i: number) => `<tr><td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:11px;">${String(i+1).padStart(2,"0")}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:11px;">${m.name}${m.notes ? ` (${m.notes})` : ""}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:11px;text-align:center;">${m.quantity}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:11px;text-align:right;">₹${(m.unit_price||0).toFixed(2)}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:11px;text-align:right;font-weight:600;">₹${((m.unit_price||0)*m.quantity).toFixed(2)}</td></tr>`).join("")
    : `<tr><td colspan="5" style="padding:10px 8px;font-size:11px;color:#aaa;text-align:center;">No medicines recorded</td></tr>`;
  const totalInWords = (n: number) => {
    if (n===0) return "Zero";
    const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    const cv=(num:number):string=>{
      if(num<20) return ones[num];
      if(num<100) return tens[Math.floor(num/10)]+(num%10?" "+ones[num%10]:"");
      if(num<1000) return ones[Math.floor(num/100)]+" Hundred"+(num%100?" "+cv(num%100):"");
      if(num<100000) return cv(Math.floor(num/1000))+" Thousand"+(num%1000?" "+cv(num%1000):"");
      return cv(Math.floor(num/100000))+" Lakh"+(num%100000?" "+cv(num%100000):"");
    };
    return cv(Math.floor(n))+" Rupees Only";
  };
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Bill - ${patientName}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;color:#000;}@page{margin:8mm 10mm;size:A4 portrait;}body{font-family:Arial,sans-serif;font-size:11px;line-height:1.45;background:#fff;}hr{border:none;border-top:1.5px solid #000;margin:5px 0;}table{width:100%;border-collapse:collapse;}.sh{font-weight:bold;font-size:12px;text-align:center;text-decoration:underline;margin:8px 0 6px;letter-spacing:1px;}.lb{font-weight:bold;}.ab{background:#f5f5f5;border:1px solid #ccc;padding:8px 12px;text-align:right;margin-top:6px;}.fn{text-align:center;font-size:9px;color:#666;margin-top:8px;border-top:1px solid #ccc;padding-top:5px;font-style:italic;}</style></head><body>
<table style="margin-bottom:6px;"><tr><td style="width:70%;"><div style="font-size:18px;font-weight:bold;">NEEL orthopaedic SUPER SPECIALITY HOSPITAL</div><div style="font-size:10px;margin-top:2px;">1st Floor, Shrinath Apartment, Goddev Naka, B.P. Road, Bhayander East, Thane - 401105</div><div style="font-size:10px;">Ph: 7021094941 / 9594314023 | Mon–Sat: 10AM–1:15PM & 3:30–6:45PM | Sun: 10AM–1PM</div></td><td style="width:30%;text-align:right;vertical-align:top;"><div style="font-size:10px;">Date: ${today}</div><div style="font-size:10px;">Bill No: IPD-${Date.now().toString().slice(-6)}</div></td></tr></table>
<hr/><table style="margin:5px 0;"><tr><td style="width:50%;vertical-align:top;padding-right:16px;"><div><span class="lb">Patient Name:</span> ${patientName}</div><div><span class="lb">UHID:</span> ${uhid}</div><div><span class="lb">Contact:</span> ${phone}</div><div><span class="lb">Consulting Doctor:</span> Dr. G.K. Boob (DNB Ortho)</div></td><td style="width:50%;vertical-align:top;"><div><span class="lb">Admission Date:</span> ${admitDate}</div><div><span class="lb">Discharge Date:</span> ${today}</div><div><span class="lb">Duration:</span> ${bill.days} Day${bill.days>1?"s":""}</div><div><span class="lb">Room No:</span> ${bill.room.room_number} (${bill.room.room_type})</div></td></tr></table>
<hr/><div class="sh">PROVISIONAL BILL</div>
<table style="margin-bottom:8px;"><thead><tr style="background:#f0f0f0;"><th style="padding:6px 8px;text-align:left;border-bottom:1.5px solid #000;">Code</th><th style="padding:6px 8px;text-align:left;border-bottom:1.5px solid #000;">Particulars</th><th style="padding:6px 8px;text-align:right;border-bottom:1.5px solid #000;">Amount (₹)</th></tr></thead><tbody>
<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">100000</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">Room & Bed Charges — ${bill.room.room_type}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">₹${bill.roomCharges.toFixed(2)}</td></tr>
<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">200000</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">Professional / Doctor Fees — Dr. G.K. Boob</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">₹${bill.doctorCharges.toFixed(2)}</td></tr>
<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">300000</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">Pharmacy / Consumables</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">₹${bill.pharmacyCharges.toFixed(2)}</td></tr>
</tbody></table>
<div class="ab"><table style="width:280px;margin-left:auto;"><tr><td style="font-size:11px;padding:2px 0;">Total Bill Amount:</td><td style="font-size:11px;text-align:right;font-weight:bold;">₹${bill.total.toFixed(2)}</td></tr><tr><td style="font-size:11px;padding:2px 0;">Amount Payable:</td><td style="font-size:11px;text-align:right;font-weight:bold;">₹${bill.total.toFixed(2)}</td></tr><tr><td style="font-size:11px;padding:2px 0;">Amount Paid:</td><td style="font-size:11px;text-align:right;">₹0.00</td></tr><tr style="border-top:1px solid #000;"><td style="font-size:12px;padding:3px 0;font-weight:bold;">Balance:</td><td style="font-size:12px;text-align:right;font-weight:bold;">₹${bill.total.toFixed(2)}</td></tr></table>
<div style="font-size:10px;margin-top:4px;text-align:right;"><span style="font-weight:bold;">Amount in words:</span> ${totalInWords(Math.round(bill.total))}</div></div>
<hr style="margin-top:8px;"/><div class="sh">DETAILED BREAKUP</div>
<div style="font-weight:bold;font-size:11px;margin:4px 0 2px;">Pharmacy / Consumables</div>
<table style="margin-bottom:6px;"><thead><tr style="background:#f5f5f5;"><th style="padding:4px 8px;text-align:left;border-bottom:1px solid #ccc;font-size:10px;">#</th><th style="padding:4px 8px;text-align:left;border-bottom:1px solid #ccc;font-size:10px;">Item</th><th style="padding:4px 8px;text-align:center;border-bottom:1px solid #ccc;font-size:10px;">Qty</th><th style="padding:4px 8px;text-align:right;border-bottom:1px solid #ccc;font-size:10px;">Rate</th><th style="padding:4px 8px;text-align:right;border-bottom:1px solid #ccc;font-size:10px;">Amount</th></tr></thead><tbody>${medRows}</tbody></table>
<hr/><table style="margin:4px 0;"><tr style="background:#f0f4ff;"><td style="padding:8px;font-size:14px;font-weight:bold;">GRAND TOTAL</td><td style="padding:8px;font-size:16px;font-weight:800;text-align:right;">₹${bill.total.toFixed(2)}</td></tr></table>
<div style="font-size:10px;margin-top:2px;font-style:italic;">Amount in words: <strong>${totalInWords(Math.round(bill.total))}</strong></div>
<div style="display:flex;justify-content:space-between;margin-top:24px;"><div><div style="margin-bottom:28px;font-size:10px;">Patient / Attendant</div><div style="border-top:1px solid #000;width:150px;padding-top:4px;text-align:center;font-size:10px;">Signature</div></div><div style="text-align:right;"><div style="margin-bottom:28px;font-size:10px;">For Neel Orthopaedic Hospital</div><div style="border-top:1px solid #000;width:150px;padding-top:4px;text-align:center;font-size:10px;margin-left:auto;">Dr. G.K. Boob</div></div></div>
<div class="fn">This is a computer generated bill — pain to painless</div>
</body></html>`;
}

export default function RoomsPage() {
  const { user, loading: authLoading, signOut } = useAuth("/rooms");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [ipdMedicines, setIpdMedicines] = useState<{ id: number; name: string; unit_price: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showDischarge, setShowDischarge] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [showMedicines, setShowMedicines] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [bill, setBill] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [medSearch, setMedSearch] = useState("");
  const [medSuggestions, setMedSuggestions] = useState<{ id: number; name: string; unit_price: number }[]>([]);
  const [medQty, setMedQty] = useState("1");
  const [medNotes, setMedNotes] = useState("");
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);
  const [selectedMedName, setSelectedMedName] = useState("");
  const [medicinesUsed, setMedicinesUsed] = useState<MedicineUsed[]>([]);
  const [currentIpdId, setCurrentIpdId] = useState<number | null>(null);

  const fetchRooms = async () => {
    const { data } = await supabase.from("room").select("*, patient:current_patient_id (name, phone, uhid)").order("room_number");
    if (data) setRooms(data as any);
    setLoading(false);
  };
  const fetchPatients = async () => {
    const { data } = await supabase.from("patient").select("patient_id, name, phone, uhid").order("name");
    if (data) setPatients(data);
  };
  const fetchIpdMedicines = async () => {
    const { data } = await supabase.from("medicine_list").select("id, name, unit_price").eq("type", "ipd").order("name");
    if (data) setIpdMedicines(data as any);
  };
  const fetchMedicinesUsed = useCallback(async (ipdId: number) => {
    const { data: prescriptions, error } = await supabase.from("prescription").select("pres_id, quantity, notes, medicine_id").eq("ipd_id", ipdId);
    if (error || !prescriptions || prescriptions.length === 0) { setMedicinesUsed([]); return; }
    const medIds = [...new Set(prescriptions.map((p: any) => p.medicine_id))];
    const { data: medicines } = await supabase.from("medicine_list").select("id, name, unit_price").in("id", medIds);
    const medMap: Record<number, { name: string; unit_price: number }> = {};
    if (medicines) medicines.forEach((m: any) => { medMap[m.id] = { name: m.name, unit_price: m.unit_price || 0 }; });
    setMedicinesUsed(prescriptions.map((p: any) => ({ pres_id: p.pres_id, name: medMap[p.medicine_id]?.name || "Unknown", quantity: p.quantity, notes: p.notes || "", unit_price: medMap[p.medicine_id]?.unit_price || 0 })));
  }, []);

  useEffect(() => { if (user) { fetchRooms(); fetchPatients(); fetchIpdMedicines(); } }, [user]);

  const openMedicinesModal = async (room: Room) => {
    setSelectedRoom(room); setCurrentIpdId(room.current_ipd_id); setMedicinesUsed([]); setShowMedicines(true);
    if (room.current_ipd_id) await fetchMedicinesUsed(room.current_ipd_id);
  };

  const assignRoom = async () => {
    if (!selectedRoom || !selectedPatient) return;
    setSaving(true);
    const { data: ipd } = await supabase.from("ipd_record").insert({ patient_id: selectedPatient, doctor_id: 5, admit_date: new Date().toISOString().split("T")[0], room_number: selectedRoom.room_number, status: "admitted" }).select("ipd_id").single();
    if (ipd) {
      await supabase.from("room").update({ is_occupied: true, current_patient_id: selectedPatient, current_ipd_id: ipd.ipd_id, admitted_on: new Date().toISOString().split("T")[0] }).eq("room_id", selectedRoom.room_id);
      await fetchRooms(); setShowAssign(false); setSelectedPatient(null); setPatientSearch("");
      alert(`Room ${selectedRoom.room_number} assigned successfully!`);
    }
    setSaving(false);
  };

  const getMedicinesForBill = async (ipdId: number) => {
    const { data: prescriptions } = await supabase.from("prescription").select("pres_id, quantity, notes, medicine_id").eq("ipd_id", ipdId);
    if (!prescriptions || prescriptions.length === 0) return [];
    const medIds = [...new Set(prescriptions.map((p: any) => p.medicine_id))];
    const { data: medicines } = await supabase.from("medicine_list").select("id, name, unit_price").in("id", medIds);
    const medMap: Record<number, any> = {};
    if (medicines) medicines.forEach((m: any) => { medMap[m.id] = m; });
    return prescriptions.map((p: any) => ({ name: medMap[p.medicine_id]?.name || "Unknown", quantity: p.quantity, notes: p.notes || "", unit_price: medMap[p.medicine_id]?.unit_price || 0 }));
  };

  const calculateBill = async (room: Room) => {
    if (!room.admitted_on) return;
    const days = Math.max(1, Math.ceil((new Date().getTime() - new Date(room.admitted_on).getTime()) / (1000 * 60 * 60 * 24)));
    const roomCharges = room.price_per_day * days;
    const doctorCharges = room.doctor_charges_per_day * days;
    const medicinesList = room.current_ipd_id ? await getMedicinesForBill(room.current_ipd_id) : [];
    const pharmacyCharges = medicinesList.reduce((sum: number, m: any) => sum + ((m.unit_price||0) * m.quantity), 0);
    setBill({ room, days, roomCharges, doctorCharges, pharmacyCharges, total: roomCharges + doctorCharges + pharmacyCharges, medicinesList });
    setShowBill(true);
  };

  const handlePrintBill = () => {
    if (!bill) return;
    const pw = window.open("", "_blank", "width=794,height=600,scrollbars=no");
    if (!pw) { alert("Please allow popups to print."); return; }
    pw.document.write(buildBillHTML(bill)); pw.document.close(); pw.focus();
    pw.onload = () => { const h = pw.document.body.scrollHeight; pw.resizeTo(794, h + 40); setTimeout(() => { pw.print(); pw.close(); }, 600); };
    setTimeout(() => { try { pw.print(); pw.close(); } catch (e) {} }, 1800);
  };

  const handleMedSearch = (val: string) => {
    setMedSearch(val); setSelectedMedId(null); setSelectedMedName("");
    if (val.length < 2) { setMedSuggestions([]); return; }
    setMedSuggestions(ipdMedicines.filter(m => m.name.toLowerCase().includes(val.toLowerCase())).slice(0, 10));
  };

  const addMedicineToPatient = async () => {
    const ipdId = currentIpdId;
    if (!ipdId || !selectedMedId || saving) return;
    setSaving(true);
    const { error } = await supabase.from("prescription").insert({ ipd_id: ipdId, medicine_id: selectedMedId, quantity: parseInt(medQty) || 1, notes: medNotes || null, prescribed_date: new Date().toISOString().split("T")[0] });
    if (!error) { setMedSearch(""); setMedSuggestions([]); setSelectedMedId(null); setSelectedMedName(""); setMedQty("1"); setMedNotes(""); await fetchMedicinesUsed(ipdId); }
    else alert("Error: " + error.message);
    setSaving(false);
  };

  const removeMedicine = async (presId: number) => {
    await supabase.from("prescription").delete().eq("pres_id", presId);
    if (currentIpdId) await fetchMedicinesUsed(currentIpdId);
  };

  const dischargePatient = async () => {
    if (!selectedRoom) return;
    setSaving(true);
    await supabase.from("ipd_record").update({ status: "discharged", discharge_date: new Date().toISOString().split("T")[0] }).eq("ipd_id", selectedRoom.current_ipd_id);
    await supabase.from("discharge").insert({ ipd_id: selectedRoom.current_ipd_id, discharge_date: new Date().toISOString().split("T")[0], discharge_summary: "Patient discharged from room " + selectedRoom.room_number });
    if (bill) await supabase.from("bill").insert({ patient_id: selectedRoom.current_patient_id, ipd_id: selectedRoom.current_ipd_id, ipd_charges: bill.roomCharges + bill.doctorCharges, pharmacy_charges: bill.pharmacyCharges, total_amount: bill.total, paid_status: "unpaid" });
    await supabase.from("room").update({ is_occupied: false, current_patient_id: null, current_ipd_id: null, admitted_on: null }).eq("room_id", selectedRoom.room_id);
    await fetchRooms(); setShowDischarge(false); setShowBill(false); setBill(null); setSelectedRoom(null); setCurrentIpdId(null);
    alert("Patient discharged and bill generated!");
    setSaving(false);
  };

  const filteredRooms = rooms.filter(r => { if (filter === "available") return !r.is_occupied; if (filter === "occupied") return r.is_occupied; if (filter === "icu") return r.room_type === "ICU"; return true; });
  const stats = { total: rooms.length, occupied: rooms.filter(r => r.is_occupied).length, available: rooms.filter(r => !r.is_occupied).length, icu: rooms.filter(r => r.room_type === "ICU" && r.is_occupied).length };
  const getRoomColor = (r: Room) => r.room_type === "ICU" ? (r.is_occupied ? "#fee2e2" : "#fef3c7") : (r.is_occupied ? "#fef2f2" : "#f0fdf4");
  const getRoomBorder = (r: Room) => r.room_type === "ICU" ? (r.is_occupied ? "#fca5a5" : "#fde68a") : (r.is_occupied ? "#fca5a5" : "#bbf7d0");
  const getDaysSince = (d: string) => Math.ceil((new Date().getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));

  if (authLoading || !user) return <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", color: "#0a2463", fontSize: 18 }}>Loading…</div>;

  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", border: "1.5px solid #e0e7ff", borderRadius: 10, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "'Inter',sans-serif", background: "#fff", color: "#030a1e" };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        input,select,textarea{color:#030a1e!important;font-size:15px!important;font-family:'Inter',sans-serif!important;}
        input::placeholder,textarea::placeholder{color:#9ca3af!important;}
        input:focus,select:focus,textarea:focus{border-color:#1a56db!important;outline:none!important;}
        button{font-family:'Inter',sans-serif!important;}
      `}</style>
      <StaffNavbar user={user} onSignOut={signOut} />

      <div style={{ padding: "24px 5%" }}>
        {/* Gradient stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Rooms", value: stats.total, bg: "linear-gradient(135deg,#0f2d6b,#1a56db)" },
            { label: "Occupied", value: stats.occupied, bg: "linear-gradient(135deg,#7f1d1d,#ef4444)" },
            { label: "Available", value: stats.available, bg: "linear-gradient(135deg,#064e3b,#10b981)" },
            { label: "ICU Occupied", value: stats.icu, bg: "linear-gradient(135deg,#92400e,#f59e0b)" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: "16px", padding: "22px 24px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", color: "white" }}>
              <div style={{ fontSize: "14px", opacity: 0.75, marginBottom: "8px", fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: "40px", fontWeight: "900", fontFamily: "'Playfair Display',serif", letterSpacing: "-2px", lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {[{ key: "all", label: "All Rooms" }, { key: "available", label: "Available" }, { key: "occupied", label: "Occupied" }, { key: "icu", label: "ICU" }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: "10px 22px", borderRadius: "10px", border: "none", background: filter === f.key ? "linear-gradient(135deg,#0f2d6b,#1a56db)" : "white", color: filter === f.key ? "white" : "#666", fontWeight: "700", fontSize: "15px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.2s" }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: "center", padding: "60px", color: "#666", fontSize: 15 }}>Loading rooms...</div> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {filteredRooms.map(room => (
              <div key={room.room_id} style={{ background: getRoomColor(room), borderRadius: "16px", padding: "24px", border: `2px solid ${getRoomBorder(room)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#030a1e", fontFamily: "'Playfair Display',serif" }}>Room {room.room_number}</div>
                    <div style={{ fontSize: "14px", color: "#666", marginTop: "2px" }}>{room.room_type}</div>
                  </div>
                  <div style={{ padding: "5px 13px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", background: room.is_occupied ? "#fee2e2" : "#dcfce7", color: room.is_occupied ? "#dc2626" : "#16a34a", border: `1px solid ${room.is_occupied ? "#fca5a5" : "#bbf7d0"}` }}>
                    {room.is_occupied ? "Occupied" : "Available"}
                  </div>
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>₹{room.price_per_day.toLocaleString()}/day + ₹{room.doctor_charges_per_day.toLocaleString()} doctor</div>
                {room.is_occupied && room.patient && (
                  <div style={{ background: "white", borderRadius: "10px", padding: "12px", marginBottom: "12px", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: "800", color: "#030a1e", fontSize: "16px" }}>{(room.patient as any).name}</div>
                    <div style={{ color: "#666", fontSize: "13px", marginTop: "2px" }}>UHID: {(room.patient as any).uhid || "Not assigned"}</div>
                    {room.admitted_on && <div style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>Day {getDaysSince(room.admitted_on)} · Admitted {new Date(room.admitted_on).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>}
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {!room.is_occupied ? (
                    <button onClick={() => { setSelectedRoom(room); setShowAssign(true); }}
                      style={{ flex: 1, background: "linear-gradient(135deg,#0f2d6b,#1a56db)", color: "white", border: "none", padding: "11px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Assign Patient</button>
                  ) : (
                    <>
                      <button onClick={() => openMedicinesModal(room)} style={{ flex: 1, background: "linear-gradient(135deg,#1e1b4b,#7c3aed)", color: "white", border: "none", padding: "11px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>💊 Medicines</button>
                      <button onClick={() => { setSelectedRoom(room); calculateBill(room); }} style={{ flex: 1, background: "linear-gradient(135deg,#0c4a6e,#1a73e8)", color: "white", border: "none", padding: "11px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>View Bill</button>
                      <button onClick={() => { setSelectedRoom(room); calculateBill(room); setShowDischarge(true); }} style={{ width: "100%", background: "linear-gradient(135deg,#7f1d1d,#ef4444)", color: "white", border: "none", padding: "11px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "4px" }}>Discharge</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ASSIGN MODAL */}
      {showAssign && selectedRoom && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ color: "#030a1e", fontSize: "22px", marginBottom: "6px", fontWeight: 900, fontFamily: "'Playfair Display',serif" }}>Assign Patient to Room {selectedRoom.room_number}</h3>
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "24px" }}>{selectedRoom.room_type} · ₹{selectedRoom.price_per_day}/day</p>
            <input type="text" placeholder="Search by name or phone..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} style={{ ...inp, marginBottom: "12px" }} />
            <div style={{ maxHeight: "280px", overflowY: "auto", border: "1.5px solid #e0e7ff", borderRadius: "12px", marginBottom: "20px" }}>
              {patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch)).map(p => (
                <div key={p.patient_id} onClick={() => setSelectedPatient(p.patient_id)}
                  style={{ padding: "13px 16px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", background: selectedPatient === p.patient_id ? "#eff6ff" : "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "700", color: "#030a1e", fontSize: "15px" }}>{p.name}</div>
                    <div style={{ color: "#888", fontSize: "13px" }}>{p.phone} {p.uhid ? `· ${p.uhid}` : ""}</div>
                  </div>
                  {selectedPatient === p.patient_id && <div style={{ color: "#1a73e8", fontWeight: "800", fontSize: 18 }}>✓</div>}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => { setShowAssign(false); setSelectedPatient(null); setPatientSearch(""); }} style={{ flex: 1, background: "#f0f4ff", color: "#030a1e", border: "none", padding: "13px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={assignRoom} disabled={saving || !selectedPatient} style={{ flex: 1, background: saving || !selectedPatient ? "#94a3b8" : "linear-gradient(135deg,#0f2d6b,#1a56db)", color: "white", border: "none", padding: "13px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: saving || !selectedPatient ? "not-allowed" : "pointer" }}>
                {saving ? "Assigning..." : "Assign Room →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDICINES MODAL */}
      {showMedicines && selectedRoom && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "560px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ color: "#030a1e", fontSize: "22px", marginBottom: "4px", fontWeight: 900, fontFamily: "'Playfair Display',serif" }}>💊 Medicines Given</h3>
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "20px" }}>Room {selectedRoom.room_number} · {(selectedRoom.patient as any)?.name}</p>
            <div style={{ background: "#f8f9fc", borderRadius: "12px", padding: "16px", marginBottom: "20px", border: "1px solid #e8edf5" }}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#030a1e", marginBottom: "12px" }}>Add Medicine</div>
              <div style={{ position: "relative", marginBottom: "10px" }}>
                <input value={medSearch} onChange={e => handleMedSearch(e.target.value)} placeholder="Type 2+ letters to search..." style={inp} />
                {selectedMedName && <div style={{ fontSize: "13px", color: "#16a34a", marginTop: "4px", fontWeight: "600" }}>✓ {selectedMedName}</div>}
                {medSuggestions.length > 0 && !selectedMedId && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", borderRadius: "10px", border: "1.5px solid #e0e7ff", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, maxHeight: "180px", overflowY: "auto" }}>
                    {medSuggestions.map(m => (
                      <div key={m.id} onClick={() => { setSelectedMedId(m.id); setSelectedMedName(m.name); setMedSearch(m.name); setMedSuggestions([]); }}
                        style={{ padding: "11px 16px", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#eff6ff"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "white"}>
                        <span>{m.name}</span><span style={{ color: "#888", fontSize: "12px" }}>₹{m.unit_price || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "#374151", display: "block", marginBottom: "5px", fontWeight: 600 }}>Qty</label>
                  <input type="number" value={medQty} onChange={e => setMedQty(e.target.value)} min="1" style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "#374151", display: "block", marginBottom: "5px", fontWeight: 600 }}>Notes (optional)</label>
                  <input value={medNotes} onChange={e => setMedNotes(e.target.value)} placeholder="e.g. IV, oral..." style={inp} />
                </div>
              </div>
              <button onClick={addMedicineToPatient} disabled={saving || !selectedMedId}
                style={{ width: "100%", padding: "11px", background: saving || !selectedMedId ? "#94a3b8" : "linear-gradient(135deg,#1e1b4b,#7c3aed)", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: saving || !selectedMedId ? "not-allowed" : "pointer" }}>
                {saving ? "Adding..." : "+ Add Medicine"}
              </button>
            </div>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#374151", marginBottom: "10px" }}>Medicines Given ({medicinesUsed.length})</div>
            {medicinesUsed.length === 0 ? <div style={{ color: "#999", fontSize: "14px", textAlign: "center", padding: "20px" }}>No medicines added yet</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {medicinesUsed.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: "#f8f9fc", borderRadius: "10px", border: "1px solid #e8edf5" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "#030a1e", fontSize: "15px" }}>{m.name}</div>
                      <div style={{ color: "#888", fontSize: "13px" }}>Qty: {m.quantity} · ₹{m.unit_price} each = <strong style={{ color: "#030a1e" }}>₹{(m.unit_price * m.quantity).toFixed(2)}</strong>{m.notes ? ` · ${m.notes}` : ""}</div>
                    </div>
                    <button onClick={() => removeMedicine(m.pres_id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontWeight: 700 }}>Remove</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setShowMedicines(false); setMedSearch(""); setMedSuggestions([]); setSelectedMedId(null); setSelectedMedName(""); setMedicinesUsed([]); }}
              style={{ width: "100%", background: "#f0f4ff", color: "#030a1e", border: "none", padding: "13px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}

      {/* BILL MODAL */}
      {showBill && bill && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ color: "#030a1e", fontSize: "22px", marginBottom: "4px", fontWeight: 900, fontFamily: "'Playfair Display',serif" }}>Bill Summary</h3>
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "24px" }}>Room {bill.room.room_number} · {bill.days} day{bill.days > 1 ? "s" : ""}</p>
            {[
              { label: `Room charges (₹${bill.room.price_per_day.toLocaleString()} × ${bill.days} days)`, amount: bill.roomCharges },
              { label: `Doctor charges (₹${bill.room.doctor_charges_per_day.toLocaleString()} × ${bill.days} days)`, amount: bill.doctorCharges },
              { label: `Pharmacy / Medicines (${bill.medicinesList?.length || 0} items)`, amount: bill.pharmacyCharges },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#555", fontSize: "15px" }}>{item.label}</span>
                <span style={{ fontWeight: "700", color: "#030a1e", fontSize: "15px" }}>₹{item.amount.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderTop: "2px solid #030a1e", marginTop: "8px" }}>
              <span style={{ fontWeight: "900", color: "#030a1e", fontSize: "20px", fontFamily: "'Playfair Display',serif" }}>Total</span>
              <span style={{ fontWeight: "900", color: "#030a1e", fontSize: "26px", fontFamily: "'Playfair Display',serif", letterSpacing: "-1px" }}>₹{bill.total.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
              <button onClick={() => { setShowBill(false); setShowDischarge(false); setBill(null); }} style={{ flex: 1, background: "#f0f4ff", color: "#030a1e", border: "none", padding: "13px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>Close</button>
              <button onClick={handlePrintBill} style={{ flex: 1, background: "white", color: "#030a1e", border: "2px solid #030a1e", padding: "13px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>🖨️ Print Bill</button>
              {showDischarge && (
                <button onClick={dischargePatient} disabled={saving} style={{ width: "100%", background: saving ? "#94a3b8" : "linear-gradient(135deg,#7f1d1d,#ef4444)", color: "white", border: "none", padding: "13px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Processing..." : "Confirm Discharge"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}