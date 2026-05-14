import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Clerk webhook handler — syncs user data to Supabase
// Configure in Clerk Dashboard → Webhooks → Add endpoint → URL: /api/webhooks/clerk
// Events: user.created, user.updated, user.deleted
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    const supabase = createServerClient();

    switch (type) {
      case "user.created":
      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address || null;
        const { error } = await supabase
          .from("users")
          .upsert({
            id: data.id,
            email,
            first_name: data.first_name || null,
            last_name: data.last_name || null,
            phone: data.phone_numbers?.[0]?.phone_number || null,
            image_url: data.image_url || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });

        if (error) console.error("[clerk-webhook] upsert error:", error.message);
        break;
      }
      case "user.deleted": {
        const { error } = await supabase
          .from("users")
          .delete()
          .eq("id", data.id);
        if (error) console.error("[clerk-webhook] delete error:", error.message);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[clerk-webhook] error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
