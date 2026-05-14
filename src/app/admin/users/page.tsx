"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Shield, ShieldOff } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToast";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { toast } = useAdminToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleBlock = async (userId: string, block: boolean) => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, is_blocked: block }),
    });
    if (res.ok) {
      toast("success", block ? "User blocked" : "User unblocked");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: block } : u));
    } else {
      toast("error", "Failed to update user");
    }
  };

  const formatCurrency = (n: number) => "₹" + Number(n || 0).toLocaleString("en-IN");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Users</h1>
        <p style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)", marginTop: 4 }}>{total} users total</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ position: "relative", maxWidth: 400 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} />
          <input className="admin-input" placeholder="Search by name or email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      {loading ? <LoadingSkeleton type="table" count={8} /> : (
        <div className="admin-table-wrap">
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {user.image_url ? (
                          <img src={user.image_url} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--admin-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-primary)" }}>
                            {(user.first_name || "U")[0]}
                          </div>
                        )}
                        <span style={{ fontWeight: 500 }}>
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>{user.email || "N/A"}</td>
                    <td style={{ fontSize: "0.8rem" }}>{user.phone || "N/A"}</td>
                    <td>{user.total_orders}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(user.total_spent)}</td>
                    <td style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)" }}>
                      {new Date(user.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      {user.is_blocked ? (
                        <span className="admin-badge admin-badge-danger">Blocked</span>
                      ) : (
                        <span className="admin-badge admin-badge-success">Active</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleBlock(user.id, !user.is_blocked)}
                        className="admin-btn-icon"
                        title={user.is_blocked ? "Unblock user" : "Block user"}
                        style={{ color: user.is_blocked ? "var(--admin-success)" : "var(--admin-danger)" }}
                      >
                        {user.is_blocked ? <Shield size={14} /> : <ShieldOff size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>No users found</td></tr>
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
    </div>
  );
}
