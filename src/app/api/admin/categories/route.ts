import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

// GET: List categories with product counts
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createServerClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get product counts per category
  const { data: products } = await supabase.from("products").select("category");
  const countMap: Record<string, number> = {};
  (products || []).forEach((p: any) => {
    countMap[p.category] = (countMap[p.category] || 0) + 1;
  });

  const result = (categories || []).map((c: any) => ({
    ...c,
    productCount: countMap[c.name] || 0,
  }));

  return NextResponse.json({ categories: result });
}

// POST: Create category
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { name, slug, image } = await req.json();
  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug, image: image || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ category: data }, { status: 201 });
}

// PUT: Update category
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, name, slug } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Category ID required" }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (name) updates.name = name;
  if (slug) updates.slug = slug;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ category: data });
}

// DELETE: Delete category
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await req.json();
  const supabase = createServerClient();

  // Check if products exist in this category
  const { data: cat } = await supabase.from("categories").select("name").eq("id", id).single();
  if (cat) {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", cat.name);
    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${count} products in this category` },
        { status: 400 }
      );
    }
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
