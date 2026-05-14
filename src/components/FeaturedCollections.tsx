"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";

export default function FeaturedCollections() {
  const { categories: dbCategories, loading } = useCategories();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "6rem 0" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#111" }} />
      </div>
    );
  }

  if (dbCategories.length === 0) return null;

  return (
    <section style={{ padding: "6rem 0", background: "#ffffff" }}>
      <div className="container-xl">
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label"
            style={{ marginBottom: 12 }}
          >
            Collections
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title"
          >
            Shop by Category
          </motion.h2>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
          }}
          className="collections-grid"
        >
          {/* Large card — first */}
          {dbCategories.slice(0, 1).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ gridRow: "span 2" }}
              className="collection-large"
            >
              <Link href={`/category/${cat.slug}`}>
                <div
                  className="hover-zoom"
                  style={{
                    position: "relative",
                    height: "100%",
                    minHeight: 480,
                    borderRadius: 20,
                    overflow: "hidden",
                    background: "#f5f5f5"
                  }}
                >
                  <Image
                    src={cat.image || "/placeholder.jpg"}
                    alt={cat.name}
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                  <div className="overlay-bottom" />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 24,
                      left: 24,
                      right: 24,
                      color: "#fff",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.65rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        fontFamily: "Montserrat",
                        fontWeight: 600,
                        marginBottom: 6,
                        opacity: 0.7,
                      }}
                    >
                      {cat.productCount}+ styles
                    </p>
                    <h3
                      style={{
                        fontFamily: "Montserrat",
                        fontWeight: 800,
                        fontSize: "1.6rem",
                        lineHeight: 1.1,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {cat.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        marginTop: 8,
                        opacity: 0.7,
                        fontFamily: "Poppins",
                      }}
                    >
                      Shop Collection →
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Smaller cards */}
          {dbCategories.slice(1, 6).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i + 1) * 0.1 }}
            >
              <Link href={`/category/${cat.slug}`}>
                <div
                  className="hover-zoom"
                  style={{
                    position: "relative",
                    height: 200,
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#f5f5f5"
                  }}
                >
                  <Image
                    src={cat.image || "/placeholder.jpg"}
                    alt={cat.name}
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                  <div className="overlay-soft" />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 16,
                      left: 16,
                      right: 16,
                      color: "#fff",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "Montserrat",
                        fontWeight: 800,
                        fontSize: "1rem",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: "0.65rem", opacity: 0.7, fontFamily: "Poppins" }}>
                      {cat.productCount}+ styles
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>


      <style>{`
        @media (max-width: 1024px) {
          .collections-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .collection-large { grid-row: span 1 !important; }
        }
        @media (max-width: 640px) {
          .collections-grid { grid-template-columns: 1fr 1fr !important; }
          .collection-large { grid-column: span 2; }
        }
      `}</style>
    </section>
  );
}
