"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Download, Eye, ChevronDown } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import { useAdminToast } from "@/components/admin/AdminToast";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";

const ORDER_STATUSES = ["processing", "delivered"];
const DEFAULT_STATUSES = ["processing", "delivered"]; // Only show processed & completed orders

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast } = useAdminToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);
    if (statusFilter) {
      params.set("status", statusFilter);
    } else {
      // Default: only show processing and delivered orders
      params.set("statuses", DEFAULT_STATUSES.join(","));
    }
    if (paymentFilter) params.set("paymentStatus", paymentFilter);

    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search, statusFilter, paymentFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const downloadInvoice = async (id: string) => {
    try {
      toast("info", "Generating invoice...");
      const res = await fetch(`/api/admin/orders/${id}/invoice`);
      if (!res.ok) throw new Error("Failed to generate invoice");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${id.substring(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast("success", "Invoice downloaded");
    } catch (err) {
      toast("error", "Failed to download invoice");
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, order_status: newStatus }),
    });
    if (res.ok) {
      toast("success", `Order status updated to ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    } else {
      toast("error", "Failed to update status");
    }
  };

  const exportCSV = async () => {
    const res = await fetch("/api/admin/orders/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast("success", "Orders exported to CSV");
  };

  const formatCurrency = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Orders</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)", marginTop: 4 }}>{total} processed & completed orders</p>
        </div>
        <button onClick={exportCSV} className="admin-btn admin-btn-ghost">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} />
          <input className="admin-input" placeholder="Search by payment ID or order ID..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 36 }} />
        </div>
        <select className="admin-select" style={{ width: 160 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className="admin-select" style={{ width: 160 }} value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}>
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? <LoadingSkeleton type="table" count={8} /> : (
        <div className="admin-table-wrap">
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, fontSize: "0.8rem", fontFamily: "monospace" }}>
                      {order.id.substring(0, 8)}...
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 500, fontSize: "0.85rem" }}>
                          {order.shipping_address?.fullName || "N/A"}
                        </span>
                        <br />
                        <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                          {order.shipping_address?.phone || ""}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(order.amount)}</td>
                    <td><StatusBadge status={order.payment_status} type="payment" /></td>
                    <td>
                      <select
                        className="admin-select"
                        value={order.order_status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        style={{ width: 130, padding: "4px 28px 4px 8px", fontSize: "0.78rem" }}
                      >
                        {ORDER_STATUSES.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)" }}>
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setSelectedOrder(order)} className="admin-btn-icon" title="View Details">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => downloadInvoice(order.id)} className="admin-btn-icon" title="Download Invoice">
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="admin-pagination" style={{ justifyContent: "center", borderTop: "1px solid var(--admin-border)" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`admin-page-btn ${p === page ? "active" : ""}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details">
        {selectedOrder && (
          <div style={{ fontSize: "0.85rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div><strong>Order ID:</strong><br /><span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{selectedOrder.id}</span></div>
              <div><strong>Date:</strong><br />{new Date(selectedOrder.created_at).toLocaleString("en-IN")}</div>
              <div><strong>Amount:</strong><br />{formatCurrency(selectedOrder.amount)}</div>
              <div><strong>Payment ID:</strong><br /><span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{selectedOrder.payment_id || "N/A"}</span></div>
            </div>
            <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: 12, marginBottom: 12 }}>
              <strong>Customer:</strong>
              <p>{selectedOrder.shipping_address?.fullName}</p>
              <p>{selectedOrder.shipping_address?.phone}</p>
              <p>{selectedOrder.shipping_address?.email}</p>
              <p>{selectedOrder.shipping_address?.addressLine1}, {selectedOrder.shipping_address?.city} - {selectedOrder.shipping_address?.pincode}</p>
            </div>
            <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: 12 }}>
              <strong>Products:</strong>
              {(selectedOrder.products || []).map((p: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--admin-border)" }}>
                  {p.image && <img src={p.image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Size: {p.size} × {p.quantity}</div>
                  </div>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(p.subtotal)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => downloadInvoice(selectedOrder.id)} className="admin-btn admin-btn-primary">
                <Download size={16} /> Download Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
