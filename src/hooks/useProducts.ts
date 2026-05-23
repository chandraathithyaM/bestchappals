import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase";

export interface DBProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  offer_price: number | null;
  images: string[];
  sizes: { size: string; stock: number }[];
  stock: number;
  trending: boolean;
  featured: boolean;
  is_new: boolean;
  out_of_stock: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch products from Supabase with realtime subscription.
 * When admin updates a product, users see changes instantly.
 */
export function useProducts(opts?: {
  category?: string;
  trending?: boolean;
  featured?: boolean;
  isNew?: boolean;
  limit?: number;
}) {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowser();
      let query = supabase.from("products").select("*");

      if (opts?.category) query = query.ilike("category", opts.category);
      if (opts?.trending) query = query.eq("trending", true);
      if (opts?.featured) query = query.eq("featured", true);
      if (opts?.isNew) query = query.eq("is_new", true);

      query = query.order("created_at", { ascending: false });
      if (opts?.limit) query = query.limit(opts.limit);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [opts?.category, opts?.trending, opts?.featured, opts?.isNew, opts?.limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Realtime subscription — updates when admin changes products
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel(`products-realtime-${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          // Refetch when any product changes
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

/**
 * Get a single product by ID with realtime updates.
 */
export function useProduct(id: string) {
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !id) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowser();

    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      setProduct(data);
      setLoading(false);
    };

    fetchProduct();

    const channel = supabase
      .channel(`product-${id}-${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products", filter: `id=eq.${id}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setProduct(null);
          } else {
            setProduct(payload.new as DBProduct);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return { product, loading };
}
