import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

// GET: List products with search, filter, pagination
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const trending = url.searchParams.get("trending");
  const outOfStock = url.searchParams.get("outOfStock");

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = createServerClient();
  let query = supabase.from("products").select("*", { count: "exact" });

  if (search) query = query.ilike("name", `%${search}%`);
  if (category) query = query.eq("category", category);
  if (trending === "true") query = query.eq("trending", true);
  if (outOfStock === "true") query = query.eq("out_of_stock", true);

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// POST: Create new product
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { name, description, category, subcategory, brand, price, offer_price, images, sizes, stock, trending, featured, is_new, out_of_stock, tags } = body;

  if (!name || !category || !price) {
    return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name, description: description || "", category,
      subcategory: subcategory || "", brand: brand || "BestChappals",
      price: Number(price), offer_price: offer_price ? Number(offer_price) : null,
      images: images || [], sizes: sizes || [],
      stock: stock || 0, trending: trending || false,
      featured: featured || false, is_new: is_new || false,
      out_of_stock: out_of_stock || false, tags: tags || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}
