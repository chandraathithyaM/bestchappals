"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function NewArrivalsPage() {
  const { products: allItems, loading: productsLoading } = useProducts({
    limit: 50, // Fetch up to 50 recent items
  });

  const PAGE_SIZE = 9;
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const shown     = allItems.slice(0, visible);
  const remaining = allItems.length - visible;
  const hasMore   = remaining > 0;

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => { setVisible((v) => v + PAGE_SIZE); setLoadingMore(false); }, 500);
  };

  return (
    <>
      <div style={{ paddingTop: 72, background: "#f5f5f5" }}>
        <div className="container-xl" style={{ padding: "4rem 1.5rem 3rem" }}>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="section-label" style={{ marginBottom: 10 }}>
            Just Dropped
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} className="section-title">
            New Arrivals
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ color: "#6b7280", fontFamily: "Poppins", fontSize: "0.85rem", marginTop: 8 }}>
            {productsLoading ? "Loading..." : `${allItems.length} new products · Fresh from the store`}
          </motion.p>
        </div>
      </div>

      <section style={{ padding: "4rem 0 6rem", background: "#fff" }}>
        <div className="container-xl">
          {productsLoading ? (
             <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
                <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#111" }} />
             </div>
          ) : allItems.length > 0 ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }} className="na-grid">
                <AnimatePresence mode="popLayout">
                  {shown.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, delay: i >= PAGE_SIZE ? (i % PAGE_SIZE) * 0.05 : 0 }}
                    >
                      <ProductCard product={product as any} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {hasMore && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "3.5rem", gap: "0.75rem" }}>
                  <p style={{ fontFamily: "Poppins", fontSize: "0.8rem", color: "#9ca3af" }}>
                    Showing {shown.length} of {allItems.length} products
                  </p>
                  <button
                    id="load-more-new-arrivals"
                    onClick={loadMore}
                    disabled={loadingMore}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      padding: "14px 40px",
                      background: loadingMore ? "#f3f4f6" : "#111",
                      color: loadingMore ? "#9ca3af" : "#fff",
                      border: "none", borderRadius: 100,
                      fontFamily: "Montserrat", fontWeight: 700,
                      fontSize: "0.78rem", letterSpacing: "0.08em",
                      textTransform: "uppercase", cursor: loadingMore ? "not-allowed" : "pointer",
                      boxShadow: loadingMore ? "none" : "0 8px 24px rgba(17,17,17,0.18)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={e => { if (!loadingMore) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                  >
                    {loadingMore
                      ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…</>
                      : <>Load More <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:20, height:20, borderRadius:"50%", background:"rgba(255,255,255,0.2)", fontSize:"0.65rem", fontWeight:900 }}>{Math.min(remaining, PAGE_SIZE)}</span></>
                    }
                  </button>
                </div>
              )}

              {!hasMore && visible > PAGE_SIZE && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: "center", marginTop: "2.5rem", fontFamily: "Poppins", fontSize: "0.8rem", color: "#9ca3af" }}>
                  ✓ All {allItems.length} new arrivals shown
                </motion.p>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <p style={{ fontFamily: "Poppins", color: "#6b7280" }}>No products found in the database.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <style>{`
        @media(max-width:1024px){.na-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:480px){.na-grid{grid-template-columns:repeat(2,1fr)!important;gap:0.75rem!important;}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
    </>
  );
}
