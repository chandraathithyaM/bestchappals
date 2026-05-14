import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

// GET: List coupons
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ coupons: data || [] });
}

// POST: Create coupon
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { code, description, discount_type, discount_value, min_order, max_discount, usage_limit, expires_at } = body;

  if (!code || !discount_value) {
    return NextResponse.json({ error: "Code and discount value required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: code.toUpperCase(),
      description: description || "",
      discount_type: discount_type || "percentage",
      discount_value: Number(discount_value),
      min_order: min_order ? Number(min_order) : 0,
      max_discount: max_discount ? Number(max_discount) : null,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      expires_at: expires_at || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ coupon: data }, { status: 201 });
}

// PUT: Update coupon
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ coupon: data });
}

// DELETE: Delete coupon
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await req.json();
  const supabase = createServerClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
