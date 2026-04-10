"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Doctor {
  doctor_id: number;
  name: string;
  specialization: string;
  available_days: string;
}

interface Slot {
  slot_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_tokens: number;
  is_available: boolean;
}

export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tokenNumber, setTokenNumber] = useState<number | null>(null);
  const [apptId, setApptId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "M",
    address: "",
    blood_group: "",
  });

  // fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("doctor")
        .select("*")
        .eq("is_active", true);
      if (data) setDoctors(data);
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  // fetch slots when doctor selected
  const fetchSlots = async (doctorId: number) => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7);

    const { data } = await supabase
      .from("slot")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("is_available", true)
      .gte("slot_date", today.toISOString().split("T")[0])
      .lte("slot_date", maxDate.toISOString().split("T")[0])
      .order("slot_date", { ascending: true });

    if (data) setSlots(data);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    fetchSlots(doctor.doctor_id);
    setStep(2);
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setSubmitting(true);

    try {
      // check if patient exists
      let patientId: number;
      const { data: existingPatient } = await supabase
        .from("patient")
        .select("patient_id")
        .eq("phone", form.phone)
        .single();

      if (existingPatient) {
        patientId = existingPatient.patient_id;
      } else {
        // create new patient
        const { data: newPatient, error } = await supabase
          .from("patient")
          .insert({
            name: form.name,
            phone: form.phone,
            email: form.email || null,
            dob: form.dob,
            gender: form.gender,
            address: form.address || null,
            blood_group: form.blood_group || null,
          })
          .select("patient_id")
          .single();

        if (error) throw error;
        patientId = newPatient.patient_id;
      }

      // get token number for this slot
      const { count } = await supabase
        .from("appointment")
        .select("*", { count: "exact", head: true })
        .eq("slot_id", selectedSlot.slot_id)
        .neq("status", "cancelled");

      const token = (count || 0) + 1;

      // create appointment
      const { data: appt, error: apptError } = await supabase
        .from("appointment")
        .insert({
          patient_id: patientId,
          doctor_id: selectedDoctor.doctor_id,
          slot_id: selectedSlot.slot_id,
          token_number: token,
          status: "booked",
          qr_code: `NEEL-${patientId}-${selectedSlot.slot_id}-${token}`,
        })
        .select("appt_id")
        .single();

      if (apptError) throw apptError;

      setTokenNumber(token);
      setApptId(appt.appt_id);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>

      {/* navbar */}
      <nav style={{
        background: "#0a2463", padding: "0 5%", height: "65px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: "700", fontSize: "16px" }}>
          ← Neel Orthopaedic HMS
        </Link>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>OPD Appointment Booking</span>
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px" }}>

        {/* progress steps */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "40px", gap: "0" }}>
          {["Select Doctor", "Choose Slot", "Your Details", "Confirmed!"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: step > i + 1 ? "#1a73e8" : step === i + 1 ? "#0a2463" : "#e0e7ff",
                  color: step >= i + 1 ? "white" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: "700", transition: "all 0.3s"
                }}>{step > i + 1 ? "✓" : i + 1}</div>
                <div style={{ fontSize: "11px", marginTop: "6px", color: step === i + 1 ? "#0a2463" : "#94a3b8", fontWeight: step === i + 1 ? "700" : "400" }}>{label}</div>
              </div>
              {i < 3 && <div style={{ height: "2px", flex: 0.5, background: step > i + 1 ? "#1a73e8" : "#e0e7ff", transition: "all 0.3s", marginBottom: "20px" }} />}
            </div>
          ))}
        </div>

        {/* STEP 1 — select doctor */}
        {step === 1 && (
          <div>
            <h2 style={{ color: "#0a2463", fontSize: "24px", marginBottom: "8px" }}>Select a Doctor</h2>
            <p style={{ color: "#666", marginBottom: "24px", fontSize: "15px" }}>Choose the specialist you'd like to consult</p>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>
                <p>No doctors found. Please add doctors in the admin panel first.</p>
                <p style={{ fontSize: "13px", marginTop: "8px", color: "#94a3b8" }}>
                  Or insert sample data in Supabase SQL editor:
                </p>
                <code style={{ fontSize: "12px", background: "#f1f5f9", padding: "8px 12px", borderRadius: "6px", display: "block", marginTop: "8px", textAlign: "left" }}>
                  INSERT INTO doctor (name, specialization, qualification, phone, available_days) VALUES
                  ('Dr. G.K. Boob', 'Orthopedic Surgery', 'DNB Ortho', '9876543210', 'Mon,Wed,Fri');
                </code>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {doctors.map(doc => (
                  <div key={doc.doctor_id}
                    onClick={() => handleDoctorSelect(doc)}
                    style={{
                      background: "white", borderRadius: "12px", padding: "24px",
                      border: "2px solid #e0e7ff", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "20px",
                      transition: "all 0.2s",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#1a73e8";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(26,115,232,0.15)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#e0e7ff";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                    }}
                  >
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #0a2463, #1a73e8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: "20px", fontWeight: "700", flexShrink: 0
                    }}>
                      {doc.name.split(" ").pop()?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "700", fontSize: "17px", color: "#0a2463" }}>{doc.name}</div>
                      <div style={{ color: "#1a73e8", fontSize: "14px", marginTop: "2px" }}>{doc.specialization}</div>
                      <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>Available: {doc.available_days}</div>
                    </div>
                    <div style={{ color: "#1a73e8", fontSize: "20px" }}>→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — select slot */}
        {step === 2 && (
          <div>
            <h2 style={{ color: "#0a2463", fontSize: "24px", marginBottom: "4px" }}>Choose a Slot</h2>
            <p style={{ color: "#666", marginBottom: "24px", fontSize: "15px" }}>
              Available slots for <strong>{selectedDoctor?.name}</strong>
            </p>
            {slots.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#666", background: "white", borderRadius: "12px" }}>
                No slots available in the next 7 days. Please check back later.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {slots.map(slot => (
                  <div key={slot.slot_id}
                    onClick={() => handleSlotSelect(slot)}
                    style={{
                      background: "white", borderRadius: "12px", padding: "20px 24px",
                      border: "2px solid #e0e7ff", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#1a73e8";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(26,115,232,0.12)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#e0e7ff";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "700", color: "#0a2463", fontSize: "16px" }}>{formatDate(slot.slot_date)}</div>
                      <div style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
                        {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        background: "#e8f5e9", color: "#2e7d32",
                        padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600"
                      }}>Available</div>
                      <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>Max {slot.max_tokens} tokens</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setStep(1)} style={{
              marginTop: "20px", background: "transparent", border: "none",
              color: "#1a73e8", cursor: "pointer", fontSize: "14px"
            }}>← Back to doctors</button>
          </div>
        )}

        {/* STEP 3 — patient details */}
        {step === 3 && (
          <div>
            <h2 style={{ color: "#0a2463", fontSize: "24px", marginBottom: "4px" }}>Your Details</h2>
            <p style={{ color: "#666", marginBottom: "24px", fontSize: "15px" }}>
              Booking with <strong>{selectedDoctor?.name}</strong> on <strong>{selectedSlot && formatDate(selectedSlot.slot_date)}</strong>
            </p>
            <div style={{ background: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[
                  { label: "Full Name *", key: "name", type: "text", placeholder: "e.g. Ramesh Patil", full: true },
                  { label: "Phone Number *", key: "phone", type: "tel", placeholder: "10-digit mobile number" },
                  { label: "Email", key: "email", type: "email", placeholder: "optional" },
                  { label: "Date of Birth *", key: "dob", type: "date", placeholder: "" },
                  { label: "Address", key: "address", type: "text", placeholder: "optional", full: true },
                  { label: "Blood Group", key: "blood_group", type: "text", placeholder: "e.g. B+" },
                ].map(field => (
                  <div key={field.key} style={{ gridColumn: field.full ? "1/-1" : "auto" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: "8px",
                        border: "1.5px solid #e0e7ff", fontSize: "15px",
                        outline: "none", boxSizing: "border-box",
                        fontFamily: "Georgia, serif"
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Gender *</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e7ff", fontSize: "15px", fontFamily: "Georgia, serif" }}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !form.name || !form.phone || !form.dob}
                style={{
                  marginTop: "24px", width: "100%",
                  background: submitting || !form.name || !form.phone || !form.dob ? "#94a3b8" : "#0a2463",
                  color: "white", border: "none", borderRadius: "10px",
                  padding: "14px", fontSize: "16px", fontWeight: "700",
                  cursor: submitting || !form.name || !form.phone || !form.dob ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
              >
                {submitting ? "Booking..." : "Confirm Appointment"}
              </button>
            </div>
            <button onClick={() => setStep(2)} style={{
              marginTop: "16px", background: "transparent", border: "none",
              color: "#1a73e8", cursor: "pointer", fontSize: "14px"
            }}>← Back to slots</button>
          </div>
        )}

        {/* STEP 4 — confirmation */}
        {step === 4 && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              background: "white", borderRadius: "16px", padding: "48px 32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
            }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
              <h2 style={{ color: "#0a2463", fontSize: "26px", marginBottom: "8px" }}>Appointment Confirmed!</h2>
              <p style={{ color: "#666", marginBottom: "32px", fontSize: "15px" }}>
                Your appointment has been booked successfully.
              </p>

              <div style={{
                background: "#f0f4ff", borderRadius: "12px", padding: "24px",
                marginBottom: "24px", border: "2px solid #e0e7ff"
              }}>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>YOUR TOKEN NUMBER</div>
                <div style={{
                  fontSize: "72px", fontWeight: "800", color: "#0a2463",
                  lineHeight: 1, marginBottom: "8px"
                }}>{tokenNumber}</div>
                <div style={{ fontSize: "13px", color: "#1a73e8" }}>
                  {selectedDoctor?.name} · {selectedSlot && formatDate(selectedSlot.slot_date)}
                </div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                  {selectedSlot && formatTime(selectedSlot.start_time)} — {selectedSlot && formatTime(selectedSlot.end_time)}
                </div>
              </div>

              <div style={{
                background: "#fff8e1", borderRadius: "10px", padding: "16px",
                border: "1px solid #ffe082", marginBottom: "28px", fontSize: "14px", color: "#795548"
              }}>
                📱 Please show this token number at the reception desk.<br />
                QR Code: <strong>NEEL-{apptId}</strong>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <Link href="/" style={{
                  background: "#0a2463", color: "white", padding: "12px 28px",
                  borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600"
                }}>Back to Home</Link>
                <Link href="/token" style={{
                  background: "white", color: "#0a2463", padding: "12px 28px",
                  borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600",
                  border: "2px solid #0a2463"
                }}>Check Token Status</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}