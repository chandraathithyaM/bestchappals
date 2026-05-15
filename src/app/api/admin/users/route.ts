import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { createClerkClient } from "@clerk/nextjs/server";

// GET: List/search users
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = createServerClient();

  // ─── CLERK SYNC ────────────────────────────────────────────────────────────
  // If this is the first page and no search, sync users from Clerk to ensure 
  // the DB is populated (fallback for missing/failed webhooks).
  if (page === 1 && !search) {
    try {
      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      // Use getUserList to fetch users. Note: for very large user bases, 
      // you might want to paginate this or use a more targeted sync.
      const { data: clerkUsers } = await clerk.users.getUserList();
      
      if (clerkUsers && clerkUsers.length > 0) {
        const usersToUpsert = clerkUsers.map(u => ({
          id: u.id,
          email: u.emailAddresses[0]?.emailAddress || null,
          first_name: u.firstName || null,
          last_name: u.lastName || null,
          phone: u.phoneNumbers[0]?.phoneNumber || null,
          image_url: u.imageUrl || null,
          updated_at: new Date().toISOString()
        }));

        // Upsert only profile fields, preserving total_orders and total_spent
        await supabase.from("users").upsert(usersToUpsert, { 
          onConflict: "id",
          ignoreDuplicates: false 
        });
      }
    } catch (err) {
      console.error("[admin-users-sync] Clerk sync failed:", err);
      // Continue anyway to show whatever is in Supabase
    }
  }

  let query = supabase.from("users").select("*", { count: "exact" });

  if (search) {
    query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    users: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// PUT: Block/unblock user
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { userId, is_blocked } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("users")
    .update({ is_blocked })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ user: data });
}
