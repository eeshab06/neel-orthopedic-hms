import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Service role client — bypasses RLS entirely
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { appt_id, status } = await req.json();

    if (!appt_id || !status) {
      return NextResponse.json({ error: "Missing appt_id or status" }, { status: 400 });
    }

    // Only allow valid status transitions from this endpoint
    const allowed = ["checked_in", "completed", "booked"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { error } = await adminSupabase
      .from("appointment")
      .update({ status })
      .eq("appt_id", appt_id);

    if (error) {
      console.error("[token-status] DB error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}