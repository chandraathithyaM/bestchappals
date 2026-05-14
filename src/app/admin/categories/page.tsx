"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, FolderTree, Check, X } from "lucide-react";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminToast } from "@/components/admin/AdminToast";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";

interface Category {
  id: string; name: string; slug: string; image: string | null;
  productCount: number; created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useAdminToast();

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!newName || !newSlug) { toast("error", "Name and slug required"); return; }
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, slug: newSlug }),
    });
    if (res.ok) {
      toast("success", "Category created");
      setNewName(""); setNewSlug(""); setShowAdd(false);
      fetchCategories();
    } else {
      const data = await res.json();
      toast("error", data.error || "Failed to create category");
    }
  };

  const handleRename = async (id: string) => {
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName, slug: editSlug }),
    });
    if (res.ok) {
      toast("success", "Category updated");
      setEditId(null);
      fetchCategories();
    } else {
      toast("error", "Failed to update category");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    if (res.ok) {
      toast("success", "Category deleted");
      fetchCategories();
    } else {
      const data = await res.json();
      toast("error", data.error || "Failed to delete");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Categories</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)", marginTop: 4 }}>
            {categories.length} categories
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="admin-btn admin-btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <div className="admin-card-body" style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
            <div>
              <label className="admin-label">Name</label>
              <input className="admin-input" value={newName}
                onChange={e => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }}
                placeholder="e.g. Sandals" style={{ width: 200 }} />
            </div>
            <div>
              <label className="admin-label">Slug</label>
              <input className="admin-input" value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="e.g. sandals" style={{ width: 200 }} />
            </div>
            <button onClick={handleAdd} className="admin-btn admin-btn-primary admin-btn-sm">
              <Check size={14} /> Create
            </button>
            <button onClick={() => setShowAdd(false)} className="admin-btn admin-btn-ghost admin-btn-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? <LoadingSkeleton type="table" count={6} /> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    {editId === cat.id ? (
                      <input className="admin-input" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: 160 }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <FolderTree size={16} style={{ color: "var(--admin-primary)" }} />
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {editId === cat.id ? (
                      <input className="admin-input" value={editSlug} onChange={e => setEditSlug(e.target.value)} style={{ width: 140 }} />
                    ) : (
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--admin-text-secondary)" }}>{cat.slug}</span>
                    )}
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-info">{cat.productCount} products</span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)" }}>
                    {new Date(cat.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {editId === cat.id ? (
                        <>
                          <button onClick={() => handleRename(cat.id)} className="admin-btn-icon" style={{ color: "var(--admin-success)" }}>
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditId(null)} className="admin-btn-icon">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditSlug(cat.slug); }}
                            className="admin-btn-icon" title="Rename">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteId(cat.id)} className="admin-btn-icon"
                            style={{ color: "var(--admin-danger)" }} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Category" loading={deleting}
        message="This will delete the category. Products with this category will need to be reassigned." />
    </div>
  );
}
