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
        // Fetch categories and their product counts
        const supabase = getSupabaseBrowser();
        const { data: catData } = await supabase.from("categories").select("*").order("name");
        
        const { data: prodData } = await supabase.from("products").select("category");
        const countMap: Record<string, number> = {};
        (prodData || []).forEach((p: any) => {
          countMap[p.category] = (countMap[p.category] || 0) + 1;
        });

        const merged = (catData || []).map((c: any) => ({
          ...c,
          productCount: countMap[c.name] || 0,
        }));

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
