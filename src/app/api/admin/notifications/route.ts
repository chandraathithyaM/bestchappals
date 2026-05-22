import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

// GET: Fetch new order notifications (orders from the last N minutes)
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = new URL(req.url);
  const sinceParam = url.searchParams.get("since");

  const supabase = createServerClient();

  // If "since" timestamp is provided, fetch orders newer than that
  // Otherwise, fetch orders from the last 5 minutes
  let sinceDate: string;
  if (sinceParam) {
    sinceDate = sinceParam;
  } else {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    sinceDate = fiveMinAgo.toISOString();
  }

  const { data: newOrders, error } = await supabase
    .from("orders")
    .select("id, amount, shipping_address, payment_status, order_status, created_at")
    .gt("created_at", sinceDate)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    notifications: (newOrders || []).map((order: any) => ({
      id: order.id,
      customerName: order.shipping_address?.fullName || "Customer",
      amount: Number(order.amount),
      status: order.order_status,
      createdAt: order.created_at,
    })),
    serverTime: new Date().toISOString(),
  });
}
