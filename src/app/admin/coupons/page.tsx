"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminToast } from "@/components/admin/AdminToast";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";

interface Coupon {
  id: string; code: string; description: string;
  discount_type: string; discount_value: number;
  min_order: number; max_discount: number | null;
  usage_limit: number | null; used_count: number;
  is_active: boolean; expires_at: string | null; created_at: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useAdminToast();
  const [form, setForm] = useState({
    code: "", description: "", discount_type: "percentage",
    discount_value: "", min_order: "", max_discount: "",
    usage_limit: "", expires_at: "",
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.coupons || []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleAdd = async () => {
    if (!form.code || !form.discount_value) { toast("error", "Code and discount required"); return; }
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discount_value: Number(form.discount_value),
        min_order: form.min_order ? Number(form.min_order) : 0,
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at || null,
      }),
    });
    if (res.ok) {
      toast("success", "Coupon created");
      setShowAdd(false);
      setForm({ code: "", description: "", discount_type: "percentage", discount_value: "", min_order: "", max_discount: "", usage_limit: "", expires_at: "" });
      fetchCoupons();
    } else {
      const data = await res.json();
      toast("error", data.error || "Failed to create");
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    const res = await fetch("/api/admin/coupons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: active }),
    });
    if (res.ok) {
      toast("success", active ? "Coupon activated" : "Coupon deactivated");
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: active } : c));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch("/api/admin/coupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    if (res.ok) { toast("success", "Coupon deleted"); fetchCoupons(); }
    setDeleting(false); setDeleteId(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Coupons</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)", marginTop: 4 }}>
            {coupons.length} coupons
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="admin-btn admin-btn-primary">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <div className="admin-table-wrap">
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => (
                  <tr key={coupon.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.05em", fontSize: "0.9rem" }}>
                        {coupon.code}
                      </span>
                      {coupon.description && (
                        <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: 2 }}>
                          {coupon.description}
                        </p>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `₹${coupon.discount_value}`}
                      {coupon.max_discount && (
                        <span style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", display: "block" }}>
                          Max ₹{coupon.max_discount}
                        </span>
                      )}
                    </td>
                    <td>₹{coupon.min_order}</td>
                    <td>
                      {coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ""}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)" }}>
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString("en-IN")
                        : "Never"}
                    </td>
                    <td>
                      {coupon.is_active
                        ? <span className="admin-badge admin-badge-success">Active</span>
                        : <span className="admin-badge admin-badge-default">Inactive</span>}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => toggleActive(coupon.id, !coupon.is_active)}
                          className="admin-btn-icon" title={coupon.is_active ? "Deactivate" : "Activate"}
                          style={{ color: coupon.is_active ? "var(--admin-warning)" : "var(--admin-success)" }}>
                          {coupon.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => setDeleteId(coupon.id)} className="admin-btn-icon"
                          style={{ color: "var(--admin-danger)" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>No coupons yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Coupon"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleAdd}>Create</button>
          </>
        }>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="admin-label">Coupon Code *</label>
            <input className="admin-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. SAVE20" style={{ textTransform: "uppercase" }} />
          </div>
          <div>
            <label className="admin-label">Description</label>
            <input className="admin-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="20% off on all sneakers" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="admin-label">Type</label>
              <select className="admin-select" value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Value *</label>
              <input className="admin-input" type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} placeholder="20" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="admin-label">Min Order (₹)</label>
              <input className="admin-input" type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} placeholder="500" />
            </div>
            <div>
              <label className="admin-label">Max Discount (₹)</label>
              <input className="admin-input" type="number" value={form.max_discount} onChange={e => setForm(f => ({ ...f, max_discount: e.target.value }))} placeholder="200" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="admin-label">Usage Limit</label>
              <input className="admin-input" type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} placeholder="100" />
            </div>
            <div>
              <label className="admin-label">Expires At</label>
              <input className="admin-input" type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Coupon" loading={deleting} message="This coupon will be permanently deleted." />
    </div>
  );
}
