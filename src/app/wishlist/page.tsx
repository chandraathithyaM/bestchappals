"use client";

import { useCartStore } from "@/lib/store";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const { wishlist } = useCartStore();
  const { products, loading } = useProducts();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div style={{ minHeight: "100vh", paddingTop: "var(--nav-h)", background: "#fafafa" }}>
      <div className="container-xl" style={{ padding: "3rem 1.5rem" }}>
        <header style={{ marginBottom: "3rem", textAlign: "center" }}>
          <p className="section-label">Your Favorites</p>
          <h1 className="section-title">My Wishlist</h1>
          <p style={{ color: "#6b7280", fontFamily: "Poppins", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            {wishlistProducts.length} item{wishlistProducts.length !== 1 ? "s" : ""} saved
          </p>
        </header>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <div className="spinner" style={{ width: 40, height: 40, border: "3px solid rgba(0,0,0,0.1)", borderTopColor: "#111", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {wishlistProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product as any} index={idx} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: "#fef2f2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                color: "#ef4444",
              }}
            >
              <Heart size={40} />
            </div>
            <h2 style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Your wishlist is empty
            </h2>
            <p style={{ color: "#6b7280", fontFamily: "Poppins", marginBottom: "2rem" }}>
              Save your favorite items to keep track of them here.
            </p>
            <Link href="/" className="btn btn-dark" style={{ padding: "1rem 2.5rem" }}>
              Start Shopping
            </Link>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
