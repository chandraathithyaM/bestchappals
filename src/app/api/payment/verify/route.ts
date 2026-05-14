import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";

interface VerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  db_order_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: VerifyBody = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
    }

    // ── 1. Verify Razorpay signature (CRITICAL — always server-side) ──────────
    let isValid = false;
    try {
      isValid = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
    } catch (sigErr) {
      console.error("[verify] Signature check error:", sigErr);
      return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
    }

    if (!isValid) {
      console.warn("[verify] INVALID SIGNATURE — possible fraud:", {
        razorpay_order_id,
        razorpay_payment_id,
      });
      return NextResponse.json(
        { error: "Payment verification failed. Your bank has not been charged." },
        { status: 400 }
      );
    }

    // ── 2. Update DB (skip gracefully if Supabase not configured) ────────────
    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();

        // Idempotency: skip if already paid
        const { data: existing } = await supabase
          .from("orders")
          .select("id, payment_status")
          .eq("id", db_order_id)
          .single();

        if (existing?.payment_status === "paid") {
          return NextResponse.json({
            success: true,
            orderId: db_order_id,
            paymentId: razorpay_payment_id,
          });
        }

        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_id: razorpay_payment_id,
            payment_status: "paid",
            order_status: "processing",
          })
          .eq("id", db_order_id)
          .eq("razorpay_order_id", razorpay_order_id);

        if (updateError) {
          console.warn("[verify] DB update failed (non-fatal):", updateError.message);
        }
      } catch (dbErr) {
        console.warn("[verify] DB error (non-fatal):", dbErr);
      }
    } else {
      console.log("[verify] Supabase not configured — skipping DB update");
    }

    // ── 3. Payment verified successfully ──────────────────────────────────────
    return NextResponse.json({
      success: true,
      orderId: db_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[verify] Unhandled error:", message);
    return NextResponse.json(
      { error: "Verification failed. Please contact support." },
      { status: 500 }
    );
  }
}
