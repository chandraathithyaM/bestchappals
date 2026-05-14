import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

// GET: Export orders as CSV
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createServerClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build CSV
  const headers = [
    "Order ID", "Date", "Customer", "Phone", "Email", "Amount",
    "Payment Status", "Order Status", "Payment ID", "City", "Pincode"
  ];

  const rows = (orders || []).map((o: any) => {
    const addr = o.shipping_address || {};
    return [
      o.id,
      new Date(o.created_at).toLocaleDateString("en-IN"),
      addr.fullName || "N/A",
      addr.phone || "N/A",
      addr.email || "N/A",
      o.amount,
      o.payment_status,
      o.order_status,
      o.payment_id || "N/A",
      addr.city || "N/A",
      addr.pincode || "N/A",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders_${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
