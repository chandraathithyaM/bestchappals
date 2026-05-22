"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { Loader2, ShoppingBag } from "lucide-react";

const GALLERY_IMAGES = [
  "/products/first_prefer_Ladies/img-1.jpg",
  "/products/first_prefer_sneakers/img-8.jpg",
  "/products/first_prefer_slides/img-4.jpg",
  "/products/first_prefer_crocks/img-6.jpg",
  "/products/first_prefer_Ladies/img-5.jpg",
  "/products/first_prefer_Mens&Boys/img-14.jpg",
  "/products/first_prefer_Ladies/img-13.jpg",
  "/products/first_prefer_sneakers/img-3.jpg",
  "/products/first_prefer_formals/img-4.jpg",
];

export default function InstagramGallery() {
  const { products, loading } = useProducts({ limit: 9 });

  const displayItems = products.length > 0
    ? products.map((p, idx) => ({
        id: p.id,
        src: p.images?.[0] || p.image || "/placeholder.jpg",
        name: p.name,
        category: p.category,
        price: p.offer_price || p.price,
        isSupabase: true,
      }))
    : GALLERY_IMAGES.map((src, i) => ({
        id: `local-${i}`,
        src,
        name: `Latest Style ${i + 1}`,
        category: "Footwear",
        price: 299,
        isSupabase: false,
      }));

  return (
    <section style={{ padding: "6rem 0", background: "#ffffff" }}>
      <div className="container-xl">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label"
            style={{ marginBottom: 12 }}
          >
            @best_chappals_puliampatti
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title"
          >
            Our Latest Drops
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{ color: "#6b7280", fontFamily: "Poppins", fontSize: "0.9rem", marginTop: 12 }}
          >
            Explore our freshest catalog additions sourced directly from our collection
          </motion.p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "6rem 0" }}>
            <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: "#2563EB" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }} className="gallery-grid">
            {displayItems.map((item, i) => {
              const content = (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  style={{
                    position: "relative",
                    aspectRatio: "4/5",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#f3f4f6",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  }}
                  className="gallery-item-wrap"
                >
                  <Image
                    src={item.src}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
                    unoptimized
                    className="gallery-item-img"
                  />
                  
                  {/* Glassmorphic hover overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(17,17,17,0.85) 0%, rgba(17,17,17,0.3) 100%)",
                      backdropFilter: "blur(3px)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "1.5rem",
                      color: "#ffffff",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Poppins",
                        fontSize: "0.65rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.7)",
                        marginBottom: 4,
                      }}
                    >
                      {item.category}
                    </span>
                    <h3
                      style={{
                        fontFamily: "Montserrat",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                        marginBottom: 8,
                      }}
                    >
                      {item.name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                      <span
                        style={{
                          fontFamily: "Montserrat",
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "#3b82f6",
                        }}
                      >
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontFamily: "Poppins",
                          fontWeight: 600,
                          fontSize: "0.72rem",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          background: "rgba(255, 255, 255, 0.15)",
                          padding: "6px 12px",
                          borderRadius: 100,
                          backdropFilter: "blur(4px)",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        <ShoppingBag size={12} /> Shop Now
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              );

              if (item.isSupabase) {
                return (
                  <Link href={`/product/${item.id}`} key={item.id} style={{ textDecoration: "none" }}>
                    {content}
                  </Link>
                );
              }

              return (
                <a
                  href="https://www.instagram.com/best_chappals_puliampatti__/"
                  target="_blank"
                  rel="noopener noreferrer"
                  key={item.id}
                  style={{ textDecoration: "none" }}
                >
                  {content}
                </a>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginTop: "3.5rem" }}
        >
          <a
            href="https://www.instagram.com/best_chappals_puliampatti__/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            id="follow-instagram"
          >
            Follow @best_chappals_puliampatti
          </a>
        </motion.div>
      </div>
      <style>{`
        @media(max-width:1024px){
          .gallery-grid{grid-template-columns:repeat(2,1fr)!important;gap:0.75rem!important;}
        }
        @media(max-width:640px){
          .gallery-grid{grid-template-columns:repeat(2,1fr)!important;gap:0.5rem!important;}
        }
        .gallery-item-wrap:hover .gallery-item-img {
          transform: scale(1.06);
        }
      `}</style>
    </section>
  );
}

