"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import PublicNavbar from "@/components/PublicNavbar";

interface Slot {
  slot_id: number; slot_date: string; start_time: string;
  end_time: string; is_available: boolean; token_number: number;
}
interface BookingResult {
  token_number: number; slot_date: string; start_time: string;
  end_time: string; session: string; patient_name: string; phone: string; appt_id: number;
}
interface DateAvailability { [date: string]: { morning: number; evening: number }; }
interface Holiday { from_date: string; to_date: string; reason: string; }

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function getTodayString() { return new Date().toISOString().split("T")[0]; }

// Get current IST time in minutes since midnight
function getISTMinutes() {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.getUTCHours() * 60 + ist.getUTCMinutes();
}

// Can still book morning? Allow until session ends at 1:15 PM IST
function canBookMorning() {
  return getISTMinutes() < 13 * 60 + 15;
}

// Morning session fully over at 1:15 PM IST — hide remaining count after this
function isMorningSessionOver() {
  return getISTMinutes() >= 13 * 60 + 15;
}

// Can still book evening? Allow until session ends at 6:45 PM IST
function canBookEvening() {
  return getISTMinutes() < 18 * 60 + 45;
}

// Evening session fully over at 6:45 PM IST
function isEveningSessionOver() {
  return getISTMinutes() >= 18 * 60 + 45;
}

// Skip today entirely only if both sessions are fully over
function getNext30Days() {
  const days = [];
  const bothOver = isEveningSessionOver();
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (i === 0 && bothOver) continue;
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function QRCode({ data, size = 200 }: { data: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=0a1628&margin=10`;
  return <img src={url} alt="QR Code" width={size} height={size} style={{ borderRadius: 12 }} />;
}

async function fetchSlotsWithRealAvailability(date: string, sess: "morning" | "evening"): Promise<Slot[]> {
  const { data: slotData } = await supabase.from("slot").select("*").eq("slot_date", date).eq("doctor_id", 5).order("token_number", { ascending: true });
  if (!slotData || slotData.length === 0) return [];
  const { data: apptData } = await supabase.from("appointment").select("slot_id").neq("status", "cancelled").in("slot_id", slotData.map((s: any) => s.slot_id));
  const bookedSlotIds = new Set((apptData || []).map((a: any) => a.slot_id));

  // Get current IST time
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const currentMins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const todayIST = ist.toISOString().split("T")[0];
  const isToday = date === todayIST;

  return slotData.filter((s: any) => {
    if (sess === "morning") return s.token_number <= 72;
    if (sess === "evening") return s.token_number > 72;
    return true;
  }).map((s: any) => {
    // For today's slots, mark past slots as unavailable
    let isPast = false;
    if (isToday && s.start_time) {
      const [h, m] = s.start_time.split(":").map(Number);
      const slotMins = h * 60 + m;
      isPast = slotMins < currentMins;
    }
    return {
      ...s,
      is_available: s.is_available && !bookedSlotIds.has(s.slot_id) && !isPast,
    };
  });
}

export default function BookPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [session, setSession] = useState<"morning" | "evening" | "">("");
  const [dateAvailability, setDateAvailability] = useState<DateAvailability>({});
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const days = getNext30Days();
  const isSunday = (d: string) => new Date(d).getDay() === 0;
  const today = getTodayString();

  const getHolidayReason = (date: string): string | null => {
    const h = holidays.find(h => date >= h.from_date && date <= h.to_date);
    return h ? h.reason : null;
  };

  useEffect(() => {
    if (step !== 2) return;
    const fetchAvailability = async () => {
      setLoadingAvailability(true);
      const [availRes, holidayRes] = await Promise.all([
        supabase.rpc("get_slot_availability", { start_date: days[0], end_date: days[days.length - 1] }),
        supabase.from("doctor_holiday").select("from_date, to_date, reason").eq("doctor_id", 5),
      ]);
      if (!availRes.error && availRes.data) {
        const avail: DateAvailability = {};
        for (const row of availRes.data) {
          avail[row.slot_date] = { morning: row.morning_available, evening: row.evening_available };
        }
        setDateAvailability(avail);
      }
      if (!holidayRes.error && holidayRes.data) setHolidays(holidayRes.data as Holiday[]);
      setLoadingAvailability(false);
    };
    fetchAvailability();
  }, [step]);

  const validateStep1 = () => {
    let valid = true;
    setNameError(""); setPhoneError("");
    if (!name.trim()) { setNameError("Please enter your full name."); valid = false; }
    if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) { setPhoneError("Please enter a valid 10-digit phone number."); valid = false; }
    if (valid) setStep(2);
  };

  const validateStep2 = async () => {
    if (!selectedDate || !session) return;
    setLoadingSlots(true);
    const loaded = await fetchSlotsWithRealAvailability(selectedDate, session as "morning" | "evening");
    setSlots(loaded); setSelectedSlot(null); setLoadingSlots(false); setStep(3);
  };

  const handleBook = async () => {
    if (!selectedSlot || !name || !phone) return;
    setBookingLoading(true); setBookingError("");
    let patientId: number | null = null;
    const { data: existing } = await supabase.from("patient").select("patient_id").eq("phone", phone.trim()).single();
    if (existing) { patientId = existing.patient_id; }
    else {
      const { data: newPatient } = await supabase.from("patient").insert({ name: name.trim().toUpperCase(), phone: phone.trim() }).select("patient_id").single();
      if (newPatient) patientId = newPatient.patient_id;
    }
    if (!patientId) { setBookingError("Failed to register patient. Please try again."); setBookingLoading(false); return; }
    const { data: existing_appt } = await supabase.from("appointment").select("appt_id").eq("slot_id", selectedSlot.slot_id).neq("status", "cancelled").single();
    if (existing_appt) {
      setBookingError("This slot was just taken! Please select another.");
      setBookingLoading(false);
      const fresh = await fetchSlotsWithRealAvailability(selectedSlot.slot_date, session as "morning" | "evening");
      setSlots(fresh); setSelectedSlot(null); return;
    }
    const { data: appt, error } = await supabase.from("appointment").insert({
      patient_id: patientId, doctor_id: 5, slot_id: selectedSlot.slot_id,
      token_number: selectedSlot.token_number, status: "booked",
    }).select("appt_id").single();
    if (error || !appt) { setBookingError("Booking failed: " + (error?.message || "Unknown error")); setBookingLoading(false); return; }
    await supabase.from("slot").update({ is_available: false }).eq("slot_id", selectedSlot.slot_id);
    setBooking({
      token_number: selectedSlot.token_number, slot_date: selectedSlot.slot_date,
      start_time: selectedSlot.start_time, end_time: selectedSlot.end_time,
      session, patient_name: name.trim().toUpperCase(), phone: phone.trim(), appt_id: appt.appt_id,
    });
    setStep(4); setBookingLoading(false);
  };

  const qrData = booking ? `NEEL-OPD|TOKEN:${booking.token_number}|DATE:${booking.slot_date}|NAME:${booking.patient_name}|PHONE:${booking.phone}|APPT:${booking.appt_id}` : "";
  const inp: React.CSSProperties = { width: "100%", padding: "13px 16px", border: "1.5px solid #e0e7ff", borderRadius: "10px", fontSize: "16px", outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box", background: "#fff", color: "#030a1e", transition: "border-color 0.2s" };
  const getSessionAvailability = (date: string, sess: "morning" | "evening") => dateAvailability[date]?.[sess] ?? null;

  const getDateBadge = (date: string) => {
    // Holiday always wins
    const reason = getHolidayReason(date);
    if (reason) return { text: "🚫", color: "#dc2626", bg: "#fee2e2", isHoliday: true };

    const avail = dateAvailability[date];
    if (!avail) return null;

    const sun = isSunday(date);
    const isToday = date === today;

    let morningCount = avail.morning;
    let eveningCount = avail.evening;

    if (isToday) {
      // Only zero out a session's count AFTER the session is fully over
      // Morning session ends at 1:15 PM IST
      if (isMorningSessionOver()) morningCount = 0;
      // Evening session ends at 6:45 PM IST
      if (isEveningSessionOver()) eveningCount = 0;
    }

    const total = sun ? morningCount : morningCount + eveningCount;

    // Show Full only if genuinely 0 slots remain (all booked OR sessions over)
    if (total === 0) return { text: "Full", color: "#dc2626", bg: "#fee2e2", isHoliday: false };
    if (total <= 10) return { text: `${total} left`, color: "#d97706", bg: "#fef3c7", isHoliday: false };
    return null;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        .display-font { font-family: 'Playfair Display', Georgia, serif !important; }
        .body-font { font-family: 'Inter', sans-serif !important; }
        input, select, textarea { color: #030a1e !important; font-size: 16px !important; }
        input::placeholder, textarea::placeholder { color: #9ca3af !important; }
        input:focus, select:focus { border-color: #1a56db !important; box-shadow: 0 0 0 3px rgba(26,86,219,0.08) !important; outline: none !important; }
      `}</style>
      <PublicNavbar />

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2f6e 50%, #0f4c8a 100%)", padding: "56px 5% 44px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="body-font" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#93c5fd", padding: "8px 20px", borderRadius: "30px", fontSize: "12px", letterSpacing: "2.5px", marginBottom: "20px", fontWeight: "600" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", display: "inline-block", boxShadow: "0 0 8px #34d399" }} />
          NEEL ORTHOPAEDIC MULTISPECIALITY HOSPITAL
        </div>
        <h1 className="display-font" style={{ color: "white", fontSize: "clamp(28px, 4vw, 52px)", fontWeight: "900", marginBottom: "12px", letterSpacing: "-1.5px" }}>Book OPD Appointment</h1>
        <p className="body-font" style={{ color: "rgba(255,255,255,0.65)", fontSize: "18px" }}>Get your token instantly. No waiting at the registration desk.</p>
      </div>

      {/* PROGRESS */}
      <div style={{ background: "#0a1628", padding: "0 5% 24px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto", display: "flex" }}>
          {[{ n: 1, label: "Your Details" }, { n: 2, label: "Date & Session" }, { n: 3, label: "Select Slot" }, { n: 4, label: "Confirmation" }].map((s, i) => (
            <div key={s.n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              {i < 3 && <div style={{ position: "absolute", top: 16, left: "50%", right: "-50%", height: "2px", background: step > s.n ? "#1a56db" : "rgba(255,255,255,0.15)", zIndex: 0 }} />}
              <div className="body-font" style={{ width: 34, height: 34, borderRadius: "50%", background: step >= s.n ? "linear-gradient(135deg, #1a56db, #60a5fa)" : "rgba(255,255,255,0.1)", border: step >= s.n ? "none" : "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 700, zIndex: 1, marginBottom: 8, boxShadow: step >= s.n ? "0 4px 12px rgba(26,86,219,0.4)" : "none" }}>
                {step > s.n ? "✓" : s.n}
              </div>
              <div className="body-font" style={{ color: step >= s.n ? "white" : "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: step === s.n ? 700 : 400, textAlign: "center" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 620, margin: "32px auto", padding: "0 20px 80px" }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 4px 24px rgba(10,36,99,0.08)", border: "1px solid #e8edf5" }}>
            <h2 className="display-font" style={{ color: "#030a1e", fontSize: "26px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>Your Details</h2>
            <p className="body-font" style={{ color: "#9ca3af", fontSize: "15px", marginBottom: "32px" }}>We'll use this to identify your appointment at the hospital.</p>
            <div style={{ marginBottom: "20px" }}>
              <label className="body-font" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" style={inp} />
              {nameError && <p className="body-font" style={{ color: "#dc2626", fontSize: "13px", marginTop: "6px" }}>{nameError}</p>}
            </div>
            <div style={{ marginBottom: "32px" }}>
              <label className="body-font" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Mobile Number *</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" style={inp} />
              {phoneError && <p className="body-font" style={{ color: "#dc2626", fontSize: "13px", marginTop: "6px" }}>{phoneError}</p>}
              <p className="body-font" style={{ color: "#9ca3af", fontSize: "13px", marginTop: "6px" }}>Your token QR code will be shown on screen after booking.</p>
            </div>
            <button onClick={validateStep1} className="body-font" style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: "14px", fontSize: "17px", fontWeight: "700", cursor: "pointer", boxShadow: "0 6px 20px rgba(26,86,219,0.3)" }}>
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 4px 24px rgba(10,36,99,0.08)", border: "1px solid #e8edf5" }}>
            <button onClick={() => setStep(1)} className="body-font" style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "14px", cursor: "pointer", marginBottom: "20px", display: "flex", alignItems: "center", gap: "4px" }}>← Back</button>
            <h2 className="display-font" style={{ color: "#030a1e", fontSize: "26px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>Date & Session</h2>
            <p className="body-font" style={{ color: "#9ca3af", fontSize: "15px", marginBottom: "24px" }}>Booking for: <strong style={{ color: "#030a1e" }}>{name}</strong></p>

            <div style={{ display: "flex", gap: "16px", marginBottom: "18px", flexWrap: "wrap" }}>
              {[{ color: "#1a56db", bg: "#f8faff", label: "Available" }, { color: "#d97706", bg: "#fef3c7", label: "Filling fast" }, { color: "#dc2626", bg: "#fee2e2", label: "Unavailable / Holiday" }].map(l => (
                <div key={l.label} className="body-font" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: l.bg, border: `1.5px solid ${l.color}` }} />
                  {l.label}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label className="body-font" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px" }}>Select Date</label>
              {loadingAvailability ? (
                <div className="body-font" style={{ textAlign: "center", padding: "24px", color: "#9ca3af", fontSize: "14px" }}>Checking availability…</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
                  {days.map(d => {
                    const dateObj = new Date(d);
                    const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "short" });
                    const dayNum = dateObj.getDate();
                    const monthName = dateObj.toLocaleDateString("en-IN", { month: "short" });
                    const isSun = isSunday(d);
                    const isToday = d === today;
                    const badge = getDateBadge(d);
                    const isHoliday = badge?.isHoliday === true;
                    const isFullyBooked = badge?.text === "Full" || isHoliday;
                    const isSelected = selectedDate === d;
                    let bgColor = isSelected ? "#0f2d6b" : "#f8faff";
                    let borderColor = isSelected ? "#1a56db" : "#e0e7ff";
                    if (isHoliday && !isSelected) { bgColor = "#fff1f2"; borderColor = "#fca5a5"; }
                    else if (isFullyBooked && !isSelected) { bgColor = "#f9f9f9"; borderColor = "#e5e7eb"; }
                    else if (badge && !isHoliday && badge.text !== "Full" && !isSelected) { bgColor = "#fef9c3"; borderColor = "#fde68a"; }
                    return (
                      <button key={d}
                        onClick={() => { if (isFullyBooked) return; setSelectedDate(d); setSession(isSun ? (canBookMorning() ? "morning" : "") : ""); }}
                        disabled={isFullyBooked}
                        title={isHoliday ? "Doctor not available" : ""}
                        style={{ padding: "10px 4px", borderRadius: "10px", border: `2px solid ${borderColor}`, background: bgColor, cursor: isFullyBooked ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif", opacity: isFullyBooked ? 0.75 : 1, transition: "all 0.15s" }}>
                        <div style={{ fontSize: "10px", color: isSelected ? "rgba(255,255,255,0.6)" : "#9ca3af", marginBottom: "2px" }}>{dayName}</div>
                        <div style={{ fontSize: "17px", fontWeight: "800", color: isSelected ? "white" : isFullyBooked ? "#d1d5db" : "#030a1e" }}>{dayNum}</div>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: isSelected ? "rgba(255,255,255,0.8)" : "#6b7280", marginTop: "2px" }}>{monthName}</div>
                        {isToday && !isHoliday && <div style={{ fontSize: "8px", fontWeight: "700", color: isSelected ? "#93c5fd" : "#1a56db", marginTop: "1px" }}>Today</div>}
                        {isHoliday && <div style={{ fontSize: "10px", marginTop: "1px" }}>🚫</div>}
                        {!isHoliday && badge && <div style={{ fontSize: "8px", fontWeight: "700", color: isSelected ? "white" : badge.color, marginTop: "1px" }}>{badge.text}</div>}
                        {isSun && !badge && !isToday && <div style={{ fontSize: "8px", color: isSelected ? "#93c5fd" : "#1a56db", marginTop: "1px" }}>Sun</div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Session selector */}
            {selectedDate && (
              <div style={{ marginBottom: "32px" }}>
                {getHolidayReason(selectedDate) ? (
                  <div className="body-font" style={{ background: "#fff1f2", border: "1.5px solid #fca5a5", borderRadius: "16px", padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ fontSize: "32px", flexShrink: 0 }}>🚫</div>
                    <div>
                      <div style={{ fontWeight: "800", color: "#dc2626", fontSize: "16px", marginBottom: "4px" }}>Doctor Not Available</div>
                      <div style={{ color: "#9b1c1c", fontSize: "15px", marginBottom: "6px" }}>Doctor not available on this date</div>
                      <div style={{ color: "#9ca3af", fontSize: "13px" }}>Please select a different date to book your appointment.</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="body-font" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px" }}>Select Session</label>
                    <div style={{ display: "grid", gridTemplateColumns: isSunday(selectedDate) ? "1fr" : "1fr 1fr", gap: "12px" }}>
                      {(() => {
                        const morningLeft = getSessionAvailability(selectedDate, "morning");
                        const isToday = selectedDate === today;
                        // Disable booking if past the booking cutoff (9:30 AM) OR session fully over
                        const morningBookingClosed = isToday && !canBookMorning();
                        const morningOver = isToday && isMorningSessionOver();
                        const morningFull = morningLeft === 0;
                        const morningDisabled = morningFull || morningBookingClosed;
                        return (
                          <button onClick={() => { if (!morningDisabled) setSession("morning"); }} disabled={morningDisabled}
                            style={{ padding: "18px", borderRadius: "14px", border: `2px solid ${morningDisabled ? "#e5e7eb" : session === "morning" ? "#1a56db" : "#e0e7ff"}`, background: morningDisabled ? "#f9f9f9" : session === "morning" ? "#eff6ff" : "white", cursor: morningDisabled ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif", textAlign: "left", opacity: morningDisabled ? 0.6 : 1, transition: "all 0.2s" }}>
                            <div style={{ fontSize: "20px", marginBottom: "6px" }}>🌅</div>
                            <div style={{ fontWeight: "700", color: morningDisabled ? "#9ca3af" : "#030a1e", fontSize: "16px" }}>Morning Session</div>
                            <div style={{ color: "#6b7280", fontSize: "13px", marginTop: "3px" }}>10:00 AM – 1:15 PM · Tokens 1–72</div>
                            {morningOver ? <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: "700", marginTop: "6px" }}>Session Ended</div>
                              : morningBookingClosed && !morningFull ? <div style={{ color: "#d97706", fontSize: "12px", fontWeight: "700", marginTop: "6px" }}>Booking closed for today</div>
                              : morningFull ? <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: "700", marginTop: "6px" }}>Fully Booked</div>
                              : morningLeft !== null && morningLeft <= 10 ? <div style={{ color: "#d97706", fontSize: "12px", fontWeight: "700", marginTop: "6px" }}>Only {morningLeft} slots left!</div>
                              : morningLeft !== null ? <div style={{ color: "#16a34a", fontSize: "12px", marginTop: "6px" }}>{morningLeft} slots available</div>
                              : null}
                          </button>
                        );
                      })()}
                      {!isSunday(selectedDate) && (() => {
                        const eveningLeft = getSessionAvailability(selectedDate, "evening");
                        const isToday = selectedDate === today;
                        const eveningBookingClosed = isToday && !canBookEvening();
                        const eveningOver = isToday && isEveningSessionOver();
                        const eveningFull = eveningLeft === 0;
                        const eveningDisabled = eveningFull || eveningBookingClosed;
                        return (
                          <button onClick={() => { if (!eveningDisabled) setSession("evening"); }} disabled={eveningDisabled}
                            style={{ padding: "18px", borderRadius: "14px", border: `2px solid ${eveningDisabled ? "#e5e7eb" : session === "evening" ? "#1a56db" : "#e0e7ff"}`, background: eveningDisabled ? "#f9f9f9" : session === "evening" ? "#eff6ff" : "white", cursor: eveningDisabled ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif", textAlign: "left", opacity: eveningDisabled ? 0.6 : 1, transition: "all 0.2s" }}>
                            <div style={{ fontSize: "20px", marginBottom: "6px" }}>🌆</div>
                            <div style={{ fontWeight: "700", color: eveningDisabled ? "#9ca3af" : "#030a1e", fontSize: "16px" }}>Evening Session</div>
                            <div style={{ color: "#6b7280", fontSize: "13px", marginTop: "3px" }}>3:30 PM – 6:45 PM · Tokens 73–144</div>
                            {eveningOver ? <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: "700", marginTop: "6px" }}>Session Ended</div>
                              : eveningBookingClosed && !eveningFull ? <div style={{ color: "#d97706", fontSize: "12px", fontWeight: "700", marginTop: "6px" }}>Booking closed for today</div>
                              : eveningFull ? <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: "700", marginTop: "6px" }}>Fully Booked</div>
                              : eveningLeft !== null && eveningLeft <= 10 ? <div style={{ color: "#d97706", fontSize: "12px", fontWeight: "700", marginTop: "6px" }}>Only {eveningLeft} slots left!</div>
                              : eveningLeft !== null ? <div style={{ color: "#16a34a", fontSize: "12px", marginTop: "6px" }}>{eveningLeft} slots available</div>
                              : null}
                          </button>
                        );
                      })()}
                    </div>
                    {isSunday(selectedDate) && (
                      <div className="body-font" style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px 16px", marginTop: "12px", fontSize: "14px", color: "#92400e" }}>
                        🗓 Sunday — Morning session only (10:00 AM – 1:15 PM)
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <button onClick={validateStep2}
              disabled={!selectedDate || !session || loadingSlots || !!getHolidayReason(selectedDate)}
              className="body-font"
              style={{ width: "100%", padding: "15px", background: (!selectedDate || !session || !!getHolidayReason(selectedDate)) ? "#e5e7eb" : "linear-gradient(135deg, #0f2d6b, #1a56db)", color: (!selectedDate || !session || !!getHolidayReason(selectedDate)) ? "#9ca3af" : "white", border: "none", borderRadius: "14px", fontSize: "17px", fontWeight: "700", cursor: (!selectedDate || !session || !!getHolidayReason(selectedDate)) ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: (!selectedDate || !session || !!getHolidayReason(selectedDate)) ? "none" : "0 6px 20px rgba(26,86,219,0.3)" }}>
              {loadingSlots ? "Loading slots…" : "See Available Slots →"}
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 4px 24px rgba(10,36,99,0.08)", border: "1px solid #e8edf5" }}>
            <button onClick={() => setStep(2)} className="body-font" style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "14px", cursor: "pointer", marginBottom: "20px" }}>← Back</button>
            <h2 className="display-font" style={{ color: "#030a1e", fontSize: "26px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>Select a Slot</h2>
            <p className="body-font" style={{ color: "#9ca3af", fontSize: "15px", marginBottom: "20px" }}>
              {formatDate(selectedDate)} · {session === "morning" ? "Morning" : "Evening"} Session
            </p>
            <div style={{ display: "flex", gap: "16px", marginBottom: "18px", flexWrap: "wrap" }}>
              {[{ color: "#1a56db", bg: "#f8faff", label: "Available" }, { color: "white", bg: "#0f2d6b", label: "Selected" }, { color: "#d1d5db", bg: "#f3f4f6", label: "Booked" }].map(l => (
                <div key={l.label} className="body-font" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: l.bg, border: `1.5px solid ${l.color}` }} />
                  {l.label}
                </div>
              ))}
            </div>
            {slots.length > 0 && slots.filter(s => s.is_available).length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>😕</div>
                <div className="display-font" style={{ fontWeight: "900", color: "#030a1e", fontSize: "22px", marginBottom: "8px" }}>Fully Booked!</div>
                <div className="body-font" style={{ fontSize: "15px", color: "#9ca3af", marginBottom: "20px" }}>All slots for this session are taken.</div>
                <button onClick={() => setStep(2)} className="body-font" style={{ background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Choose Another Date</button>
              </div>
            ) : slots.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>😕</div>
                <div className="display-font" style={{ fontWeight: "900", color: "#030a1e", fontSize: "22px", marginBottom: "8px" }}>No slots found</div>
                <button onClick={() => setStep(2)} className="body-font" style={{ background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Choose Another Date</button>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", marginBottom: "24px" }}>
                  {slots.map(slot => {
                    const isSelected = selectedSlot?.slot_id === slot.slot_id;
                    const isBooked = !slot.is_available;
                    return (
                      <button key={slot.slot_id} onClick={() => { if (!isBooked) setSelectedSlot(slot); }} disabled={isBooked}
                        style={{ padding: "12px 4px", borderRadius: "10px", border: `2px solid ${isBooked ? "#e5e7eb" : isSelected ? "#1a56db" : "#e0e7ff"}`, background: isBooked ? "#f3f4f6" : isSelected ? "#0f2d6b" : "#f8faff", cursor: isBooked ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif", opacity: isBooked ? 0.45 : 1, transition: "all 0.15s" }}>
                        <div style={{ fontSize: "15px", fontWeight: "800", color: isBooked ? "#d1d5db" : isSelected ? "white" : "#030a1e" }}>{slot.token_number}</div>
                        <div style={{ fontSize: "9px", color: isBooked ? "#e5e7eb" : isSelected ? "rgba(255,255,255,0.65)" : "#9ca3af", marginTop: "2px" }}>{isBooked ? "Taken" : formatTime(slot.start_time)}</div>
                      </button>
                    );
                  })}
                </div>
                {selectedSlot && (
                  <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "14px", padding: "18px 22px", marginBottom: "20px" }}>
                    <div className="body-font" style={{ fontWeight: "700", color: "#030a1e", fontSize: "16px", marginBottom: "4px" }}>Token #{selectedSlot.token_number} · {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}</div>
                    <div className="body-font" style={{ color: "#6b7280", fontSize: "14px" }}>{formatDate(selectedSlot.slot_date)}</div>
                  </div>
                )}
                {bookingError && <div className="body-font" style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#dc2626", fontSize: "14px" }}>⚠️ {bookingError}</div>}
                <button onClick={handleBook} disabled={!selectedSlot || bookingLoading} className="body-font"
                  style={{ width: "100%", padding: "15px", background: !selectedSlot ? "#e5e7eb" : "linear-gradient(135deg, #0f2d6b, #1a56db)", color: !selectedSlot ? "#9ca3af" : "white", border: "none", borderRadius: "14px", fontSize: "17px", fontWeight: "700", cursor: !selectedSlot ? "not-allowed" : "pointer", boxShadow: !selectedSlot ? "none" : "0 6px 20px rgba(26,86,219,0.3)" }}>
                  {bookingLoading ? "Booking…" : "Confirm Booking →"}
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && booking && (
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 4px 24px rgba(10,36,99,0.08)", border: "1px solid #e8edf5", textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 20px", border: "2px solid #6ee7b7" }}>✅</div>
            <h2 className="display-font" style={{ color: "#030a1e", fontSize: "28px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>Appointment Confirmed!</h2>
            <p className="body-font" style={{ color: "#9ca3af", fontSize: "15px", marginBottom: "32px" }}>Show the QR code at hospital reception.</p>
            <div style={{ background: "linear-gradient(135deg, #0a1628, #1a2f6e)", borderRadius: "20px", padding: "32px 28px", marginBottom: "24px", color: "white", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
              <div className="body-font" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "3px", marginBottom: "12px", fontWeight: "700" }}>YOUR TOKEN NUMBER</div>
              <div className="display-font" style={{ fontSize: "80px", fontWeight: "900", letterSpacing: "-3px", lineHeight: 1, marginBottom: "12px" }}>{booking.token_number}</div>
              <div className="body-font" style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", marginBottom: "4px" }}>{formatDate(booking.slot_date)}</div>
              <div className="body-font" style={{ fontSize: "14px", color: "#93c5fd" }}>{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</div>
              <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px" }}>
                <span className="body-font" style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>{booking.patient_name} · {booking.phone}</span>
              </div>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <p className="body-font" style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "14px" }}>📱 Screenshot this QR code to show at reception</p>
              <div style={{ display: "flex", justifyContent: "center" }}><QRCode data={qrData} size={200} /></div>
              <p className="body-font" style={{ fontSize: "12px", color: "#d1d5db", marginTop: "10px" }}>Scan at hospital reception to check in</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px", textAlign: "left" }}>
              {[
                { icon: "📍", title: "Location", desc: "Shrinath Apartment, Goddev Naka, BP Road, Bhayander East" },
                { icon: "⏰", title: "Arrive on time", desc: "Please arrive on time for your scheduled slot." },
                { icon: "📋", title: "Bring documents", desc: "Previous reports, X-rays, prescriptions if any" },
                { icon: "📞", title: "Helpline", desc: "+91 70210 94941 for any queries" },
              ].map((item, i) => (
                <div key={i} style={{ background: "#f8faff", borderRadius: "12px", padding: "16px", border: "1px solid #e0e7ff" }}>
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>{item.icon}</div>
                  <div className="body-font" style={{ fontWeight: "700", color: "#030a1e", fontSize: "14px", marginBottom: "4px" }}>{item.title}</div>
                  <div className="body-font" style={{ color: "#6b7280", fontSize: "13px", lineHeight: "1.5" }}>{item.desc}</div>
                </div>
              ))}
            </div>
            {/* Status page notice */}
            <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", textAlign: "left" }}>
              <p className="body-font" style={{ fontSize: "13px", color: "#1e40af", margin: 0 }}>
                📱 Check real-time OPD status before leaving home at{" "}
                <strong>yoursite.vercel.app/status</strong> — we'll update it if there are any delays.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => window.print()} className="body-font" style={{ flex: 1, padding: "14px", background: "white", color: "#030a1e", border: "2px solid #e0e7ff", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>🖨️ Print / Save</button>
              <Link href="/" className="body-font" style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg, #0f2d6b, #1a56db)", color: "white", borderRadius: "14px", fontSize: "15px", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>← Back to Home</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}