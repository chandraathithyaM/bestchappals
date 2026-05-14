"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Edit, Star, PackageX, Eye } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminToast } from "@/components/admin/AdminToast";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";

interface Product {
  id: string; name: string; category: string; price: number;
  offer_price: number | null; images: string[]; stock: number;
  trending: boolean; out_of_stock: boolean; created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useAdminToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);
    if (category) params.set("category", category);

    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast("success", "Product deleted successfully");
      fetchProducts();
    } else {
      toast("error", "Failed to delete product");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const toggleField = async (id: string, field: string, value: boolean) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      toast("success", `Product ${field} updated`);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Products</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)", marginTop: 4 }}>
            {total} products total
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} />
          <input
            className="admin-input"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select className="admin-select" style={{ width: 180 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          <option value="Sneakers">Sneakers</option>
          <option value="Women">Women</option>
          <option value="Slides">Slides</option>
          <option value="Crocs">Crocs</option>
          <option value="Formals">Formals</option>
          <option value="Men">Men</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton type="table" count={8} />
      ) : (
        <div className="admin-table-wrap">
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Trending</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 8, overflow: "hidden",
                          background: "var(--admin-bg)", flexShrink: 0,
                        }}>
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-default">{product.category}</span>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600 }}>₹{product.price}</span>
                        {product.offer_price && (
                          <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", textDecoration: "line-through", marginLeft: 6 }}>
                            ₹{product.offer_price}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{product.stock}</td>
                    <td>
                      <button
                        onClick={() => toggleField(product.id, "trending", !product.trending)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: product.trending ? "#f59e0b" : "var(--admin-text-muted)",
                        }}
                        title={product.trending ? "Remove trending" : "Mark trending"}
                      >
                        <Star size={18} fill={product.trending ? "#f59e0b" : "none"} />
                      </button>
                    </td>
                    <td>
                      {product.out_of_stock ? (
                        <span className="admin-badge admin-badge-danger">Out of Stock</span>
                      ) : (
                        <span className="admin-badge admin-badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/admin/products/${product.id}/edit`} className="admin-btn-icon" title="Edit">
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => toggleField(product.id, "out_of_stock", !product.out_of_stock)}
                          className="admin-btn-icon" title="Toggle stock"
                        >
                          <PackageX size={14} />
                        </button>
                        <button onClick={() => setDeleteId(product.id)} className="admin-btn-icon" title="Delete"
                          style={{ color: "var(--admin-danger)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>
                    No products found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination" style={{ justifyContent: "center", borderTop: "1px solid var(--admin-border)" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`admin-page-btn ${p === page ? "active" : ""}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Product" loading={deleting}
        message="This will permanently delete this product. Users will no longer see it on the website. This action cannot be undone."
      />
    </div>
  );
}
