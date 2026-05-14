"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface AdminToastCtx {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<AdminToastCtx>({ toast: () => {} });
export const useAdminToast = () => useContext(ToastContext);

let toastId = 0;

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={18} style={{ color: "var(--admin-success)" }} />,
  error: <AlertCircle size={18} style={{ color: "var(--admin-danger)" }} />,
  warning: <AlertTriangle size={18} style={{ color: "var(--admin-warning)" }} />,
  info: <Info size={18} style={{ color: "var(--admin-info)" }} />,
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: "var(--admin-success)",
  error: "var(--admin-danger)",
  warning: "var(--admin-warning)",
  info: "var(--admin-info)",
};

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="admin-toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className="admin-toast"
            style={{ borderLeft: `3px solid ${BORDER_COLORS[t.type]}` }}
          >
            {ICONS[t.type]}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--admin-text-muted)" }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
