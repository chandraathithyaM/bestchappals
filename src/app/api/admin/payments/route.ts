import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createServerClient();

  // Get all paid orders for analytics
  const { data: orders } = await supabase
    .from("orders")
    .select("amount, payment_status, payment_id, created_at, shipping_address, user_id")
    .order("created_at", { ascending: false });

  const allOrders = orders || [];
  const paidOrders = allOrders.filter((o: any) => o.payment_status === "paid");
  const failedOrders = allOrders.filter((o: any) => o.payment_status === "failed");

  // Daily revenue (last 30 days)
  const dailyMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().split("T")[0]] = 0;
  }
  paidOrders.forEach((o: any) => {
    const day = new Date(o.created_at).toISOString().split("T")[0];
    if (dailyMap[day] !== undefined) dailyMap[day] += Number(o.amount);
  });
  const dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));

  // Monthly revenue
  const monthlyMap: Record<string, number> = {};
  paidOrders.forEach((o: any) => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = (monthlyMap[key] || 0) + Number(o.amount);
  });
  const monthlyRevenue = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  // Top customers
  const customerMap: Record<string, { name: string; email: string; spent: number; orders: number }> = {};
  paidOrders.forEach((o: any) => {
    const uid = o.user_id || "guest";
    const addr = o.shipping_address || {};
    if (!customerMap[uid]) {
      customerMap[uid] = { name: addr.fullName || "Guest", email: addr.email || "", spent: 0, orders: 0 };
    }
    customerMap[uid].spent += Number(o.amount);
    customerMap[uid].orders += 1;
  });
  const topCustomers = Object.values(customerMap).sort((a, b) => b.spent - a.spent).slice(0, 10);

  return NextResponse.json({
    totalRevenue: paidOrders.reduce((s: number, o: any) => s + Number(o.amount), 0),
    successfulPayments: paidOrders.length,
    failedPayments: failedOrders.length,
    dailyRevenue,
    monthlyRevenue,
    topCustomers,
    recentTransactions: allOrders.slice(0, 20).map((o: any) => ({
      paymentId: o.payment_id,
      amount: o.amount,
      status: o.payment_status,
      date: o.created_at,
      customer: o.shipping_address?.fullName || "N/A",
    })),
  });
}
