"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin, Phone, Mail, User, ChevronRight,
  ShieldCheck, Truck, RotateCcw, Lock
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useRazorpayScript, openRazorpayPopup } from "@/hooks/useRazorpay";
import { useToast } from "@/components/Toast";
import type { ShippingAddress } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";


// Free shipping on all orders
const SHIPPING_COST = 0;

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Puducherry",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.85rem 1rem 0.85rem 2.75rem",
  border: "1.5px solid #e5e7eb",
  borderRadius: "12px",
  fontFamily: "Poppins, sans-serif",
  fontSize: "0.9rem",
  color: "#111",
  background: "#fafafa",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontWeight: 600,
  fontSize: "0.75rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#6b7280",
  display: "block",
  marginBottom: "0.4rem",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { addToast } = useToast();
  const { userId } = useAuth();
  const cartTotal = total();
  const shipping = 0; // Free shipping on all orders
  const grandTotal = cartTotal + shipping;


  const [form, setForm] = useState<ShippingAddress>({
    fullName: "", phone: "", email: "",
    addressLine1: "", addressLine2: "",
    city: "", state: "", pincode: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useRazorpayScript({ onLoad: () => setSdkReady(true) });

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = "Enter valid 10-digit mobile";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter valid email";
    if (!form.addressLine1.trim()) newErrors.addressLine1 = "Required";
    if (!form.city.trim()) newErrors.city = "Required";
    if (!form.state) newErrors.state = "Required";
    if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Enter 6-digit pincode";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof ShippingAddress]) {
      setErrors((e) => ({ ...e, [name]: undefined }));
    }
  };

  const handlePayment = useCallback(async () => {
    if (items.length === 0) {
      addToast("Your cart is empty", "warning");
      return;
    }
    if (!validate()) {
      addToast("Please fill in all required fields", "warning");
      return;
    }
    if (!sdkReady) {
      addToast("Payment gateway loading… please wait", "info");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Razorpay order server-side
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            category: i.product.category,
            image: i.product.images?.[0] || i.product.image || "/placeholder.jpg",
            price: i.product.offer_price || i.product.price,
            size: i.size,
            quantity: i.quantity,
          })),
          shippingAddress: form,
          userId: userId || undefined,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Order creation failed");
      }

      // 2. Open Razorpay popup
      openRazorpayPopup({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BestChappals",
        description: `Order — ${items.length} item${items.length > 1 ? "s" : ""}`,
        image: "/logo.png",
        order_id: orderData.orderId,
        prefill: {
          name: form.fullName,
          email: form.email || undefined,
          contact: `+91${form.phone}`,  // +91 prefix helps Razorpay auto-detect UPI
        },
        notes: { address: form.addressLine1 },
        theme: { color: "#111111" },
        // Explicitly whitelist all payment methods so UPI always appears
        method: { upi: true, card: true, netbanking: true, wallet: true, paylater: true },
        modal: {
          ondismiss: async () => {
            setLoading(false);
            addToast("Payment cancelled. You can retry anytime.", "warning");
            
            // Securely delete the abandoned pending order from Supabase
            if (orderData?.dbOrderId) {
              try {
                await fetch(`/api/payment/create-order?dbOrderId=${orderData.dbOrderId}`, {
                  method: "DELETE",
                });
              } catch (delErr) {
                console.error("[checkout] Failed to delete cancelled order:", delErr);
              }
            }
          },
          confirm_close: true,
          animation: true,
        },

        handler: async (response) => {
          try {
            // 3. Verify signature server-side
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                db_order_id: orderData.dbOrderId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Verification failed");
            }

            // 4. Clear cart & redirect
            clearCart();
            router.push(
              `/order/success?orderId=${verifyData.orderId}&paymentId=${response.razorpay_payment_id}&amount=${grandTotal}`
            );
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Verification failed";
            addToast(msg, "error");
            setLoading(false);
          }
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      addToast(msg, "error");
      setLoading(false);
    }
  }, [items, form, sdkReady, grandTotal, addToast, clearCart, router]);

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, paddingTop: "var(--nav-h)", paddingRight: "2rem", paddingBottom: "2rem", paddingLeft: "2rem" }}>
        <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "1.2rem" }}>Your cart is empty</p>
        <button onClick={() => router.push("/")} className="btn btn-dark">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", paddingTop: "var(--nav-h)" }}>
      <div className="container-xl" style={{ padding: "2rem 1.5rem", maxWidth: 1100 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="section-label" style={{ marginBottom: 6 }}>Secure Checkout</p>
          <h1 className="section-title" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", marginBottom: "0.25rem" }}>
            Complete Your Order
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#22c55e", fontSize: "0.8rem", fontFamily: "Poppins", marginBottom: "2rem" }}>
            <Lock size={13} /> <span>256-bit SSL Encryption</span>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="checkout-grid">

          {/* ── LEFT: Shipping Form ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={18} style={{ color: "#111" }} /> Delivery Address
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                {/* Full Name */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Full Name *</label>
                  <div style={{ position: "relative" }}>
                    <User size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Ravi Kumar" style={{ ...inputStyle, borderColor: errors.fullName ? "#ef4444" : "#e5e7eb" }} />
                  </div>
                  {errors.fullName && <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label style={labelStyle}>Mobile Number *</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" maxLength={10} style={{ ...inputStyle, borderColor: errors.phone ? "#ef4444" : "#e5e7eb" }} />
                  </div>
                  {errors.phone && <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email (Optional)</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <input name="email" value={form.email} onChange={handleChange} placeholder="ravi@email.com" style={inputStyle} />
                  </div>
                </div>

                {/* Address */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Address Line 1 *</label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <input name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="House / Flat no., Street" style={{ ...inputStyle, borderColor: errors.addressLine1 ? "#ef4444" : "#e5e7eb" }} />
                  </div>
                  {errors.addressLine1 && <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.addressLine1}</p>}
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Address Line 2 (Optional)</label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Landmark, Area" style={inputStyle} />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label style={labelStyle}>City *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Chennai" style={{ ...inputStyle, paddingLeft: "1rem", borderColor: errors.city ? "#ef4444" : "#e5e7eb" }} />
                  {errors.city && <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.city}</p>}
                </div>

                {/* Pincode */}
                <div>
                  <label style={labelStyle}>Pincode *</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="600001" maxLength={6} style={{ ...inputStyle, paddingLeft: "1rem", borderColor: errors.pincode ? "#ef4444" : "#e5e7eb" }} />
                  {errors.pincode && <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.pincode}</p>}
                </div>

                {/* State */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>State *</label>
                  <select name="state" value={form.state} onChange={handleChange} style={{ ...inputStyle, paddingLeft: "1rem", appearance: "none", cursor: "pointer", borderColor: errors.state ? "#ef4444" : "#e5e7eb" }}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.state}</p>}
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
              {[
                { icon: <ShieldCheck size={16} />, label: "Secure Payment" },
                { icon: <Truck size={16} />, label: "All India Delivery" },
                { icon: <RotateCcw size={16} />, label: "Easy Returns" },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", background: "#fff", borderRadius: 100, border: "1px solid #e5e7eb", fontSize: "0.75rem", fontFamily: "Poppins", fontWeight: 500, color: "#374151", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  {icon} {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: Order Summary ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", position: "sticky", top: "calc(var(--nav-h) + 1rem)" }}>
              <h2 style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1rem", marginBottom: "1.5rem" }}>
                Order Summary ({items.length} item{items.length > 1 ? "s" : ""})
              </h2>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.5rem", maxHeight: 280, overflowY: "auto" }}>
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 56, height: 70, borderRadius: 8, overflow: "hidden", background: "#f5f5f5", flexShrink: 0 }}>
                      <Image src={item.product.images?.[0] || item.product.image || "/placeholder.jpg"} alt={item.product.name} width={56} height={70} style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.8rem", color: "#111" }}>{item.product.name}</p>
                      <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }}>Size {item.size} · Qty {item.quantity}</p>
                    </div>
                    <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                      ₹{((item.product.offer_price || item.product.price) * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Free Shipping Banner */}
              <div style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", borderRadius: 12, padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.2rem" }}>🚚</span>
                <div>
                  <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.8rem", color: "#065f46" }}>Free Shipping!</p>
                  <p style={{ fontSize: "0.7rem", color: "#047857", fontFamily: "Poppins" }}>Enjoy free delivery on all orders</p>
                </div>
              </div>

              <div style={{ borderTop: "1px dashed #e5e7eb", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontFamily: "Poppins", color: "#6b7280" }}>
                  <span>Subtotal</span><span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontFamily: "Poppins", color: "#22c55e" }}>
                  <span>Shipping</span>
                  <span>FREE 🎉</span>
                </div>
                <div style={{ height: 1, background: "#e5e7eb", margin: "0.25rem 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Montserrat", fontWeight: 800, fontSize: "1.15rem" }}>
                  <span>Total</span><span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                id="razorpay-pay-btn"
                onClick={handlePayment}
                disabled={loading}
                style={{
                  width: "100%",
                  marginTop: "1.5rem",
                  padding: "1rem 2rem",
                  background: loading ? "#6b7280" : "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: 100,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  transition: "all 0.3s ease",
                  boxShadow: loading ? "none" : "0 8px 24px rgba(17,17,17,0.3)",
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    Pay ₹{grandTotal.toLocaleString("en-IN")}
                    <ChevronRight size={16} />
                  </>
                )}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#9ca3af", marginTop: "0.75rem", fontFamily: "Poppins" }}>
                UPI · Cards · Net Banking · Wallets
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr 420px !important; }
        }
      `}</style>
    </div>
  );
}
