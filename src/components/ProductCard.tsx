"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/products";
import { useCartStore } from "@/lib/store";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { addItem, toggleWishlist, wishlist } = useCartStore();
  const isWishlisted = wishlist.includes(product.id);
  const [addedSize, setAddedSize] = useState<string | null>(null);
  const router = useRouter();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sizeList = product.sizes || [];
    const firstSize = typeof sizeList[0] === 'string' ? sizeList[0] : (sizeList[0] as any)?.size;
    const secondSize = typeof sizeList[1] === 'string' ? sizeList[1] : (sizeList[1] as any)?.size;
    const defaultSize = secondSize ?? firstSize;
    if (defaultSize) {
      addItem(product as any, defaultSize);
      setAddedSize(defaultSize);
      setTimeout(() => setAddedSize(null), 1500);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const productImage = (product.images?.[0] || product.image) ? (product.images?.[0] || product.image) : "/placeholder.jpg";
  const isNew = product.is_new || product.isNew;
  const isTrending = product.trending || product.isTrending;
  const originalPrice = product.offer_price || product.originalPrice;

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/product/${product.id}`)}
      style={{ cursor: "pointer" }}
    >
      {/* Image */}
      <div className="product-card__image">
        <Image
          src={productImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          unoptimized
        />

        {/* Soft gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(17,17,17,0.3) 0%, transparent 50%)",
            opacity: 0,
            transition: "opacity 0.4s ease",
          }}
          className="card-overlay"
        />

        {/* Badges */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex",
            gap: 6,
            flexDirection: "column",
          }}
        >
          {isNew && <span className="badge badge-new">New</span>}
          {isTrending && <span className="badge badge-trending">Trending</span>}
          {originalPrice && originalPrice > product.price && (
            <span className="badge badge-sale">
              -{Math.round(((originalPrice - product.price) / originalPrice) * 100)}%
            </span>
          )}
          {product.out_of_stock && (
            <span className="badge" style={{ background: "#ef4444", color: "#fff" }}>Sold Out</span>
          )}
        </div>

        {/* Action buttons */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            id={`wishlist-${product.id}`}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            }}
          >
            <Heart
              size={15}
              fill={isWishlisted ? "#ef4444" : "none"}
              color={isWishlisted ? "#ef4444" : "#111"}
            />
          </motion.button>

          {!product.out_of_stock && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleQuickAdd}
              id={`quick-add-${product.id}`}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: addedSize ? "#22c55e" : "rgba(17,17,17,0.9)",
                backdropFilter: "blur(8px)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                transition: "background 0.3s",
              }}
            >
              <ShoppingBag size={15} color="#fff" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__price">
          <span className="price-current">₹{product.price.toLocaleString("en-IN")}</span>
          {originalPrice && originalPrice > product.price && (
            <span className="price-original">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        {/* Sizes preview */}
        <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
          {product.sizes.slice(0, 4).map((s: any) => {
            const sizeLabel = typeof s === 'string' ? s : s.size;
            return (
              <span
                key={sizeLabel}
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  fontFamily: "Montserrat",
                  padding: "2px 7px",
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  color: "#6b7280",
                }}
              >
                {sizeLabel}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
