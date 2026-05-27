"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";

const SLIDES = [
  "/homepage/Picsart_26-05-13_21-03-35-651.png",
  "/homepage/Picsart_26-05-13_21-04-42-772.png",
  "/homepage/Picsart_26-05-13_21-05-21-624.png",
  "/homepage/Picsart_26-05-13_21-06-23-541.png",
  "/homepage/Picsart_26-05-13_21-06-56-978.png",
  "/homepage/Picsart_26-05-13_21-07-20-481.png",
];

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef     = useRef<HTMLParagraphElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);

  const [current, setCurrent]   = useState(0);
  const [dir, setDir]           = useState(1);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number, d: number) => {
    setDir(d);
    setCurrent((idx + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1,  1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  const resetAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(next, 4500);
  }, [next]);

  useEffect(() => {
    autoRef.current = setInterval(next, 4500);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [next]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(headingRef.current, { opacity: 0, y: 60, duration: 1 })
        .from(subRef.current,     { opacity: 0, y: 30, duration: 0.8 }, "-=0.6")
        .from(ctaRef.current,     { opacity: 0, y: 20, duration: 0.7 }, "-=0.5")
        .from(imgRef.current,     { opacity: 0, x: 60, duration: 1   }, "-=0.9");
    });
    return () => ctx.revert();
  }, []);

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? "60%" : "-60%", opacity: 0, scale: 0.88 }),
    center: { x: "0%", opacity: 1, scale: 1 },
    exit:   (d: number) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0, scale: 0.88 }),
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fafafa 0%, #f2f2f2 50%, #ffffff 100%)",
        display: "flex",
        alignItems: "center",
        position: "relative",
        /* Removed overflow:hidden — it was trapping touch scroll on mobile */
        paddingTop: "72px",
        touchAction: "pan-y",   /* let vertical swipes scroll the page */
      }}
    >
      {/* Subtle background accent */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(ellipse at 75% 45%, rgba(37,99,235,0.07) 0%, transparent 65%)",
      }} />

      <div className="container-xl w-full">
        <div className="hero-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "center",
          minHeight: "calc(100vh - 72px)",
          padding: "4rem 0",
        }}>

          {/* ── LEFT: Text ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <span className="section-label">New Season · 2026</span>
            </motion.div>

            <h1 ref={headingRef} style={{
              fontFamily: "Montserrat, sans-serif", fontWeight: 900,
              fontSize: "clamp(2.8rem, 6vw, 5.5rem)", lineHeight: 1.0,
              color: "#111111", letterSpacing: "-0.04em",
            }}>
              Elevate<br />
              <span style={{ color: "#2563EB" }}>Every</span><br />
              Step.
            </h1>

            <p ref={subRef} style={{
              fontFamily: "Poppins, sans-serif", fontWeight: 400,
              fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)", color: "#6b7280",
              lineHeight: 1.7, maxWidth: 400,
            }}>
              Premium footwear crafted for the streets. Sneakers, slides, crocs
              &amp; more — delivered all over India.
            </p>

            <div ref={ctaRef} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/category/sneakers" id="hero-cta-shop" className="btn btn-dark">
                Shop Collection <ArrowRight size={14} />
              </Link>
              <Link href="/new-arrivals" id="hero-cta-new" className="btn btn-outline">
                New Arrivals
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ display: "flex", gap: "clamp(1rem, 4vw, 2rem)", flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid #e5e7eb", marginTop: "0.5rem" }}
            >
              {[{ num: "500+", label: "Products" }, { num: "10K+", label: "Happy Customers" }, { num: "India", label: "Wide Delivery" }].map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1.3rem", color: "#111" }}>{s.num}</div>
                  <div style={{ fontSize: "0.7rem", color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Floating Product Showcase ── */}
          <div ref={imgRef} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

            {/* Ambient glow layers */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.65, 0.35] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", width: "70%", height: "70%",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
                zIndex: 0, pointerEvents: "none",
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{
                position: "absolute", width: "85%", height: "85%",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
                zIndex: 0, pointerEvents: "none",
              }}
            />

            {/* Floating image wrapper — NO border-radius clip, NO overflow hidden */}
            <motion.div
              animate={{ y: [-14, 14, -14] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 680, touchAction: "pan-y" }}
            >
              {/* Image area — object-contain so PNG shows fully */}
              <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1 / 1",
                cursor: "grab",
                overflow: "hidden",
              }}>
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={current}
                    custom={dir}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                    style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.6}
                    onDragEnd={(e, info) => {
                      const threshold = 50;
                      if (info.offset.x < -threshold) {
                        next();
                        resetAuto();
                      } else if (info.offset.x > threshold) {
                        prev();
                        resetAuto();
                      }
                    }}
                  >
                    {/* 
                      CRITICAL: objectFit "contain" so transparent PNG
                      is fully visible, NOT cropped like a banner 
                    */}
                    <Image
                      src={SLIDES[current]}
                      alt={`New Drop – BestChappals product ${current + 1}`}
                      fill
                      style={{ objectFit: "contain", userSelect: "none" }}
                      priority
                      unoptimized
                      draggable={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dot indicators */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: "0.75rem" }}>
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { goTo(i, i > current ? 1 : -1); resetAuto(); }}
                    aria-label={`Slide ${i + 1}`}
                    style={{
                      width: i === current ? 24 : 7, height: 7,
                      borderRadius: 100, border: "none", padding: 0, cursor: "pointer",
                      background: i === current ? "#2563EB" : "rgba(0,0,0,0.2)",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* NEW DROP badge */}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              className="hero-badge-new"
              style={{
                position: "absolute", top: "8%", right: "2%",
                width: 76, height: 76, borderRadius: "50%",
                background: "#111111", zIndex: 4,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
              }}
            >
              <span style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: "0.58rem", color: "#fff", textAlign: "center", lineHeight: 1.3, letterSpacing: "0.06em" }}>
                NEW<br />DROP
              </span>
            </motion.div>

            {/* TRENDING badge */}
            <motion.div
              initial={{ scale: 0, x: 20 }} animate={{ scale: 1, x: 0 }}
              transition={{ delay: 1.6, type: "spring", stiffness: 160 }}
              className="hero-badge-trending"
              style={{
                position: "absolute", top: "22%", right: "-1%",
                padding: "5px 13px", borderRadius: 100, zIndex: 4,
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                boxShadow: "0 6px 20px rgba(239,68,68,0.3)",
              }}
            >
              <span style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "0.58rem", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                🔥 Trending
              </span>
            </motion.div>

            {/* FROM price tag */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="hero-price-tag"
              style={{
                position: "absolute", bottom: "14%", left: "4%",
                padding: "7px 16px",
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(12px)",
                borderRadius: 100,
                fontFamily: "Montserrat", fontWeight: 800, fontSize: "0.82rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                zIndex: 4,
              }}
            >
              From ₹299
            </motion.div>

            {/* Arrow nav */}
            {(["prev", "next"] as const).map((btn) => (
              <button
                key={btn}
                className="hero-arrow"
                onClick={() => { btn === "prev" ? prev() : next(); resetAuto(); }}
                aria-label={btn === "prev" ? "Previous" : "Next"}
                style={{
                  position: "absolute",
                  [btn === "prev" ? "left" : "right"]: "-2%",
                  top: "45%", transform: "translateY(-50%)",
                  zIndex: 5, width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid #e5e7eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1)"; }}
              >
                {btn === "prev" ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
        style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}
      >
        <span style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: "#9ca3af", textTransform: "uppercase", fontFamily: "Montserrat" }}>Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 1, height: 28, background: "linear-gradient(to bottom, #9ca3af, transparent)" }} />
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { 
            grid-template-columns: 1fr !important; 
            gap: 2.5rem !important; 
            padding: 1.5rem 0 3rem !important; 
            min-height: auto !important;
          }
          .hero-arrow {
            display: none !important;
          }
          .hero-badge-new {
            top: 0% !important;
            right: 0% !important;
            transform: scale(0.85) !important;
          }
          .hero-badge-trending {
            top: 12% !important;
            right: -2% !important;
            transform: scale(0.85) !important;
          }
          .hero-price-tag {
            bottom: 6% !important;
            left: 2% !important;
            transform: scale(0.85) !important;
          }
        }
      `}</style>
    </section>
  );
}
