"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Room {
  room_id: number;
  room_number: string;
  room_type: string;
  price_per_day: number;
  doctor_charges_per_day: number;
  is_occupied: boolean;
  current_patient_id: number | null;
  current_ipd_id: number | null;
  admitted_on: string | null;
  patient?: { name: string; phone: string; uhid: string };
}

interface Patient {
  patient_id: number;
  name: string;
  phone: string;
  uhid: string;
}

export default function RoomsPage() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showDischarge, setShowDischarge] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [bill, setBill] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const fetchRooms = async () => {
    const { data } = await supabase
      .from("room")
      .select("*, patient:current_patient_id (name, phone, uhid)")
      .order("room_number");
    if (data) setRooms(data as any);
    setLoading(false);
  };

  const fetchPatients = async () => {
    const { data } = await supabase
      .from("patient")
      .select("patient_id, name, phone, uhid")
      .order("name");
    if (data) setPatients(data);
  };

  useEffect(() => {
    if (authenticated) {
      fetchRooms();
      fetchPatients();
    }
  }, [authenticated]);

  const assignRoom = async () => {
    if (!selectedRoom || !selectedPatient) return;
    setSaving(true);

    // get or create IPD record
    const { data: ipd } = await supabase
      .from("ipd_record")
      .insert({
        patient_id: selectedPatient,
        doctor_id: 5,
        admit_date: new Date().toISOString().split("T")[0],
        room_number: selectedRoom.room_number,
        status: "admitted",
      })
      .select("ipd_id")
      .single();

    if (ipd) {
      // update room
      await supabase.from("room").update({
        is_occupied: true,
        current_patient_id: selectedPatient,
        current_ipd_id: ipd.ipd_id,
        admitted_on: new Date().toISOString().split("T")[0],
      }).eq("room_id", selectedRoom.room_id);

      fetchRooms();
      setShowAssign(false);
      setSelectedPatient(null);
      setPatientSearch("");
      alert(`Room ${selectedRoom.room_number} assigned successfully!`);
    }
    setSaving(false);
  };

  const calculateBill = async (room: Room) => {
    if (!room.admitted_on) return;
    const admitDate = new Date(room.admitted_on);
    const today = new Date();
    const days = Math.max(1, Math.ceil((today.getTime() - admitDate.getTime()) / (1000 * 60 * 60 * 24)));
    const roomCharges = room.price_per_day * days;
    const doctorCharges = room.doctor_charges_per_day * days;

    // get pharmacy charges from prescriptions
    const { data: prescriptions } = await supabase
      .from("prescription")
      .select("quantity, pharmacy_item:medicine_id (unit_price)")
      .eq("ipd_id", room.current_ipd_id);

    let pharmacyCharges = 0;
    if (prescriptions) {
      prescriptions.forEach((p: any) => {
        pharmacyCharges += (p.pharmacy_item?.unit_price || 0) * p.quantity;
      });
    }

    setBill({
      room,
      days,
      roomCharges,
      doctorCharges,
      pharmacyCharges,
      total: roomCharges + doctorCharges + pharmacyCharges,
    });
    setShowBill(true);
  };

  const dischargePatient = async () => {
    if (!selectedRoom) return;
    setSaving(true);

    // update IPD record
    await supabase.from("ipd_record").update({
      status: "discharged",
      discharge_date: new Date().toISOString().split("T")[0],
    }).eq("ipd_id", selectedRoom.current_ipd_id);

    // create discharge record
    await supabase.from("discharge").insert({
      ipd_id: selectedRoom.current_ipd_id,
      discharge_date: new Date().toISOString().split("T")[0],
      discharge_summary: "Patient discharged from room " + selectedRoom.room_number,
    });

    // create bill
    if (bill) {
      await supabase.from("bill").insert({
        patient_id: selectedRoom.current_patient_id,
        ipd_id: selectedRoom.current_ipd_id,
        ipd_charges: bill.roomCharges + bill.doctorCharges,
        pharmacy_charges: bill.pharmacyCharges,
        total_amount: bill.total,
        paid_status: "unpaid",
      });
    }

    // free the room
    await supabase.from("room").update({
      is_occupied: false,
      current_patient_id: null,
      current_ipd_id: null,
      admitted_on: null,
    }).eq("room_id", selectedRoom.room_id);

    fetchRooms();
    setShowDischarge(false);
    setShowBill(false);
    setBill(null);
    setSelectedRoom(null);
    alert("Patient discharged and bill generated!");
    setSaving(false);
  };

  const filteredRooms = rooms.filter(r => {
    if (filter === "available") return !r.is_occupied;
    if (filter === "occupied") return r.is_occupied;
    if (filter === "icu") return r.room_type === "ICU";
    return true;
  });

  const stats = {
    total: rooms.length,
    occupied: rooms.filter(r => r.is_occupied).length,
    available: rooms.filter(r => !r.is_occupied).length,
    icu: rooms.filter(r => r.room_type === "ICU" && r.is_occupied).length,
  };

  const getRoomColor = (room: Room) => {
    if (room.room_type === "ICU") return room.is_occupied ? "#fee2e2" : "#fef3c7";
    if (room.is_occupied) return "#fef2f2";
    return "#f0fdf4";
  };

  const getRoomBorder = (room: Room) => {
    if (room.room_type === "ICU") return room.is_occupied ? "#fca5a5" : "#fde68a";
    if (room.is_occupied) return "#fca5a5";
    return "#bbf7d0";
  };

  const getDaysSince = (date: string) => {
    const days = Math.ceil((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // PIN screen
  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "360px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", background: "#0a2463", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "24px", fontWeight: "800", margin: "0 auto 20px" }}>🛏️</div>
          <h2 style={{ color: "#0a2463", fontSize: "20px", marginBottom: "8px" }}>Room Management</h2>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "28px" }}>Reception access — Enter PIN</p>
          <input type="password" placeholder="••••" value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { if (pin === "1001") setAuthenticated(true); else alert("Wrong PIN!"); } }}
            style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1.5px solid #e0e7ff", fontSize: "24px", textAlign: "center", letterSpacing: "8px", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: "16px" }} />
          <button onClick={() => { if (pin === "1001") setAuthenticated(true); else alert("Wrong PIN!"); }}
            style={{ width: "100%", padding: "14px", background: "#0a2463", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
            Enter →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>

      {/* header */}
      <div style={{ background: "#0a2463", padding: "0 5%", height: "65px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>Room Management — Neel Orthopaedic</div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link href="/doctor" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "13px" }}>Doctor Portal</Link>
          <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "13px" }}>← Website</Link>
        </div>
      </div>

      <div style={{ padding: "24px 5%" }}>

        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Rooms", value: stats.total, color: "#0a2463" },
            { label: "Occupied", value: stats.occupied, color: "#dc2626" },
            { label: "Available", value: stats.available, color: "#16a34a" },
            { label: "ICU Occupied", value: stats.icu, color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontSize: "36px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All Rooms" },
            { key: "available", label: "Available" },
            { key: "occupied", label: "Occupied" },
            { key: "icu", label: "ICU" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: filter === f.key ? "#0a2463" : "white", color: filter === f.key ? "white" : "#666", fontWeight: "600", fontSize: "14px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* room grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>Loading rooms...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {filteredRooms.map(room => (
              <div key={room.room_id} style={{
                background: getRoomColor(room),
                borderRadius: "16px", padding: "24px",
                border: `2px solid ${getRoomBorder(room)}`,
                cursor: "pointer", transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#0a2463" }}>Room {room.room_number}</div>
                    <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>{room.room_type}</div>
                  </div>
                  <div style={{
                    padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                    background: room.is_occupied ? "#fee2e2" : "#dcfce7",
                    color: room.is_occupied ? "#dc2626" : "#16a34a",
                    border: `1px solid ${room.is_occupied ? "#fca5a5" : "#bbf7d0"}`
                  }}>
                    {room.is_occupied ? "Occupied" : "Available"}
                  </div>
                </div>

                <div style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
                  ₹{room.price_per_day.toLocaleString()}/day + ₹{room.doctor_charges_per_day.toLocaleString()} doctor
                </div>

                {room.is_occupied && room.patient && (
                  <div style={{ background: "white", borderRadius: "10px", padding: "12px", marginBottom: "12px", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "14px" }}>{(room.patient as any).name}</div>
                    <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>UHID: {(room.patient as any).uhid || "Not assigned"}</div>
                    {room.admitted_on && (
                      <div style={{ color: "#888", fontSize: "12px", marginTop: "4px" }}>
                        Day {getDaysSince(room.admitted_on)} · Admitted {new Date(room.admitted_on).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  {!room.is_occupied ? (
                    <button onClick={() => { setSelectedRoom(room); setShowAssign(true); }}
                      style={{ flex: 1, background: "#0a2463", color: "white", border: "none", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                      Assign Patient
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { setSelectedRoom(room); calculateBill(room); }}
                        style={{ flex: 1, background: "#1a73e8", color: "white", border: "none", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                        View Bill
                      </button>
                      <button onClick={() => { setSelectedRoom(room); calculateBill(room); setShowDischarge(true); }}
                        style={{ flex: 1, background: "#dc2626", color: "white", border: "none", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                        Discharge
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ASSIGN PATIENT MODAL */}
      {showAssign && selectedRoom && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ color: "#0a2463", fontSize: "20px", marginBottom: "6px" }}>Assign Patient to Room {selectedRoom.room_number}</h3>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>{selectedRoom.room_type} · ₹{selectedRoom.price_per_day}/day</p>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Search Patient</label>
              <input type="text" placeholder="Search by name or phone..."
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e7ff", fontSize: "15px", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
            </div>

            <div style={{ maxHeight: "280px", overflowY: "auto", border: "1px solid #e0e7ff", borderRadius: "10px", marginBottom: "20px" }}>
              {patients.filter(p =>
                p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                p.phone.includes(patientSearch)
              ).map(p => (
                <div key={p.patient_id} onClick={() => setSelectedPatient(p.patient_id)}
                  style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", background: selectedPatient === p.patient_id ? "#f0f4ff" : "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "600", color: "#0a2463", fontSize: "14px" }}>{p.name}</div>
                    <div style={{ color: "#888", fontSize: "12px" }}>{p.phone} {p.uhid ? `· ${p.uhid}` : ""}</div>
                  </div>
                  {selectedPatient === p.patient_id && <div style={{ color: "#1a73e8", fontWeight: "700" }}>✓</div>}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => { setShowAssign(false); setSelectedPatient(null); setPatientSearch(""); }}
                style={{ flex: 1, background: "#f0f4ff", color: "#0a2463", border: "none", padding: "12px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={assignRoom} disabled={saving || !selectedPatient}
                style={{ flex: 1, background: saving || !selectedPatient ? "#94a3b8" : "#0a2463", color: "white", border: "none", padding: "12px", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: saving || !selectedPatient ? "not-allowed" : "pointer" }}>
                {saving ? "Assigning..." : "Assign Room →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BILL MODAL */}
      {showBill && bill && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ color: "#0a2463", fontSize: "20px", marginBottom: "4px" }}>Bill Summary</h3>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>
              Room {bill.room.room_number} · {bill.days} day{bill.days > 1 ? "s" : ""}
            </p>

            {[
              { label: `Room charges (₹${bill.room.price_per_day} × ${bill.days} days)`, amount: bill.roomCharges },
              { label: `Doctor charges (₹${bill.room.doctor_charges_per_day} × ${bill.days} days)`, amount: bill.doctorCharges },
              { label: "Pharmacy charges", amount: bill.pharmacyCharges },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#555", fontSize: "14px" }}>{item.label}</span>
                <span style={{ fontWeight: "600", color: "#0a2463" }}>₹{item.amount.toLocaleString()}</span>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderTop: "2px solid #0a2463", marginTop: "8px" }}>
              <span style={{ fontWeight: "700", color: "#0a2463", fontSize: "18px" }}>Total</span>
              <span style={{ fontWeight: "800", color: "#0a2463", fontSize: "24px" }}>₹{bill.total.toLocaleString()}</span>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button onClick={() => { setShowBill(false); setShowDischarge(false); setBill(null); }}
                style={{ flex: 1, background: "#f0f4ff", color: "#0a2463", border: "none", padding: "12px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
                Close
              </button>
              {showDischarge && (
                <button onClick={dischargePatient} disabled={saving}
                  style={{ flex: 1, background: saving ? "#94a3b8" : "#dc2626", color: "white", border: "none", padding: "12px", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
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