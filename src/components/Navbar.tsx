"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, PackageSearch, LogIn } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";


const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Men", href: "/category/men" },
  { label: "Women", href: "/category/women" },
  { label: "Sneakers", href: "/category/sneakers" },
  { label: "Slides", href: "/category/slides" },
  { label: "Crocs", href: "/category/crocs" },
  { label: "Formals", href: "/category/formals" },
  { label: "New Arrivals", href: "/new-arrivals" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted]       = useState(false);
  const { count, openCart, wishlist } = useCartStore();
  const { isSignedIn, user } = useUser();
  const cartCount = count();

  const isAdminPage = pathname?.startsWith("/admin");

  // Prevent hydration mismatch — only show live counts after client mount
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  if (isAdminPage) return null;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(255,255,255,0.92)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid #e5e7eb" : "none",
          height: "72px",
        }}
      >
        <div className="container-xl h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
              <Image
                src="/logo.png"
                alt="BestChappals Logo"
                width={42}
                height={42}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                priority
                unoptimized
              />
            </div>
            <div className="flex flex-col leading-none">
              <span
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 900,
                  fontSize: "1.15rem",
                  letterSpacing: "-0.03em",
                  color: "#111111",
                }}
              >
                BEST<span style={{ color: "#2563EB" }}>CHAPPALS</span>
              </span>
              <span
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  color: "#6b7280",
                  textTransform: "uppercase",
                }}
              >
                Puliampatti
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search size={18} />
            </button>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: "#111" }}
            >
              <Heart size={18} />
              {mounted && wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* My Orders */}
            {mounted && isSignedIn && (
              <div className="flex items-center gap-2">
                {(user?.publicMetadata as any)?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-blue-100"
                    style={{ fontFamily: "Montserrat", pointerEvents: "auto", zIndex: 60 }}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/orders"
                  aria-label="My Orders"
                  className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  title="My Orders"
                  style={{ color: "#111" }}
                >
                  <PackageSearch size={18} />
                </Link>
              </div>
            )}

            {/* Auth: UserButton or Sign In */}
            {mounted && (
              isSignedIn ? (
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              ) : (
                <SignInButton mode="modal">
                  <button
                    id="sign-in-btn"
                    aria-label="Sign In"
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium"
                    style={{ fontFamily: "Poppins", fontSize: "0.78rem" }}
                  >
                    <LogIn size={14} />
                    Sign In
                  </button>
                </SignInButton>
              )
            )}

            <button
              aria-label="Cart"
              id="cart-button"
              onClick={openCart}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ShoppingBag size={18} />
              {mounted && cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black rounded-full text-white text-[9px] flex items-center justify-center font-bold"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Hamburger */}
            <button
              aria-label="Menu"
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="mobile-menu"
            style={{ paddingTop: "5rem" }}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white"
            >
              <X size={20} />
            </button>

            {/* Brand */}
            <div className="mb-10 flex items-center gap-3">
              <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                <Image
                  src="/logo.png"
                  alt="BestChappals Logo"
                  width={48}
                  height={48}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  unoptimized
                />
              </div>
              <div>
                <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: "1.5rem", color: "#fff", letterSpacing: "-0.03em" }}>
                  BEST<span style={{ color: "#2563EB" }}>CHAPPALS</span>
                </div>
                <div style={{ fontFamily: "Poppins", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  Puliampatti
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "block",
                      fontFamily: "Montserrat",
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      color: "#ffffff",
                      textDecoration: "none",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * NAV_LINKS.length, duration: 0.3 }}
              >
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontFamily: "Montserrat",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "0.5rem 0",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Wishlist {mounted && wishlist.length > 0 && <span style={{ fontSize: "0.8rem", background: "#ef4444", padding: "2px 8px", borderRadius: 10 }}>{wishlist.length}</span>}
                </Link>
              </motion.div>
            </nav>

            <div className="mt-auto pt-8 flex flex-col gap-3">
              {isSignedIn ? (
                <>
                  {(user?.publicMetadata as any)?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="btn btn-white"
                      style={{ fontSize: "0.75rem", justifyContent: "center", border: "1px solid #2563EB", color: "#2563EB" }}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-white"
                    style={{ fontSize: "0.75rem", justifyContent: "center" }}
                  >
                    <PackageSearch size={15} /> My Orders
                  </Link>
                </>
              ) : (
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-white"
                    style={{ fontSize: "0.75rem", width: "100%", justifyContent: "center" }}
                  >
                    <LogIn size={15} /> Sign In / Register
                  </button>
                </SignInButton>
              )}
              <a
                href="https://wa.me/918838247446"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-white"
                style={{ fontSize: "0.75rem" }}
              >
                Order on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
