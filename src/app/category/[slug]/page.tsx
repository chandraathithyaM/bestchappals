"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/lib/products";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const SLUG_MAP: Record<string, string> = {
  men: "Men",
  women: "Women",
  sneakers: "Sneakers",
  slides: "Slides",
  crocs: "Crocs",
  formals: "Formals",
};

const PAGE_SIZE = 9;

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const categoryName = SLUG_MAP[slug] ?? slug;

  const { products: allItems, loading: initialLoading } = useProducts({
    category: slug === "all" ? undefined : categoryName,
  });

  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  const shown     = allItems.slice(0, visible);
  const remaining = allItems.length - visible;
  const hasMore   = remaining > 0;

  const loadMore = () => {
    setLoadMoreLoading(true);
    setTimeout(() => {
      setVisible((v) => v + PAGE_SIZE);
      setLoadMoreLoading(false);
    }, 500);
  };


  return (
    <>
      {/* Header */}
      <div style={{ paddingTop: 72, background: "#f5f5f5" }}>
        <div className="container-xl" style={{ padding: "4rem 1.5rem 3rem" }}>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="section-label" style={{ marginBottom: 10 }}>
            Collection
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} className="section-title">
            {categoryName}&apos;s Footwear
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ color: "#6b7280", fontFamily: "Poppins", fontSize: "0.85rem", marginTop: 8 }}>
            {allItems.length} products available · All India delivery
          </motion.p>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", overflowX: "auto" }}>
        <div className="container-xl">
          <div style={{ display: "flex", gap: 8, padding: "1rem 0", whiteSpace: "nowrap" }}>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`}
                style={{
                  padding: "6px 16px", borderRadius: 100,
                  fontFamily: "Montserrat", fontWeight: 600,
                  fontSize: "0.72rem", letterSpacing: "0.06em",
                  textTransform: "uppercase", textDecoration: "none",
                  background: cat.slug === slug ? "#111" : "transparent",
                  color: cat.slug === slug ? "#fff" : "#6b7280",
                  border: cat.slug === slug ? "none" : "1px solid #e5e7eb",
                  transition: "all 0.2s",
                }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <section style={{ padding: "4rem 0 6rem", background: "#fff" }}>
        <div className="container-xl">
          {initialLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "6rem 0" }}>
              <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: "#111" }} />
            </div>
          ) : allItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "6rem 0", color: "#9ca3af" }}>
              <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "1.2rem" }}>No products found</p>
              <Link href="/" className="btn btn-dark" style={{ display: "inline-flex", marginTop: 20 }}>Back to Home</Link>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }} className="cat-grid">
                <AnimatePresence mode="popLayout">
                  {shown.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, delay: i >= PAGE_SIZE ? (i % PAGE_SIZE) * 0.05 : 0 }}
                    >
                      <ProductCard product={product as any} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
 
               {/* Load More */}
               {hasMore && (
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "3.5rem", gap: "0.75rem" }}>
                   <p style={{ fontFamily: "Poppins", fontSize: "0.8rem", color: "#9ca3af" }}>
                     Showing {shown.length} of {allItems.length} products
                   </p>
                   <button
                     id={`load-more-${slug}`}
                     onClick={loadMore}
                     disabled={loadMoreLoading}
                     style={{
                       display: "inline-flex", alignItems: "center", gap: 10,
                       padding: "14px 40px",
                       background: loadMoreLoading ? "#f3f4f6" : "#111",
                       color: loadMoreLoading ? "#9ca3af" : "#fff",
                       border: "none", borderRadius: 100,
                       fontFamily: "Montserrat", fontWeight: 700,
                       fontSize: "0.78rem", letterSpacing: "0.08em",
                       textTransform: "uppercase", cursor: loadMoreLoading ? "not-allowed" : "pointer",
                       boxShadow: loadMoreLoading ? "none" : "0 8px 24px rgba(17,17,17,0.18)",
                       transition: "all 0.3s ease",
                     }}
                     onMouseEnter={e => { if (!loadMoreLoading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; } }}
                     onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                   >
                     {loadMoreLoading
                       ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…</>
                       : <>Load More <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:20, height:20, borderRadius:"50%", background:"rgba(255,255,255,0.2)", fontSize:"0.65rem", fontWeight:900 }}>{Math.min(remaining, PAGE_SIZE)}</span></>
                     }
                   </button>
                 </div>
               )}


              {!hasMore && visible > PAGE_SIZE && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: "center", marginTop: "2.5rem", fontFamily: "Poppins", fontSize: "0.8rem", color: "#9ca3af" }}>
                  ✓ All {allItems.length} products shown
                </motion.p>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
      <style>{`
        @media(max-width:1024px){.cat-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:480px){.cat-grid{grid-template-columns:repeat(2,1fr)!important;gap:0.75rem!important;}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
    </>
  );
}
