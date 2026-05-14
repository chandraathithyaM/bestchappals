"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  title: string;
  label: string;
  filter: "trending" | "new" | "featured" | "all";
  viewAllHref?: string;
  limit?: number;
  bg?: string;
}

export default function ProductGrid({ title, label, filter, viewAllHref, limit = 6, bg = "#ffffff" }: Props) {
  const { products: allProducts, loading: initialLoading } = useProducts({
    trending: filter === "trending" ? true : undefined,
    featured: filter === "featured" ? true : undefined,
    isNew: undefined, // Don't filter by flag, just take the most recent
    limit: filter === "new" ? 30 : 60, // Fetch up to 30 for new arrivals, or 60 for others
  });

  const [visibleCount, setVisibleCount] = useState(limit);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  const filtered = allProducts;
  const visible   = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visibleCount;
  const hasMore   = remaining > 0;

  const loadMore = () => {
    setLoadMoreLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 6);
      setLoadMoreLoading(false);
    }, 600);
  };

  return (
    <section style={{ padding: "6rem 0", background: bg }}>
      <div className="container-xl">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-label"
              style={{ marginBottom: 10 }}
            >
              {label}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-title"
            >
              {title}
            </motion.h2>
          </div>

          {viewAllHref && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link
                href={viewAllHref}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "Montserrat",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#111",
                  textDecoration: "none",
                  borderBottom: "1.5px solid #111",
                  paddingBottom: 2,
                }}
              >
                View All <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Grid */}
        {initialLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#6366f1" }} />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
            className="product-grid"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i >= limit ? (i - visibleCount + 6) * 0.07 : 0 }}
                >
                  <ProductCard product={product as any} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "3rem",
              gap: "0.75rem",
            }}
          >
            <p
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "0.8rem",
                color: "#9ca3af",
                letterSpacing: "0.02em",
              }}
            >
              Showing {visible.length} of {filtered.length} products
            </p>

            <button
              onClick={loadMore}
              disabled={loadMoreLoading}
              id={`load-more-${filter}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 36px",
                background: loadMoreLoading ? "#f3f4f6" : "#111111",
                color: loadMoreLoading ? "#9ca3af" : "#ffffff",
                border: "none",
                borderRadius: 100,
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: loadMoreLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: loadMoreLoading ? "none" : "0 8px 24px rgba(17,17,17,0.18)",
              }}
              onMouseEnter={e => {
                if (!loadMoreLoading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 32px rgba(17,17,17,0.28)";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = loadMoreLoading ? "none" : "0 8px 24px rgba(17,17,17,0.18)";
              }}
            >
              {loadMoreLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Loading…
                </>
              ) : (
                <>
                  Load More
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20, height: 20,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      fontSize: "0.65rem",
                      fontWeight: 900,
                    }}
                  >
                    {remaining > 6 ? "6+" : remaining}
                  </span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* All loaded state */}
        {!hasMore && visibleCount > limit && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center",
              marginTop: "2.5rem",
              fontFamily: "Poppins, sans-serif",
              fontSize: "0.8rem",
              color: "#9ca3af",
            }}
          >
            ✓ All {filtered.length} products shown
          </motion.p>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.75rem !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
