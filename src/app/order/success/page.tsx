"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home, Phone, PackageSearch } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";


function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const confettiRef = useRef<boolean>(false);

  const orderId = params.get("orderId") || "N/A";
  const paymentId = params.get("paymentId") || "N/A";
  const amount = params.get("amount") || "0";
  const shortOrderId = orderId.slice(-8).toUpperCase();

  // Redirect if accessed directly without params
  useEffect(() => {
    if (orderId === "N/A" && typeof window !== "undefined") {
      router.replace("/");
    }
  }, [orderId, router]);

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryStr = deliveryDate.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #fafafa 50%, #eff6ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        paddingTop: "calc(var(--nav-h) + 2rem)",
      }}
    >
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>

        {/* Animated success circle */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
          style={{ display: "inline-flex", position: "relative", marginBottom: "1.5rem" }}
        >
          <div
            style={{
              width: 100, height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 20px 60px rgba(34,197,94,0.4)",
            }}
          >
            <CheckCircle size={52} color="#fff" strokeWidth={2} />
          </div>
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            style={{
              position: "absolute", inset: -6,
              borderRadius: "50%",
              border: "2px solid #22c55e",
            }}
          />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
              color: "#111",
              lineHeight: 1.1,
              marginBottom: "0.5rem",
            }}
          >
            Order Confirmed! 🎉
          </h1>
          <p style={{ fontFamily: "Poppins", color: "#6b7280", fontSize: "0.95rem", marginBottom: "2rem" }}>
            Thank you for shopping with BestChappals
          </p>
        </motion.div>

        {/* Order card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "1.75rem",
            boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
            marginBottom: "1.5rem",
            textAlign: "left",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <p style={{ fontSize: "0.7rem", fontFamily: "Montserrat", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>
                Order ID
              </p>
              <p style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1rem", color: "#111" }}>
                #{shortOrderId}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", fontFamily: "Montserrat", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>
                Amount Paid
              </p>
              <p style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1rem", color: "#22c55e" }}>
                ₹{Number(amount).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", fontFamily: "Montserrat", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>
                Payment ID
              </p>
              <p style={{ fontFamily: "Poppins", fontSize: "0.78rem", color: "#374151", wordBreak: "break-all" }}>
                {paymentId}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", fontFamily: "Montserrat", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>
                Status
              </p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", background: "#f0fdf4", color: "#16a34a", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700, fontFamily: "Montserrat" }}>
                ✓ Payment Successful
              </span>
            </div>
          </div>

          <div style={{ marginTop: "1.25rem", padding: "1rem", background: "#fffbeb", borderRadius: 12, border: "1px solid #fde68a", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Package size={18} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.82rem", color: "#92400e", marginBottom: 2 }}>
                Estimated Delivery
              </p>
              <p style={{ fontFamily: "Poppins", fontSize: "0.8rem", color: "#78350f" }}>
                {deliveryStr} — All India delivery via courier
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <Link href="/orders" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "1rem", background: "#111", color: "#fff",
            borderRadius: 100, textDecoration: "none",
            fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.88rem",
            letterSpacing: "0.06em", textTransform: "uppercase",
            boxShadow: "0 8px 24px rgba(17,17,17,0.25)",
          }}>
            <PackageSearch size={16} /> View My Orders <ArrowRight size={15} />
          </Link>
          <Link href="/" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "1rem", background: "transparent", color: "#111",
            borderRadius: 100, textDecoration: "none",
            fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.88rem",
            letterSpacing: "0.06em", textTransform: "uppercase",
            border: "2px solid #e5e7eb",
          }}>
            <Home size={16} /> Continue Shopping
          </Link>
          <a
            href="https://wa.me/918838247446"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "0.875rem", background: "#25d366", color: "#fff",
              borderRadius: 100, textDecoration: "none",
              fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.85rem",
              letterSpacing: "0.05em",
            }}
          >
            <Phone size={15} /> Track via WhatsApp
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: "1.5rem", fontSize: "0.78rem", color: "#9ca3af", fontFamily: "Poppins" }}
        >
          Questions? Call us at{" "}
          <a href="tel:8838247446" style={{ color: "#111", fontWeight: 600, textDecoration: "none" }}>
            8838247446
          </a>
        </motion.p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
