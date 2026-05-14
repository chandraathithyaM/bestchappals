"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const GALLERY_IMAGES = [
  "/products/first_prefer_Ladies/img-1.jpg",
  "/products/first_prefer_sneakers/img-8.jpg",
  "/products/first_prefer_slides/img-4.jpg",
  "/products/first_prefer_crocks/img-6.jpg",
  "/products/first_prefer_Ladies/img-5.jpg",
  "/products/first_prefer_Mens&Boys/img-14.jpg",
  "/products/first_prefer_Ladies/img-13.jpg",
  "/products/first_prefer_sneakers/img-3.jpg",
  "/products/first_prefer_formals/img-4.jpg",
];

export default function InstagramGallery() {
  return (
    <section style={{ padding: "6rem 0", background: "#ffffff" }}>
      <div className="container-xl">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-label" style={{ marginBottom: 12 }}>
            @best_chappals_puliampatti
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-title">
            Our Latest Drops
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ color: "#6b7280", fontFamily: "Poppins", fontSize: "0.9rem", marginTop: 12 }}>
            Follow us on Instagram for daily product updates
          </motion.p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }} className="gallery-grid">
          {GALLERY_IMAGES.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.02 }}
              style={{ position: "relative", aspectRatio: "4/5", borderRadius: 12, overflow: "hidden", background: "#f0f0f0", cursor: "pointer" }}
            >
              <Image src={src} alt={`BestChappals drop ${i + 1}`} fill style={{ objectFit: "cover" }} unoptimized />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{ position: "absolute", inset: 0, background: "rgba(17,17,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <a href="https://www.instagram.com/best_chappals_puliampatti__/" target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.72rem", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", padding: "8px 18px", border: "1.5px solid rgba(255,255,255,0.7)", borderRadius: 100 }}>
                  View on IG
                </a>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <a href="https://www.instagram.com/best_chappals_puliampatti__/" target="_blank" rel="noopener noreferrer" className="btn btn-outline" id="follow-instagram">
            Follow @best_chappals_puliampatti
          </a>
        </motion.div>
      </div>
      <style>{`@media(max-width:640px){.gallery-grid{grid-template-columns:repeat(3,1fr)!important;gap:0.4rem!important;}}`}</style>
    </section>
  );
}
