import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";

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

    return NextResponse.json({ orders: orders || [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[orders] Error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
