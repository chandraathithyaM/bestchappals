"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseRazorpayOptions {
  onLoad?: () => void;
  onError?: () => void;
}

// Loads the Razorpay checkout.js script dynamically
export function useRazorpayScript(options?: UseRazorpayOptions) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    if (typeof window === "undefined") return;

    // Already loaded
    if (window.Razorpay) {
      loadedRef.current = true;
      options?.onLoad?.();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      loadedRef.current = true;
      options?.onLoad?.();
    };
    script.onerror = () => {
      console.error("[Razorpay] Failed to load checkout script");
      options?.onError?.();
    };
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// Open the Razorpay payment popup
export function openRazorpayPopup(options: RazorpayOptions): void {
  if (typeof window === "undefined" || !window.Razorpay) {
    throw new Error("Razorpay SDK not loaded");
  }
  const rzp = new window.Razorpay(options);
  rzp.open();
}
