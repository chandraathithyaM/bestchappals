"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, MapPin, Phone } from "lucide-react";

function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer style={{ background: "#111111", color: "#fff", padding: "5rem 0 2rem" }}>
      <div className="container-xl">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", paddingBottom: "4rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: "1.4rem", letterSpacing: "-0.03em", marginBottom: 6 }}>
              BEST<span style={{ color: "#2563EB" }}>CHAPPALS</span>
            </div>
            <div style={{ fontFamily: "Poppins", fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
              Puliampatti · Tamil Nadu
            </div>
            <p style={{ fontFamily: "Poppins", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 24, maxWidth: 260 }}>
              Premium footwear for every step. Shop online and get delivered all over India.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="https://www.instagram.com/best_chappals_puliampatti__/" target="_blank" rel="noopener noreferrer"
                style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all 0.3s" }}>
                <InstagramIcon />
              </a>
              <a href="https://wa.me/918838247446" target="_blank" rel="noopener noreferrer"
                style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all 0.3s" }}>
                <MessageCircle size={17} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Shop</h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Men's", "/category/men"], ["Women's", "/category/women"], ["Sneakers", "/category/sneakers"], ["Slides", "/category/slides"], ["Crocs", "/category/crocs"], ["Formals", "/category/formals"]].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontFamily: "Poppins", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Info */}
          <div>
            <h4 style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Info</h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["New Arrivals", "/new-arrivals"], ["About Us", "/about"], ["Contact", "/contact"]].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontFamily: "Poppins", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <MapPin size={15} style={{ color: "#2563EB", flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: "Poppins", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                  Sathy Main Road,<br />Puliampatti, Tamil Nadu
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Phone size={15} style={{ color: "#2563EB", flexShrink: 0 }} />
                <a href="tel:+918838247446" style={{ fontFamily: "Poppins", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                  +91 88382 47446
                </a>
              </div>
              <a href="https://wa.me/918838247446" target="_blank" rel="noopener noreferrer" className="btn btn-dark"
                style={{ marginTop: 8, fontSize: "0.72rem", background: "#25D366", border: "none" }}>
                <MessageCircle size={14} /> WhatsApp Order
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "Poppins", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
            © 2026 BestChappals, Puliampatti. All rights reserved.
          </p>
          <p style={{ fontFamily: "Poppins", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
            Made with ♥ in Tamil Nadu
          </p>
        </div>
      </div>
      <style>{`
        @media(max-width:1024px){.footer-grid{grid-template-columns:1fr 1fr!important;gap:2rem!important;}}
        @media(max-width:640px){.footer-grid{grid-template-columns:1fr!important;}}
      `}</style>
    </footer>
  );
}
