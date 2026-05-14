import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Lazy-initialized clients ─────────────────────────────────────────────────
// We never call createClient at module level — only on first use.
// This prevents crashes when env vars are missing or placeholder values.

let _browserClient: SupabaseClient | null = null;

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Returns true if Supabase is properly configured */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key && isValidUrl(url);
}

/** Browser-safe Supabase client (lazy) */
export function getSupabaseBrowser(): SupabaseClient {
  if (_browserClient) return _browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!isValidUrl(url)) throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: "${url}"`);
  _browserClient = createClient(url, key);
  return _browserClient;
}

/** Server-side Supabase client — uses service role if available (lazy) */
export function createServerClient(): SupabaseClient {
  // Always create a fresh server client (not cached) to avoid state leaking between requests
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!isValidUrl(url)) throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: "${url}"`);
  return createClient(url, key);
}

/** Safe getter — only call this after confirming isSupabaseConfigured() */
export function getSupabase(): SupabaseClient {
  return getSupabaseBrowser();
}

// ─── Database Types ────────────────────────────────────────────────────────────
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderProduct {
  productId: string;
  name: string;
  category: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  products: OrderProduct[];
  amount: number;
  amount_paise: number;
  payment_id: string | null;
  razorpay_order_id: string | null;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_address: ShippingAddress;
  coupon_code: string | null;
  discount: number;
  created_at: string;
  updated_at: string;
}
