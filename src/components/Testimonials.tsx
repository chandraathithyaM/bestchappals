"use client";

import { motion } from "framer-motion";

const testimonials = [
  { id: 1, name: "Priya M.", location: "Chennai", text: "Amazing quality! Got my sneakers within 2 days. Super premium packaging. Will definitely order again!", rating: 5, product: "Genz Casual Low-Top" },
  { id: 2, name: "Rahul S.", location: "Bangalore", text: "Best crocs I've bought online. Ultra comfortable for daily wear. The cushion is top-notch.", rating: 5, product: "LiteRide Crocs" },
  { id: 3, name: "Anjali K.", location: "Coimbatore", text: "Ordered for my daughter. The Ladies collection has really trendy options. Fast delivery!", rating: 5, product: "Soft Cushion Heel" },
  { id: 4, name: "Karthik R.", location: "Salem", text: "Very genuine quality. Ordered via WhatsApp and the process was smooth. Great experience.", rating: 5, product: "Bata V-Strap" },
  { id: 5, name: "Divya P.", location: "Madurai", text: "The slides are so comfortable! Good value for money. Highly recommend!", rating: 5, product: "Flip Flop Elite" },
];

function Stars({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#111"><path d="M7 1l1.545 3.13 3.455.502-2.5 2.435.59 3.44L7 8.885 3.91 10.507l.59-3.44L2 4.632l3.455-.502z" /></svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section style={{ padding: "6rem 0", background: "#f5f5f5" }}>
      <div className="container-xl">
        <div style={{ marginBottom: "3rem" }}>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-label" style={{ marginBottom: 12 }}>Customer Love</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-title">What People Say</motion.h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }} className="reviews-grid">
          {testimonials.slice(0, 3).map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: "#fff", borderRadius: 20, padding: "1.75rem", boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}>
              <Stars count={t.rating} />
              <p style={{ fontFamily: "Poppins", fontSize: "0.88rem", lineHeight: 1.7, color: "#374151", margin: "1rem 0", fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.82rem", color: "#111" }}>{t.name}</p>
                  <p style={{ fontSize: "0.68rem", color: "#9ca3af" }}>{t.location}</p>
                </div>
                <span style={{ fontSize: "0.62rem", fontFamily: "Montserrat", fontWeight: 600, color: "#2563EB" }}>{t.product}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem", marginTop: "1.25rem" }} className="reviews-grid-2">
          {testimonials.slice(3).map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: "#fff", borderRadius: 20, padding: "1.75rem", boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}>
              <Stars count={t.rating} />
              <p style={{ fontFamily: "Poppins", fontSize: "0.88rem", lineHeight: 1.7, color: "#374151", margin: "1rem 0", fontStyle: "italic" }}>"{t.text}"</p>
              <div><p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.82rem", color: "#111" }}>{t.name}</p><p style={{ fontSize: "0.68rem", color: "#9ca3af" }}>{t.location}</p></div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media(max-width:1024px){.reviews-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:640px){.reviews-grid,.reviews-grid-2{grid-template-columns:1fr!important;}}
      `}</style>
    </section>
  );
}
