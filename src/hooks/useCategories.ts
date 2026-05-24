import { useEffect, useState } from "react";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase";

export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount?: number;
  created_at: string;
}

const CAT_MAP: Record<string, string> = {
  "Women": "Women",
  "Slides & Flips": "Slides",
  "Crocs": "Crocs",
  "Formals & Loafers": "Formals",
  "Men's Footwear": "Men",
  "Sneakers": "Sneakers"
};

export function useCategories() {
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        const supabase = getSupabaseBrowser();
        const { data: catData } = await supabase.from("categories").select("*").order("name");
        
        const { data: prodData } = await supabase
          .from("products")
          .select("category, images, created_at")
          .order("created_at", { ascending: false });
          
        const countMap: Record<string, number> = {};
        const latestImageMap: Record<string, string> = {};
        
        (prodData || []).forEach((p: any) => {
          countMap[p.category] = (countMap[p.category] || 0) + 1;
          
          if (!latestImageMap[p.category] && p.images && p.images.length > 0) {
            latestImageMap[p.category] = p.images[0];
          }
        });

        const merged = (catData || []).map((c: any) => {
          const mappedName = CAT_MAP[c.name] || c.name;
          return {
            ...c,
            productCount: countMap[mappedName] || 0,
            image: latestImageMap[mappedName] || c.image,
          };
        });

        setCategories(merged);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
}

