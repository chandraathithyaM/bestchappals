import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { products as localCatalog } from "@/lib/products";

// GET: List orders with filters
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const statuses = url.searchParams.get("statuses") || "";
  const paymentStatus = url.searchParams.get("paymentStatus") || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = createServerClient();
  let query = supabase.from("orders").select("*", { count: "exact" });

  if (status) {
    query = query.eq("order_status", status);
  } else if (statuses) {
    query = query.in("order_status", statuses.split(",").map(s => s.trim()));
  }
  if (paymentStatus) query = query.eq("payment_status", paymentStatus);
  if (search) {
    query = query.or(`payment_id.ilike.%${search}%,razorpay_order_id.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Heal missing product details from products table or local catalog
  if (data && data.length > 0) {
    const productIdsToFetch = new Set<string>();
    for (const order of data) {
      if (Array.isArray(order.products)) {
        for (const p of order.products) {
          if (p.productId) {
            productIdsToFetch.add(p.productId);
          }
        }
      }
    }

    const dbProductMap = new Map<string, any>();
    if (productIdsToFetch.size > 0) {
      const { data: dbProducts } = await supabase
        .from("products")
        .select("id, name, category, images, sizes")
        .in("id", Array.from(productIdsToFetch));

      for (const dp of dbProducts || []) {
        dbProductMap.set(dp.id, dp);
      }
    }

    for (const order of data) {
      if (Array.isArray(order.products)) {
        for (const p of order.products) {
          if (p.productId) {
            const dbProd = dbProductMap.get(p.productId);
            const localProd = localCatalog.find((lp) => lp.id === p.productId);

            if (!p.image || p.image === "/placeholder.jpg") {
              p.image = dbProd?.images?.[0] || localProd?.images?.[0] || localProd?.image || "/placeholder.jpg";
            }
            if (!p.name) {
              p.name = dbProd?.name || localProd?.name || "Product";
            }
            if (!p.category) {
              p.category = dbProd?.category || localProd?.category || "Footwear";
            }
            if (!p.size) {
              // Try to get default size
              const sizesList = dbProd?.sizes || localProd?.sizes || [];
              const firstSize = typeof sizesList[0] === 'string' ? sizesList[0] : sizesList[0]?.size;
              p.size = firstSize || "N/A";
            }
          }
        }
      }
    }
  }

  return NextResponse.json({
    orders: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// PUT: Update order status
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { orderId, order_status, payment_status } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (order_status) updates.order_status = order_status;
  if (payment_status) updates.payment_status = payment_status;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ order: data });
}
