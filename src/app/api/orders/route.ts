import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { products as localCatalog } from "@/lib/products";

export async function GET(req: NextRequest) {
  try {
    // ── 1. Auth check ─────────────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ orders: [] });
    }

    // ── 2. Fetch orders from Supabase ─────────────────────────────────────────
    const supabase = createServerClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[orders] Supabase error:", error.message);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    // ── 3. Automatically heal missing product images ──────────────────────────
    if (orders && orders.length > 0) {
      const productIdsToFetch = new Set<string>();
      for (const order of orders) {
        if (Array.isArray(order.products)) {
          for (const p of order.products) {
            if (!p.image && p.productId) {
              productIdsToFetch.add(p.productId);
            }
          }
        }
      }

      const productMap = new Map<string, string>();

      // Fetch from Supabase DB first
      if (productIdsToFetch.size > 0) {
        const { data: dbProducts } = await supabase
          .from("products")
          .select("id, images")
          .in("id", Array.from(productIdsToFetch));

        if (dbProducts && dbProducts.length > 0) {
          for (const dp of dbProducts) {
            if (dp.images && dp.images.length > 0) {
              productMap.set(dp.id, dp.images[0]);
            }
          }
        }
      }

      // Check local catalog fallback, and update orders
      for (const order of orders) {
        if (Array.isArray(order.products)) {
          for (const p of order.products) {
            if (!p.image && p.productId) {
              let resolvedImg = productMap.get(p.productId);
              if (!resolvedImg) {
                // Try to find in local catalog
                const localProd = localCatalog.find((lp) => lp.id === p.productId);
                resolvedImg = localProd?.images?.[0] || localProd?.image;
              }
              p.image = resolvedImg || "/placeholder.jpg";
            }
          }
        }
      }
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[orders] Error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
