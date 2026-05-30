"use client";

import { useEffect, useState } from "react";
import { WifiOff, RotateCcw, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline  = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online",  handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online",  handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      if (navigator.onLine) {
        window.location.href = "/";
      } else {
        // Simple shake animation trigger or alert toast
        alert("You are still offline. Please check your internet connection.");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #090d16 0%, #030408 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        color: "#ffffff",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          padding: "3rem 2rem",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Glowing Ambient Backdrop */}
        <div
          style={{
            position: "absolute",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)",
            top: "15%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Status Icon */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)",
            border: "1.5px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 2rem",
            boxShadow: "0 10px 30px rgba(239, 68, 68, 0.15)",
          }}
        >
          <WifiOff size={42} color="#ef4444" />
        </motion.div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 900,
            fontSize: "1.8rem",
            letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
            background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Connection Lost
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            color: "#9ca3af",
            lineHeight: 1.6,
            marginBottom: "2.5rem",
          }}
        >
          Oops! It seems you are currently offline. Please check your internet connection or try again.
        </p>

        {/* Status Indicator */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 100,
            background: isOnline ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
            border: isOnline ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: isOnline ? "#22c55e" : "#f59e0b",
            fontFamily: "Montserrat",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "2rem",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: isOnline ? "#22c55e" : "#f59e0b",
              display: "inline-block",
              boxShadow: isOnline ? "0 0 8px #22c55e" : "0 0 8px #f59e0b",
            }}
          />
          {isOnline ? "Connection Restored!" : "Still Offline"}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={handleRetry}
            style={{
              width: "100%",
              padding: "0.95rem",
              background: "#2563EB",
              color: "#ffffff",
              border: "none",
              borderRadius: 100,
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.3)",
              transition: "transform 0.2s, background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1d4ed8";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2563EB";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <RotateCcw size={15} />
            Try Reconnecting
          </button>

          <Link
            href="/"
            style={{
              width: "100%",
              padding: "0.95rem",
              background: "transparent",
              color: "#ffffff",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 100,
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "border-color 0.2s, background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <ArrowLeft size={15} />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
