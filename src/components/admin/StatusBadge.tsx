"use client";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment";
}

const ORDER_COLORS: Record<string, string> = {
  pending: "admin-badge-warning",
  confirmed: "admin-badge-info",
  processing: "admin-badge-info",
  shipped: "admin-badge-info",
  delivered: "admin-badge-success",
  cancelled: "admin-badge-danger",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "admin-badge-warning",
  paid: "admin-badge-success",
  captured: "admin-badge-success",
  failed: "admin-badge-danger",
  refunded: "admin-badge-default",
};

export default function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  const colorMap = type === "payment" ? PAYMENT_COLORS : ORDER_COLORS;
  const cls = colorMap[status] || "admin-badge-default";

  return (
    <span className={`admin-badge ${cls}`}>
      {status}
    </span>
  );
}
