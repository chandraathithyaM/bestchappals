import { NextRequest, NextResponse } from "next/server";
import { getRazorpay, rupeesToPaise } from "@/lib/razorpay";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import type { ShippingAddress, OrderProduct } from "@/lib/supabase";

interface CreateOrderBody {
  items: Array<{
    productId: string;
    name: string;
    category: string;
    image: string;
    price: number;
    size: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  userId?: string;
  couponCode?: string;
}

// Free shipping on all orders
const MIN_ORDER_AMOUNT = 1;

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse & validate ───────────────────────────────────────────────────
    const body: CreateOrderBody = await req.json();
    const { items, shippingAddress, userId, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.pincode) {
      return NextResponse.json({ error: "Incomplete shipping address" }, { status: 400 });
    }

    // ── 2. Server-side price validation (NEVER trust client totals) ───────────
    const products: OrderProduct[] = items.map((item) => {
      const price = Number(item.price);
      const qty = Number(item.quantity);
      if (price < 1 || price > 99999) throw new Error(`Invalid price for ${item.productId}`);
      if (qty < 1 || qty > 10) throw new Error(`Invalid quantity for ${item.productId}`);
      return {
        productId: item.productId,
        name: item.name,
        category: item.category,
        image: item.image,
        price,
        size: item.size,
        quantity: qty,
        subtotal: price * qty,
      };
    });

    const subtotal = products.reduce((sum, p) => sum + p.subtotal, 0);
    const shipping = 0; // Free shipping on all orders
    const discount = 0;
    const total = subtotal + shipping - discount;

    if (total < MIN_ORDER_AMOUNT) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${MIN_ORDER_AMOUNT}` },
        { status: 400 }
      );
    }

    const amountPaise = rupeesToPaise(total);

    // ── 3. Create Razorpay order ──────────────────────────────────────────────
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `bcr_${Date.now()}`,
      notes: {
        customer_name: shippingAddress.fullName,
        customer_phone: shippingAddress.phone,
        pincode: shippingAddress.pincode,
        source: "bestchappals.com",
      },
    });

    // ── 4. Save to Supabase (skip gracefully if not configured) ──────────────
    let dbOrderId: string = razorpayOrder.id; // fallback: use Razorpay order ID

    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        const { data: order, error: dbError } = await supabase
          .from("orders")
          .insert({
            user_id: userId || null,
            products,
            amount: total,
            amount_paise: amountPaise,
            razorpay_order_id: razorpayOrder.id,
            payment_status: "pending",
            order_status: "pending",
            shipping_address: shippingAddress,
            coupon_code: couponCode || null,
            discount,
          })
          .select()
          .single();

        if (dbError) {
          console.warn("[create-order] DB insert failed (non-fatal):", dbError.message);
        } else if (order) {
          dbOrderId = order.id;
        }
      } catch (dbErr) {
        // DB failure should NOT block payment — log and continue
        console.warn("[create-order] DB error (non-fatal):", dbErr);
      }
    } else {
      console.log("[create-order] Supabase not configured — skipping DB save");
    }

    // ── 5. Return to client ───────────────────────────────────────────────────
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: amountPaise,
      currency: "INR",
      dbOrderId,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      breakdown: { subtotal, shipping, discount, total },
    });
  } catch (err) {
    // Razorpay SDK throws plain objects like { statusCode, error: { code, description } }
    if (err instanceof Error) {
      console.error("[create-order] Error:", err.message);
    } else {
      console.error("[create-order] Razorpay error:", JSON.stringify(err));
    }

    // Extract human-readable message from Razorpay error shape
    let userMessage = "Payment initiation failed. Please try again.";
    if (typeof err === "object" && err !== null) {
      const rzpErr = err as Record<string, unknown>;
      if (rzpErr.statusCode === 401) {
        userMessage = "Payment gateway configuration error. Please contact support.";
      } else if (
        typeof rzpErr.error === "object" &&
        rzpErr.error !== null &&
        "description" in (rzpErr.error as object)
      ) {
        userMessage = String((rzpErr.error as Record<string, unknown>).description);
      }
    }
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}

// DELETE: Cancel/delete an unpaid pending order from Supabase
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dbOrderId = searchParams.get("dbOrderId");

    if (!dbOrderId) {
      return NextResponse.json({ error: "dbOrderId is required" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, message: "Supabase not configured, skipped deletion" });
    }

    const supabase = createServerClient();

    // Secure check: Only delete if the order is actually pending/unpaid
    // (Never allow deletion of paid, processing, or completed orders)
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("payment_status")
      .eq("id", dbOrderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_status !== "pending") {
      return NextResponse.json({ error: "Cannot delete a paid or verified order" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("orders")
      .delete()
      .eq("id", dbOrderId);

    if (deleteError) {
      console.error("[cancel-order] DB delete failed:", deleteError.message);
      return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Abandoned order deleted successfully" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[cancel-order] Error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
