"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch all products for client-side filtering
  const { products, loading } = useProducts({ limit: 200 });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter products
  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.subcategory?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [products, debouncedQuery]);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleResultClick = (productId: string) => {
    onClose();
    router.push(`/product/${productId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              zIndex: 200,
            }}
          />

          {/* Search Panel */}
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              maxHeight: "85vh",
              background: "var(--bg)",
              zIndex: 201,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Search Input Area */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "1.5rem 2rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <Search size={22} style={{ color: "var(--muted)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories, brands..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "1.1rem",
                  color: "var(--fg)",
                }}
              />
              <button
                onClick={onClose}
                id="close-search"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  color: "var(--fg)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem 2rem 2rem",
              }}
              data-lenis-prevent
            >
              {!debouncedQuery ? (
                /* Empty state */
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "3rem 0",
                    gap: 12,
                    color: "var(--muted)",
                  }}
                >
                  <Search size={40} strokeWidth={1} />
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Start typing to search
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    Search by product name, category, or brand
                  </p>
                </div>
              ) : loading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "3rem 0",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      border: "3px solid var(--border)",
                      borderTopColor: "var(--accent)",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : results.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: 8,
                    }}
                  >
                    {results.length} result{results.length !== 1 ? "s" : ""} found
                  </p>
                  {results.map((product, i) => {
                    const price = (product as any).price || (product as any).originalPrice || 0;
                    const offerPrice = (product as any).offer_price || (product as any).offerPrice || price;
                    const sellingPrice = offerPrice < price ? offerPrice : price;
                    const hasDiscount = price > sellingPrice;
                    return (
                      <motion.button
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleResultClick(product.id)}
                        id={`search-result-${product.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "10px 12px",
                          background: "transparent",
                          border: "none",
                          borderRadius: 14,
                          cursor: "pointer",
                          transition: "background 0.2s",
                          width: "100%",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "var(--surface)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "transparent";
                        }}
                      >
                        {/* Product Image */}
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 12,
                            overflow: "hidden",
                            flexShrink: 0,
                            background: "var(--surface)",
                          }}
                        >
                          <Image
                            src={product.images?.[0] || "/placeholder.jpg"}
                            alt={product.name}
                            width={56}
                            height={56}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            unoptimized
                          />
                        </div>

                        {/* Product Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              color: "var(--fg)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {product.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--muted)",
                              fontFamily: "Poppins, sans-serif",
                            }}
                          >
                            {product.category}
                            {product.brand ? ` · ${product.brand}` : ""}
                          </p>
                        </div>

                        {/* Price */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              color: "var(--fg)",
                            }}
                          >
                            ₹{sellingPrice.toLocaleString("en-IN")}
                          </p>
                          {hasDiscount && (
                            <p
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--muted)",
                                textDecoration: "line-through",
                              }}
                            >
                              ₹{product.price.toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>

                        <ArrowRight
                          size={14}
                          style={{ color: "var(--muted)", flexShrink: 0 }}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                /* No results */
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "3rem 0",
                    gap: 10,
                    color: "var(--muted)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    No results found
                  </p>
                  <p style={{ fontSize: "0.82rem" }}>
                    Try searching for &quot;sneakers&quot;, &quot;slides&quot;, or
                    &quot;crocs&quot;
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
