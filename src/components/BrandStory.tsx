"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function BrandStory() {
  return (
    <section style={{ padding: "6rem 0", background: "#111111", color: "#fff", position: "relative", overflow: "hidden" }}>
      {/* Decorative bg */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 50%, rgba(37,99,235,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div className="container-xl">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }} className="brand-grid">
          {/* Left - Images */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            style={{ position: "relative", height: "min(500px,60vw)" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: "65%", height: "80%", borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
              <Image src="/products/first_prefer_sneakers/img-2.jpg" alt="Brand story" fill style={{ objectFit: "cover" }} unoptimized />
            </div>
            <div style={{ position: "absolute", right: 0, bottom: 0, width: "55%", height: "65%", borderRadius: 16, overflow: "hidden", border: "3px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <Image src="/products/first_prefer_Ladies/img-6.jpg" alt="Brand story 2" fill style={{ objectFit: "cover" }} unoptimized />
            </div>
            {/* Badge */}
            <div style={{ position: "absolute", right: "10%", top: "10%", background: "#2563EB", borderRadius: "50%", width: 80, height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(37,99,235,0.4)" }}>
              <span style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: "1.1rem", color: "#fff", lineHeight: 1 }}>10K+</span>
              <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Happy</span>
            </div>
          </motion.div>

          {/* Right - Text */}
          <div>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>
              Our Story
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: "clamp(1.8rem,3.5vw,3rem)", color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
              Born in Puliampatti,<br /><span style={{ color: "#2563EB" }}>Built for India</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              style={{ fontFamily: "Poppins", fontSize: "0.92rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 20 }}>
              BestChappals started as a small shop in Puliampatti, Tamil Nadu — driven by a simple passion: bringing the best quality footwear to everyone. Today, we ship all over India, delivering premium sneakers, slides, crocs, and more directly to your doorstep.
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              style={{ fontFamily: "Poppins", fontSize: "0.92rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 36 }}>
              We believe great footwear shouldn't be reserved for big cities. Every step you take deserves quality, style, and comfort — wherever you are.
            </motion.p>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              style={{ display: "flex", gap: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[["500+","Products"],["10K+","Customers"],["All India","Delivery"],["5★","Rating"]].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1.4rem", color: "#fff" }}>{num}</div>
                  <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.brand-grid{grid-template-columns:1fr!important;gap:3rem!important;}}`}</style>
    </section>
  );
}
