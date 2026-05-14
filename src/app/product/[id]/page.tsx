"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Heart, ShoppingBag, ArrowLeft, Check, ChevronLeft, ChevronRight, Zap, Truck, Shield, RotateCcw, LogIn, Loader2 } from "lucide-react";
import { useProducts, useProduct } from "@/hooks/useProducts";
import { useCartStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { product, loading } = useProduct(id);
  const { products: allProducts } = useProducts({ category: product?.category });
  
  const { addItem, toggleWishlist, wishlist, openCart } = useCartStore();
  const { isSignedIn } = useAuth();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  
  const isWishlisted = product ? wishlist.includes(product.id) : false;

  const related = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts.filter((p) => p.id !== product.id).slice(0, 3);
  }, [product, allProducts]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite", color: "#6366f1" }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ paddingTop: 120, textAlign: "center", minHeight: "60vh" }}>
        <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "1.5rem" }}>Product not found</p>
        <button onClick={() => router.push("/")} className="btn btn-dark" style={{ marginTop: 20 }}>Go Home</button>
      </div>
    );
  }


  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); setTimeout(() => setSizeError(false), 2000); return; }
    addItem(product as any, selectedSize);
    setAdded(true);
    setTimeout(() => { setAdded(false); openCart(); }, 800);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); setTimeout(() => setSizeError(false), 2000); return; }
    addItem(product as any, selectedSize);
    // Middleware will redirect to sign-in if not authenticated,
    // but we push anyway — the redirect is handled server-side
    router.push("/checkout");
  };

  return (
    <>
      <div style={{ paddingTop: 72, minHeight: "100vh", background: "#fff" }}>
        {/* Breadcrumb */}
        <div className="container-xl" style={{ padding: "1.5rem 1.5rem 0" }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Montserrat", fontWeight: 600, fontSize: "0.75rem", color: "#6b7280", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="container-xl" style={{ padding: "2rem 1.5rem 5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }} className="pdp-grid">

            {/* LEFT — Gallery */}
            <div>
              {/* Main image */}
              <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 20, overflow: "hidden", background: "#f5f5f5", marginBottom: 12 }}>
                <AnimatePresence mode="wait">
                  <motion.div key={activeImg} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ position: "absolute", inset: 0 }}>
                    <Image src={product.images?.[activeImg] ?? product.image} alt={product.name} fill style={{ objectFit: "cover" }} unoptimized priority />
                  </motion.div>
                </AnimatePresence>
                {/* Nav arrows */}
                {product.images?.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg((v) => (v - 1 + product.images.length) % product.images.length)}
                      style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setActiveImg((v) => (v + 1) % product.images.length)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
                {/* Badges */}
                <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, flexDirection: "column" }}>
                  {(product.is_new || product.isNew) && <span className="badge badge-new">New</span>}
                  {(product.trending || product.isTrending) && <span className="badge badge-trending">Trending</span>}
                  {product.out_of_stock && <span className="badge" style={{ background: "#ef4444", color: "#fff" }}>Sold Out</span>}
                </div>
              </div>
              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      style={{ width: 72, height: 88, borderRadius: 10, overflow: "hidden", border: activeImg === i ? "2px solid #111" : "2px solid transparent", cursor: "pointer", background: "#f5f5f5", padding: 0 }}>
                      <Image src={img} alt="" width={72} height={88} style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Info */}
            <div style={{ position: "sticky", top: 96 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <p style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#2563EB", marginBottom: 8 }}>{product.category}</p>
                <h1 style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: "clamp(1.5rem,3vw,2.2rem)", color: "#111", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 16 }}>{product.name}</h1>

                {/* Price */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <span style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1.8rem", color: "#111" }}>₹{product.price.toLocaleString("en-IN")}</span>
                  {(product.offer_price || product.originalPrice) && (product.offer_price || product.originalPrice)! > product.price && (
                    <>
                      <span style={{ fontFamily: "Poppins", fontSize: "1rem", color: "#9ca3af", textDecoration: "line-through" }}>₹{(product.offer_price || product.originalPrice)!.toLocaleString("en-IN")}</span>
                      <span className="badge badge-sale">{Math.round((((product.offer_price || product.originalPrice)! - product.price) / (product.offer_price || product.originalPrice)!) * 100)}% OFF</span>
                    </>
                  )}
                </div>

                <div className="divider" style={{ marginBottom: 24 }} />

                {/* Size */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, color: sizeError ? "#ef4444" : "#111" }}>
                    {sizeError ? "Please select a size ↓" : "Select Size"}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {product.sizes.map((s: any) => {
                      const sizeVal = typeof s === 'string' ? s : s.size;
                      const stock = typeof s === 'string' ? 10 : s.stock;
                      const isOutOfStock = stock <= 0;
                      
                      return (
                        <button 
                          key={sizeVal} 
                          onClick={() => !isOutOfStock && setSelectedSize(sizeVal)}
                          disabled={isOutOfStock}
                          style={{ 
                            width: 48, height: 48, borderRadius: 10, 
                            border: selectedSize === sizeVal ? "2px solid #111" : "1.5px solid #e5e7eb", 
                            background: selectedSize === sizeVal ? "#111" : isOutOfStock ? "#f9fafb" : "#fff", 
                            color: selectedSize === sizeVal ? "#fff" : isOutOfStock ? "#d1d5db" : "#111", 
                            fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.85rem", 
                            cursor: isOutOfStock ? "not-allowed" : "pointer", 
                            transition: "all 0.2s",
                            position: "relative",
                            overflow: "hidden"
                          }}>
                          {sizeVal}
                          {isOutOfStock && <div style={{ position: "absolute", top: "50%", left: "-10%", width: "120%", height: 1, background: "#d1d5db", transform: "rotate(-45deg)" }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CTAs */}
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <button onClick={handleAddToCart} id={`add-cart-${product.id}`}
                    className="btn btn-dark"
                    style={{ flex: 1, background: added ? "#22c55e" : "#111", transition: "background 0.3s" }}>
                    {added ? <><Check size={14} /> Added!</> : <><ShoppingBag size={14} /> Add to Cart</>}
                  </button>
                  <button onClick={() => toggleWishlist(product.id)}
                    style={{ width: 48, height: 48, borderRadius: 100, border: "1.5px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Heart size={18} fill={isWishlisted ? "#ef4444" : "none"} color={isWishlisted ? "#ef4444" : "#111"} />
                  </button>
                </div>

                {isSignedIn ? (
                  <button
                    onClick={handleBuyNow}
                    id={`buy-now-${product.id}`}
                    className="btn"
                    style={{ width: "100%", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", display: "flex", marginBottom: 24, boxShadow: "0 6px 20px rgba(37,99,235,0.35)" }}
                  >
                    <Zap size={16} /> Buy Now
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      id={`sign-in-to-buy-${product.id}`}
                      className="btn"
                      style={{ width: "100%", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", display: "flex", marginBottom: 24, boxShadow: "0 6px 20px rgba(37,99,235,0.35)", cursor: "pointer" }}
                    >
                      <LogIn size={16} /> Sign In to Buy
                    </button>
                  </SignInButton>
                )}

                <div className="divider" style={{ marginBottom: 20 }} />

                {/* Perks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {[[<Truck size={15} key="t" />, "Free delivery on orders above ₹499"],
                    [<Shield size={15} key="s" />, "100% genuine product guaranteed"],
                    [<RotateCcw size={15} key="r" />, "Easy exchange within 7 days"]].map(([icon, text], i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "#2563EB" }}>{icon}</span>
                      <span style={{ fontFamily: "Poppins", fontSize: "0.82rem", color: "#374151" }}>{text as string}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div style={{ background: "#f9f9f9", borderRadius: 12, padding: "1.25rem" }}>
                  <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Product Details</p>
                  <p style={{ fontFamily: "Poppins", fontSize: "0.85rem", color: "#374151", lineHeight: 1.7 }}>{product.description}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    {product.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: "0.65rem", fontFamily: "Montserrat", fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: "#e5e7eb", color: "#6b7280" }}>#{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div style={{ marginTop: "5rem" }}>
              <h2 className="section-title" style={{ marginBottom: "2rem" }}>You May Also Like</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }} className="related-grid">
                {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="mobile-sticky-cta" style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #e5e7eb", zIndex: 40, display: "none", gap: 8 }}>
        <button onClick={handleAddToCart} className="btn btn-dark" style={{ flex: 1, fontSize: "0.82rem" }}>
          {added ? "Added ✓" : "Add to Cart — ₹" + product.price.toLocaleString("en-IN")}
        </button>
        {isSignedIn ? (
          <button onClick={handleBuyNow}
            style={{ width: 48, height: 48, borderRadius: 100, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <Zap size={18} color="#fff" />
          </button>
        ) : (
          <SignInButton mode="modal">
            <button
              style={{ width: 48, height: 48, borderRadius: 100, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}>
              <LogIn size={18} color="#fff" />
            </button>
          </SignInButton>
        )}
      </div>

      <Footer />
      <style>{`
        @media(max-width:768px){
          .pdp-grid{grid-template-columns:1fr!important;gap:2rem!important;}
          .mobile-sticky-cta{display:flex!important;}
          .related-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
      `}</style>
    </>
  );
}
