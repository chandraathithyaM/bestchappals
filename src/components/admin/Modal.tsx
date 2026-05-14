"use client";

import { ReactNode } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} className="admin-btn-icon" style={{ border: "none" }}>
            <X size={16} />
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// Confirmation modal shorthand
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message, confirmLabel = "Delete", loading
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="admin-btn admin-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="admin-btn admin-btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "..." : confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "var(--admin-danger-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <AlertTriangle size={20} style={{ color: "var(--admin-danger)" }} />
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", lineHeight: 1.6 }}>
          {message}
        </p>
      </div>
    </Modal>
  );
}
