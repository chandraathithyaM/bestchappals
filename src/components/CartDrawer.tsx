"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQty, total } = useCartStore();
  const cartTotal = total();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              zIndex: 98,
            }}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            className="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ zIndex: 99 }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.5rem",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Your Cart
                </h2>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }}>
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                id="close-cart"
                onClick={closeCart}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: "transparent",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div
              style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}
              data-lenis-prevent
            >
              {items.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "50%",
                    gap: 16,
                    color: "#9ca3af",
                  }}
                >
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p style={{ fontFamily: "Montserrat", fontWeight: 600 }}>
                    Your cart is empty
                  </p>
                  <button
                    onClick={closeCart}
                    className="btn btn-dark"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "12px",
                        background: "#f9f9f9",
                        borderRadius: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 72,
                          height: 90,
                          borderRadius: 8,
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#f0f0f0",
                        }}
                      >
                        <Image
                          src={item.product.images?.[0] || (item.product as any).image || "/placeholder.jpg"}
                          alt={item.product.name}
                          width={72}
                          height={90}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          unoptimized
                        />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                        <p
                          style={{
                            fontFamily: "Montserrat",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            color: "#111",
                          }}
                        >
                          {item.product.name}
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                          Size: {item.size} · {item.product.category}
                        </p>
                        <p
                          style={{
                            fontFamily: "Montserrat",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                          }}
                        >
                          ₹{(item.product.offer_price || item.product.price).toLocaleString("en-IN")}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginTop: "auto",
                          }}
                        >
                          <button
                            onClick={() =>
                              updateQty(item.product.id, item.size, item.quantity - 1)
                            }
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span
                            style={{
                              fontFamily: "Montserrat",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              minWidth: 20,
                              textAlign: "center",
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(item.product.id, item.size, item.quantity + 1)
                            }
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
                            style={{
                              marginLeft: "auto",
                              color: "#ef4444",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  padding: "1.25rem 1.5rem",
                }}
              >
                {/* Free Shipping Banner */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                    borderRadius: 10,
                    padding: "0.6rem 0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>🚚</span>
                  <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.72rem", color: "#065f46" }}>
                    Free Shipping on All Orders!
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Montserrat",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Subtotal
                  </span>
                  <span
                    style={{
                      fontFamily: "Montserrat",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                    }}
                  >
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn btn-dark"
                  style={{ width: "100%", marginBottom: 10 }}
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
