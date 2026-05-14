"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";

// ─── Toast Types ──────────────────────────────────────────────────────────────
export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

type ToastAction =
  | { type: "ADD"; toast: Toast }
  | { type: "REMOVE"; id: string };

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
} | null>(null);

function toastReducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case "ADD":
      return [...state.slice(-3), action.toast]; // max 4 at once
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({ type: "ADD", toast: { id, message, variant, duration } });
      setTimeout(() => dispatch({ type: "REMOVE", id }), duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Toast UI ─────────────────────────────────────────────────────────────────
const variantStyles: Record<ToastVariant, { bg: string; icon: string; border: string }> = {
  success: { bg: "#f0fdf4", icon: "✓", border: "#22c55e" },
  error:   { bg: "#fef2f2", icon: "✕", border: "#ef4444" },
  warning: { bg: "#fffbeb", icon: "⚠", border: "#f59e0b" },
  info:    { bg: "#eff6ff", icon: "i", border: "#3b82f6" },
};

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        zIndex: 9999,
        maxWidth: "min(400px, calc(100vw - 2rem))",
      }}
    >
      {toasts.map((toast) => {
        const style = variantStyles[toast.variant];
        return (
          <div
            key={toast.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "1rem 1.25rem",
              background: style.bg,
              borderLeft: `4px solid ${style.border}`,
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              animation: "slideInUp 0.35s cubic-bezier(0.16,1,0.3,1)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: style.border,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {style.icon}
            </span>
            <p
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "0.85rem",
                color: "#111",
                lineHeight: 1.5,
                flex: 1,
              }}
            >
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: "1rem",
                lineHeight: 1,
                padding: "0 0 0 0.25rem",
              }}
            >
              ×
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
