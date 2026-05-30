"use client";

import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // ─── 1. Register Service Worker ──────────────────────────────────────────
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.error("[PWA] Service Worker registration failed:", err);
          });
      });
    }

    // ─── 2. Intercept BeforeInstallPrompt ─────────────────────────────────────
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser's default automatic bar
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
      // Show custom premium install banner/toast
      // Delay showing by 4 seconds to allow the page to fully load and wow the user first
      setTimeout(() => {
        // Only show if the user hasn't already closed it in this session
        const closed = sessionStorage.getItem("pwa-banner-closed");
        if (!closed) {
          setShowInstallBanner(true);
        }
      }, 4000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // ─── 3. Detect when app is successfully installed ─────────────────────────
    const handleAppInstalled = () => {
      console.log("[PWA] BestChappals PWA installed successfully! Enjoy native experience.");
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native installation prompt
    deferredPrompt.prompt();

    // Wait for user choices
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install prompt outcome: ${outcome}`);

    // Prompt is used, clear it
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleCloseClick = () => {
    setShowInstallBanner(false);
    // Persist in session storage so it doesn't annoy the user during this session
    sessionStorage.setItem("pwa-banner-closed", "true");
  };

  return (
    <AnimatePresence>
      {showInstallBanner && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          style={{
            position: "fixed",
            bottom: "calc(16px + env(safe-area-inset-bottom))",
            left: 16,
            right: 16,
            maxWidth: 420,
            margin: "0 auto",
            background: "rgba(17, 17, 17, 0.94)",
            backdropFilter: "blur(20px)",
            borderRadius: 20,
            padding: "1rem 1.25rem",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
            border: "1.5px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 48px rgba(0,0,0,0.45)",
          }}
        >
          {/* Glowing Brand Icon */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
              fontFamily: "Montserrat",
              fontWeight: 900,
              color: "#fff",
              fontSize: "1.1rem",
              position: "relative",
            }}
          >
            BC
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "#f59e0b",
                borderRadius: "50%",
                padding: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={8} color="#fff" />
            </div>
          </div>

          {/* Copy */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 800,
                fontSize: "0.82rem",
                color: "#ffffff",
                marginBottom: 2,
              }}
            >
              Install BestChappals App
            </h4>
            <p
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "0.72rem",
                color: "#9ca3af",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Add to Home Screen for fast, offline shopping!
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <button
              onClick={handleInstallClick}
              style={{
                padding: "8px 14px",
                background: "#ffffff",
                color: "#111111",
                border: "none",
                borderRadius: 100,
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(255,255,255,0.15)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Download size={11} strokeWidth={2.5} />
              Install
            </button>
            <button
              onClick={handleCloseClick}
              aria-label="Dismiss banner"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.08)",
                color: "#9ca3af",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#9ca3af";
              }}
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
