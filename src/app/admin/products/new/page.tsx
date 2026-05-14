"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin/AdminToast";
import { Upload, X, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([
    { size: "7", stock: 10 }, { size: "8", stock: 10 }, { size: "9", stock: 10 }, { size: "10", stock: 10 }
  ]);
  const [form, setForm] = useState({
    name: "", description: "", category: "Sneakers", subcategory: "",
    brand: "BestChappals", price: "", offer_price: "",
    trending: false, featured: false, is_new: true, out_of_stock: false,
    tags: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) {
          setImages(prev => [...prev, data.url]);
        } else {
          toast("error", data.error || "Upload failed");
        }
      } catch {
        toast("error", "Upload failed");
      }
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast("error", "Name and price are required");
      return;
    }
    setSaving(true);

    const totalStock = sizes.reduce((s, sz) => s + sz.stock, 0);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        offer_price: form.offer_price ? Number(form.offer_price) : null,
        images,
        sizes,
        stock: totalStock,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
      }),
    });

    if (res.ok) {
      toast("success", "Product created successfully!");
      router.push("/admin/products");
    } else {
      const data = await res.json();
      toast("error", data.error || "Failed to create product");
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/products" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--admin-text-secondary)", textDecoration: "none", marginBottom: 8 }}>
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-grid-2" style={{ gap: 24 }}>
          {/* Left Column */}
          <div>
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div className="admin-card-header"><span className="admin-card-title">Basic Info</span></div>
              <div className="admin-card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="admin-label">Product Name *</label>
                  <input className="admin-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Premium Sneaker" />
                </div>
                <div>
                  <label className="admin-label">Description</label>
                  <textarea className="admin-input" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Product description..." style={{ resize: "vertical" }} />
                </div>
                <div className="admin-grid-2">
                  <div>
                    <label className="admin-label">Category *</label>
                    <select className="admin-select" name="category" value={form.category} onChange={handleChange}>
                      <option value="Sneakers">Sneakers</option>
                      <option value="Women">Women</option>
                      <option value="Slides">Slides</option>
                      <option value="Crocs">Crocs</option>
                      <option value="Formals">Formals</option>
                      <option value="Men">Men</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Brand</label>
                    <input className="admin-input" name="brand" value={form.brand} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div className="admin-card-header"><span className="admin-card-title">Pricing</span></div>
              <div className="admin-card-body">
                <div className="admin-grid-2">
                  <div>
                    <label className="admin-label">Price (₹) *</label>
                    <input className="admin-input" name="price" type="number" value={form.price} onChange={handleChange} required min={1} placeholder="549" />
                  </div>
                  <div>
                    <label className="admin-label">Offer Price (₹)</label>
                    <input className="admin-input" name="offer_price" type="number" value={form.offer_price} onChange={handleChange} placeholder="Original price before discount" />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header"><span className="admin-card-title">Sizes & Stock</span></div>
              <div className="admin-card-body">
                {sizes.map((sz, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                    <input className="admin-input" value={sz.size} onChange={e => setSizes(prev => prev.map((s, idx) => idx === i ? { ...s, size: e.target.value } : s))} style={{ width: 80 }} placeholder="Size" />
                    <input className="admin-input" type="number" value={sz.stock} onChange={e => setSizes(prev => prev.map((s, idx) => idx === i ? { ...s, stock: Number(e.target.value) } : s))} style={{ width: 80 }} placeholder="Stock" min={0} />
                    <button type="button" onClick={() => setSizes(prev => prev.filter((_, idx) => idx !== i))} className="admin-btn-icon" style={{ color: "var(--admin-danger)" }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setSizes(prev => [...prev, { size: "", stock: 10 }])} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ marginTop: 8 }}>
                  <Plus size={14} /> Add Size
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div className="admin-card-header"><span className="admin-card-title">Images</span></div>
              <div className="admin-card-body">
                <label className="admin-dropzone" style={{ display: "block" }}>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
                  <Upload size={24} style={{ margin: "0 auto 8px", color: "var(--admin-text-muted)" }} />
                  <p style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)" }}>
                    {uploading ? "Uploading..." : "Click or drag images here"}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: 4 }}>
                    JPEG, PNG, WebP • Max 5MB each
                  </p>
                </label>
                {images.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                    {images.map((url, i) => (
                      <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: "1px solid var(--admin-border)" }}>
                        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                          style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div className="admin-card-header"><span className="admin-card-title">Status</span></div>
              <div className="admin-card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(["trending", "featured", "is_new", "out_of_stock"] as const).map(field => (
                  <label key={field} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" name={field} checked={(form as any)[field]} onChange={handleChange}
                      style={{ width: 18, height: 18, accentColor: "var(--admin-primary)" }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      {field === "is_new" ? "New Arrival" : field === "out_of_stock" ? "Out of Stock" : field.charAt(0).toUpperCase() + field.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header"><span className="admin-card-title">Tags</span></div>
              <div className="admin-card-body">
                <input className="admin-input" name="tags" value={form.tags} onChange={handleChange} placeholder="sneakers, genz, streetwear" />
                <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: 6 }}>Comma-separated</p>
              </div>
            </div>

            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}
              style={{ width: "100%", marginTop: 20, padding: "12px 20px", fontSize: "0.9rem" }}>
              {saving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
