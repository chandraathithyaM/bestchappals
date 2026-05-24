"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Download, ChevronDown, ChevronUp,
  Clock, CheckCircle, Truck, XCircle, RotateCcw,
  ShoppingBag, ArrowRight, FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Order } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Status badge config ─────────────────────────────────────────────────────
const ORDER_STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "#f59e0b", bg: "#fffbeb", icon: Clock },
  processing: { label: "Processing", color: "#3b82f6", bg: "#eff6ff", icon: Package },
  shipped:    { label: "Shipped",    color: "#8b5cf6", bg: "#f5f3ff", icon: Truck },
  delivered:  { label: "Delivered",  color: "#22c55e", bg: "#f0fdf4", icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "#fef2f2", icon: XCircle },
};

const PAYMENT_STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "#f59e0b" },
  paid:     { label: "Paid",     color: "#22c55e" },
  failed:   { label: "Failed",   color: "#ef4444" },
  refunded: { label: "Refunded", color: "#8b5cf6" },
};

// ─── Download order as PDF invoice ─────────────────────────────────────────
async function downloadOrderInvoice(order: Order) {
  try {
    const doc = new jsPDF();
    const shortId = order.id.slice(-8).toUpperCase();
    const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });

    // Header
    doc.setFontSize(22);
    doc.setTextColor(17, 17, 17);
    doc.text("BESTCHAPPALS", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Puliampatti, Tamil Nadu | Phone: +91 8838247446", 14, 28);

    doc.setFontSize(18);
    doc.setTextColor(17, 17, 17);
    doc.text("INVOICE", 160, 20, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Order ID: #${shortId}`, 14, 40);
    doc.text(`Date: ${dateStr}`, 14, 46);
    doc.text(`Status: ${ORDER_STATUS_CONFIG[order.order_status]?.label || order.order_status}`, 14, 52);
    doc.text(`Payment: ${PAYMENT_STATUS_CONFIG[order.payment_status]?.label || order.payment_status}`, 14, 58);

    // Delivery Address
    doc.setFontSize(12);
    doc.setTextColor(17, 17, 17);
    doc.text("Delivery Address", 120, 40);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const addr = order.shipping_address;
    doc.text(addr.fullName || "Customer", 120, 46);
    doc.text(addr.addressLine1 || "", 120, 52);
    if (addr.addressLine2) doc.text(addr.addressLine2, 120, 58);
    const addrY = addr.addressLine2 ? 64 : 58;
    doc.text(`${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`, 120, addrY);
    doc.text(`Phone: ${addr.phone || "N/A"}`, 120, addrY + 6);

    // Try to load product images (with CORS-safe fallback)
    const loadImage = (url: string): Promise<string | null> => {
      return new Promise((resolve) => {
        if (!url || url === "/placeholder.jpg") {
          resolve(null);
          return;
        }
        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = Math.min(img.width, 200);
            canvas.height = Math.min(img.height, 200);
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          } catch {
            // CORS tainted canvas — skip image
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        // Set a timeout so we don't wait forever
        setTimeout(() => resolve(null), 5000);
        img.src = url;
      });
    };

    // Table Data — build rows with product details
    const tableBody: string[][] = [];
    const imageDataArr: (string | null)[] = [];

    for (const p of order.products) {
      const imgData = await loadImage(p.image || "");
      imageDataArr.push(imgData);
      tableBody.push([
        "", // placeholder for image column
        `${p.name || "Product"}`,
        `${p.category || "N/A"}`,
        `${p.size || "N/A"}`,
        String(p.quantity || 1),
        `Rs. ${Number(p.price || 0).toLocaleString("en-IN")}`,
        `Rs. ${Number(p.subtotal || 0).toLocaleString("en-IN")}`,
      ]);
    }

    autoTable(doc, {
      startY: 75,
      head: [["", "Product", "Category", "Size", "Qty", "Price", "Subtotal"]],
      body: tableBody,
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.cell.section === "body") {
          const imgData = imageDataArr[data.row.index];
          if (imgData) {
            try {
              doc.addImage(imgData, "JPEG", data.cell.x + 2, data.cell.y + 2, 12, 12);
            } catch {
              // Skip image if addImage fails
            }
          }
        }
      },
      bodyStyles: { minCellHeight: 16, valign: "middle", fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 40 },
        2: { cellWidth: 22 },
        3: { cellWidth: 14, halign: "center" },
        4: { cellWidth: 12, halign: "center" },
        5: { cellWidth: 28, halign: "right" },
        6: { cellWidth: 28, halign: "right" },
      },
      headStyles: { fillColor: [17, 17, 17], textColor: [255, 255, 255], fontSize: 8 },
    });

    const finalY = ((doc as any).lastAutoTable?.finalY || 150) + 10;

    const subtotal = order.products.reduce((s, p) => s + (p.subtotal || 0), 0);
    const shipping = order.amount - subtotal + (order.discount || 0);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Subtotal:", 145, finalY);
    doc.text(`Rs. ${subtotal.toLocaleString("en-IN")}`, 190, finalY, { align: "right" });

    if (order.discount > 0) {
      doc.text("Discount:", 145, finalY + 6);
      doc.text(`-Rs. ${(order.discount || 0).toLocaleString("en-IN")}`, 190, finalY + 6, { align: "right" });
    }

    doc.text("Shipping:", 145, finalY + 12);
    doc.text(shipping > 0 ? `Rs. ${shipping.toLocaleString("en-IN")}` : "FREE", 190, finalY + 12, { align: "right" });

    doc.setFontSize(12);
    doc.setTextColor(17, 17, 17);
    doc.text("Total Paid:", 145, finalY + 22);
    doc.text(`Rs. ${order.amount.toLocaleString("en-IN")}`, 190, finalY + 22, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for shopping with BestChappals!", 105, 280, { align: "center" });

    doc.save(`BestChappals-Order-${shortId}.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Failed to generate invoice. Please try again.");
  }
}

// ─── Single order card ────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = ORDER_STATUS_CONFIG[order.order_status];
  const paymentCfg = PAYMENT_STATUS_CONFIG[order.payment_status];
  const StatusIcon = statusCfg.icon;
  const shortId = order.id.slice(-8).toUpperCase();
  const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        overflow: "hidden",
        border: "1px solid #f3f4f6",
      }}
    >
      {/* ── Card header ── */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Product Image / Status Icon */}
        <div
          style={{
            width: 52, height: 52, borderRadius: 10,
            background: "#f5f5f5",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, overflow: "hidden"
          }}
        >
          {order.products && order.products.length > 0 ? (
            <Image src={order.products[0].image || "/placeholder.jpg"} alt="Product" width={52} height={52} style={{objectFit: 'cover', width: '100%', height: '100%'}} unoptimized />
          ) : (
            <StatusIcon size={20} color={statusCfg.color} />
          )}
        </div>

        {/* Order info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "0.95rem", color: "#111", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {order.products.length > 0 ? order.products[0].name : `Order #${shortId}`}
            {order.products.length > 1 && <span style={{fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, marginLeft: 6}}>+ {order.products.length - 1} more</span>}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", fontFamily: "Poppins", fontWeight: 600 }}>
              #{shortId}
            </span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 100,
                background: statusCfg.bg,
                color: statusCfg.color,
                fontSize: "0.68rem",
                fontFamily: "Montserrat",
                fontWeight: 700,
              }}
            >
              {statusCfg.label}
            </span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 100,
                background: order.payment_status === "paid" ? "#f0fdf4" : "#fef2f2",
                color: paymentCfg.color,
                fontSize: "0.68rem",
                fontFamily: "Montserrat",
                fontWeight: 700,
              }}
            >
              {paymentCfg.label}
            </span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#9ca3af", fontFamily: "Poppins", marginTop: 3 }}>
            {dateStr} · Size {order.products[0]?.size || "N/A"}
          </p>
        </div>

        {/* Amount */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1.1rem", color: "#111" }}>
            ₹{order.amount.toLocaleString("en-IN")}
          </p>
          <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontFamily: "Poppins" }}>Amount Paid</p>
        </div>

        {/* Expand + Download */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); downloadOrderInvoice(order); }}
            title="Download Invoice"
            style={{
              width: 36, height: 36,
              borderRadius: 8,
              border: "1.5px solid #e5e7eb",
              background: "#fafafa",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "#374151",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#111";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "#111";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fafafa";
              e.currentTarget.style.color = "#374151";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            <Download size={15} />
          </button>
          <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* ── Expanded details ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: "1px solid #f3f4f6", padding: "1.25rem 1.5rem" }}>

              {/* Items */}
              <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: "0.75rem" }}>
                Items Ordered
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
                {order.products.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 52, height: 64, borderRadius: 8, overflow: "hidden", background: "#f5f5f5", flexShrink: 0 }}>
                      <Image src={p.image || "/placeholder.jpg"} alt={p.name} width={52} height={64} style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.82rem", color: "#111" }}>{p.name}</p>
                      <p style={{ fontSize: "0.72rem", color: "#9ca3af", fontFamily: "Poppins", marginTop: 2 }}>
                        Size {p.size} · Qty {p.quantity}
                      </p>
                    </div>
                    <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap", color: "#111" }}>
                      ₹{p.subtotal.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Two column: address + payment */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Shipping address */}
                <div style={{ background: "#fafafa", borderRadius: 10, padding: "0.875rem" }}>
                  <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: "0.5rem" }}>
                    Delivery Address
                  </p>
                  <p style={{ fontFamily: "Poppins", fontSize: "0.8rem", color: "#111", fontWeight: 600, lineHeight: 1.5 }}>
                    {order.shipping_address.fullName}
                  </p>
                  <p style={{ fontFamily: "Poppins", fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.6 }}>
                    {order.shipping_address.addressLine1}
                    {order.shipping_address.addressLine2 && `, ${order.shipping_address.addressLine2}`}
                    <br />
                    {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}
                    <br />
                    📞 {order.shipping_address.phone}
                  </p>
                </div>

                {/* Payment info */}
                <div style={{ background: "#fafafa", borderRadius: 10, padding: "0.875rem" }}>
                  <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: "0.5rem" }}>
                    Payment Details
                  </p>
                  {order.payment_id && (
                    <p style={{ fontFamily: "Poppins", fontSize: "0.72rem", color: "#374151", wordBreak: "break-all", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>Payment ID:</span><br />{order.payment_id}
                    </p>
                  )}
                  {order.razorpay_order_id && (
                    <p style={{ fontFamily: "Poppins", fontSize: "0.72rem", color: "#374151", wordBreak: "break-all", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>Order ID:</span><br />{order.razorpay_order_id}
                    </p>
                  )}
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #e5e7eb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontFamily: "Poppins", color: "#6b7280", marginBottom: 2 }}>
                      <span>Discount</span><span>-₹{(order.discount || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Montserrat", fontWeight: 800, fontSize: "0.9rem" }}>
                      <span>Total</span><span>₹{order.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download button */}
              <button
                onClick={() => downloadOrderInvoice(order)}
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  padding: "0.75rem",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#2563eb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#111"; }}
              >
                <FileText size={15} />
                Download Invoice
                <Download size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Orders Page ─────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchOrders();
    } else if (isLoaded && !user) {
      router.replace("/sign-in");
    }
  }, [isLoaded, user, fetchOrders, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f8faff 0%, #fafafa 60%, #f0fdf4 100%)",
        paddingTop: "calc(72px + 2rem)",
        paddingBottom: "4rem",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ marginBottom: "2rem" }}
        >
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#6b7280",
              marginBottom: "0.4rem",
            }}
          >
            My Account
          </p>
          <h1
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
              color: "#111",
              lineHeight: 1.1,
              marginBottom: "0.5rem",
            }}
          >
            Order History
          </h1>
          {user && (
            <p style={{ fontFamily: "Poppins", fontSize: "0.85rem", color: "#6b7280" }}>
              Signed in as <strong style={{ color: "#111" }}>{user.primaryEmailAddress?.emailAddress}</strong>
            </p>
          )}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: "4rem" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <p style={{ fontFamily: "Poppins", color: "#9ca3af", fontSize: "0.85rem" }}>Loading your orders…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "1.25rem",
              textAlign: "center",
              color: "#ef4444",
              fontFamily: "Poppins",
              fontSize: "0.85rem",
            }}
          >
            {error}
            <button
              onClick={fetchOrders}
              style={{ marginLeft: 12, textDecoration: "underline", cursor: "pointer", background: "none", border: "none", color: "#ef4444" }}
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", paddingTop: "4rem" }}
          >
            <div
              style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "#f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <ShoppingBag size={36} color="#d1d5db" />
            </div>
            <h2 style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1.2rem", color: "#111", marginBottom: "0.5rem" }}>
              No orders yet
            </h2>
            <p style={{ fontFamily: "Poppins", color: "#6b7280", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Your completed orders will appear here.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "0.75rem 2rem",
                background: "#111", color: "#fff",
                borderRadius: 100,
                fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.85rem",
                textDecoration: "none",
                letterSpacing: "0.05em",
              }}
            >
              Shop Now <ArrowRight size={15} />
            </Link>
          </motion.div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <p style={{ fontFamily: "Poppins", fontSize: "0.85rem", color: "#6b7280" }}>
                {orders.length} order{orders.length > 1 ? "s" : ""} found
              </p>
              <button
                onClick={fetchOrders}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontFamily: "Poppins", fontSize: "0.78rem", color: "#6b7280",
                  background: "none", border: "1px solid #e5e7eb",
                  borderRadius: 100, padding: "0.3rem 0.75rem", cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.color = "#111"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
              >
                <RotateCcw size={12} /> Refresh
              </button>
            </div>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
