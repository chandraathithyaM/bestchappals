"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

const BANNER_IMAGE = "/products/first_prefer_Ladies/img-24.jpg";

export default function LifestyleBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} style={{ position: "relative", overflow: "hidden", height: "min(600px, 80vw)", background: "#111" }}>
      <motion.div style={{ y, position: "absolute", inset: "-15%", zIndex: 0 }}>
        <Image src={BANNER_IMAGE} alt="BestChappals lifestyle" fill style={{ objectFit: "cover", opacity: 0.6 }} unoptimized />
      </motion.div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(17,17,17,0.88) 0%, rgba(17,17,17,0.35) 100%)", zIndex: 1 }} />
      <div className="container-xl" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 560 }}>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>
            Premium · All India Delivery
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: "clamp(2rem,5vw,4rem)", color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 24 }}>
            Fashion That<br /><span style={{ color: "#2563EB" }}>Moves With You</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ fontFamily: "Poppins", fontSize: "0.92rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 32 }}>
            Curated lifestyle footwear. Premium quality, trend-forward designs — crafted for those who walk ahead.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/category/women" className="btn btn-white">Shop Women's</Link>
            <a href="https://wa.me/918838247446" target="_blank" rel="noopener noreferrer" className="btn"
              style={{ border: "1.5px solid rgba(255,255,255,0.35)", color: "#fff", background: "transparent" }}>
              Order on WhatsApp
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
