import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { products } from "@/lib/products";

// One-time migration endpoint
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createServerClient();
  
  console.log(`Starting migration of ${products.length} products...`);

  // 1. Migrate Categories first (unique categories from products)
  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
  for (const catName of uniqueCategories) {
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await supabase.from("categories").upsert({
      name: catName,
      slug: slug,
    }, { onConflict: "name" });
  }

  // 2. Migrate Products
  const formattedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || `Premium ${p.category} footwear.`,
    category: p.category,
    subcategory: p.subcategory || "",
    brand: "BestChappals",
    price: p.price,
    offer_price: (p as any).originalPrice || null,
    images: (p as any).images || [(p as any).image],
    sizes: (p as any).sizes.map((s: string) => ({ size: s, stock: 10 })),
    stock: 60,
    trending: (p as any).isTrending || false,
    featured: (p as any).isFeatured || false,
    is_new: (p as any).isNew || false,
    tags: p.tags || [],
    out_of_stock: false
  }));

  const { error } = await supabase.from("products").upsert(formattedProducts, { onConflict: "id" });

  if (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true, 
    message: `Migrated ${formattedProducts.length} products and categories.` 
  });
}
