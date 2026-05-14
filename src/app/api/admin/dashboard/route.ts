import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createServerClient();

  // Run all queries in parallel
  const [
    productsRes,
    ordersRes,
    revenueRes,
    usersRes,
    oosRes,
    trendingRes,
    recentOrdersRes,
    recentUsersRes,
    monthlyRes,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("amount").eq("payment_status", "paid"),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("out_of_stock", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("trending", true),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("users").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("orders").select("amount, created_at").eq("payment_status", "paid").order("created_at", { ascending: true }),
  ]);

  const totalRevenue = (revenueRes.data || []).reduce((s: number, o: any) => s + Number(o.amount), 0);

  // Build monthly sales data
  const monthlyMap: Record<string, { revenue: number; count: number }> = {};
  (monthlyRes.data || []).forEach((o: any) => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, count: 0 };
    monthlyMap[key].revenue += Number(o.amount);
    monthlyMap[key].count += 1;
  });
  const monthlySales = Object.entries(monthlyMap)
    .map(([month, data]) => ({ month, ...data }))
    .slice(-12);

  return NextResponse.json({
    totalProducts: productsRes.count || 0,
    totalOrders: ordersRes.count || 0,
    totalRevenue,
    totalUsers: usersRes.count || 0,
    outOfStock: oosRes.count || 0,
    trendingCount: trendingRes.count || 0,
    recentOrders: recentOrdersRes.data || [],
    recentUsers: recentUsersRes.data || [],
    monthlySales,
  });
}
