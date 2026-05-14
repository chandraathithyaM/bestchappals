"use client";

import { useEffect, useRef } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<{ raf: (t: number) => void; destroy: () => void } | null>(null);

  useEffect(() => {
    // Detect touch/mobile — native scroll is better on touch devices
    const isTouchDevice = () =>
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    if (isTouchDevice()) {
      // Mobile: ensure native scroll works perfectly
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.overscrollBehavior = "auto";
      return;
    }

    let rafId: number;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;

    const init = async () => {
      const { default: Lenis } = await import("lenis");
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        infinite: false,
      });
      lenisRef.current = lenis;

      function raf(time: number) {
        lenis!.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    };

    init();

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}

