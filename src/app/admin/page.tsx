"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Package, ShoppingCart, Users, DollarSign,
  AlertTriangle, TrendingUp, ArrowUpRight, Bell, X, CheckCircle
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  outOfStock: number;
  trendingCount: number;
  recentOrders: any[];
  recentUsers: any[];
  monthlySales: { month: string; revenue: number; count: number }[];
}

interface OrderNotification {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const lastCheckRef = useRef<string>(new Date(Date.now() - 5 * 60 * 1000).toISOString());
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch dashboard data
  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Poll for new order notifications every 30 seconds
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/notifications?since=${encodeURIComponent(lastCheckRef.current)}`);
      const data = await res.json();
      if (data.notifications && data.notifications.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map((n: OrderNotification) => n.id));
          const newOnes = data.notifications.filter((n: OrderNotification) => !existingIds.has(n.id));
          return [...newOnes, ...prev].slice(0, 50); // Keep max 50
        });
      }
      if (data.serverTime) {
        lastCheckRef.current = data.serverTime;
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(); // Initial fetch
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close notification panel on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 24, letterSpacing: "-0.03em" }}>
          Dashboard
        </h1>
        <LoadingSkeleton type="card" count={4} />
        <div style={{ marginTop: 24 }}><LoadingSkeleton type="chart" /></div>
        <div style={{ marginTop: 24 }}><LoadingSkeleton type="table" count={5} /></div>
      </div>
    );
  }

  // Check if data is valid and not an error object
  if (!data || (data as any).error) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center", background: "var(--admin-surface)", borderRadius: 12, border: "1px solid var(--admin-border)" }}>
        <AlertTriangle size={48} color="var(--admin-danger)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Unable to Load Dashboard</h2>
        <p style={{ color: "var(--admin-text-secondary)", fontSize: "0.9rem" }}>
          {(data as any)?.error || "An unexpected error occurred while fetching dashboard data."}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="admin-btn-primary" 
          style={{ marginTop: 20 }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const formatCurrency = (n: any) => {
    const num = Number(n);
    if (isNaN(num)) return "₹0";
    return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Dashboard</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)", marginTop: 4 }}>
            Welcome back! Here&apos;s your store overview.
          </p>
        </div>
        {/* Notification Bell */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: "relative",
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "1px solid var(--admin-border)",
              background: showNotifications ? "var(--admin-primary)" : "var(--admin-surface)",
              color: showNotifications ? "#fff" : "var(--admin-text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              boxShadow: notifications.length > 0 ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
            }}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--admin-bg)",
                  animation: "notifPulse 2s ease-in-out infinite",
                }}
              >
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 52,
                width: 380,
                maxHeight: 480,
                overflowY: "auto",
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: 16,
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                zIndex: 1000,
                animation: "notifSlideIn 0.2s ease-out",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--admin-border)" }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>New Orders</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: 2 }}>
                    {notifications.length} new order{notifications.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--admin-primary)",
                      background: "var(--admin-primary-light)",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--admin-text-muted)" }}>
                  <CheckCircle size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <p style={{ fontSize: "0.85rem" }}>No new orders</p>
                  <p style={{ fontSize: "0.75rem", marginTop: 4 }}>New orders will appear here automatically</p>
                </div>
              ) : (
                <div style={{ padding: "8px" }}>
                  {notifications.map((notif, idx) => (
                    <div
                      key={notif.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "12px",
                        borderRadius: 12,
                        background: idx === 0 ? "rgba(99,102,241,0.06)" : "transparent",
                        transition: "background 0.15s",
                        cursor: "pointer",
                        marginBottom: 4,
                        animation: idx < 3 ? `notifFadeIn 0.3s ease-out ${idx * 0.1}s both` : "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = idx === 0 ? "rgba(99,102,241,0.06)" : "transparent")}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ShoppingCart size={16} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.83rem", marginBottom: 2 }}>
                          🎉 New Order from {notif.customerName}
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "var(--admin-text-secondary)" }}>
                          Amount: <strong>₹{notif.amount.toLocaleString("en-IN")}</strong>
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", marginTop: 3 }}>
                          {getTimeAgo(notif.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id); }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--admin-text-muted)",
                          cursor: "pointer",
                          padding: 4,
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notification animations */}
      <style>{`
        @keyframes notifPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes notifFadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Stats Grid */}
      <div className="admin-grid-4" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total Revenue" value={formatCurrency(data.totalRevenue)}
          icon={<DollarSign size={22} />}
          iconBg="var(--admin-success-light)" iconColor="var(--admin-success)"
        />
        <StatCard
          label="Total Orders" value={data.totalOrders}
          icon={<ShoppingCart size={22} />}
          iconBg="var(--admin-info-light)" iconColor="var(--admin-info)"
        />
        <StatCard
          label="Total Products" value={data.totalProducts}
          icon={<Package size={22} />}
          iconBg="var(--admin-primary-light)" iconColor="var(--admin-primary)"
        />
        <StatCard
          label="Total Users" value={data.totalUsers}
          icon={<Users size={22} />}
          iconBg="var(--admin-warning-light)" iconColor="var(--admin-warning)"
        />
      </div>

      <div className="admin-grid-3" style={{ marginBottom: 24 }}>
        <StatCard
          label="Out of Stock" value={data.outOfStock}
          icon={<AlertTriangle size={22} />}
          iconBg="var(--admin-danger-light)" iconColor="var(--admin-danger)"
        />
        <StatCard
          label="Trending Products" value={data.trendingCount}
          icon={<TrendingUp size={22} />}
          iconBg="var(--admin-primary-light)" iconColor="var(--admin-primary)"
        />
        <StatCard
          label="Avg Order Value"
          value={data.totalOrders > 0 ? formatCurrency(data.totalRevenue / data.totalOrders) : "₹0"}
          icon={<ArrowUpRight size={22} />}
          iconBg="var(--admin-success-light)" iconColor="var(--admin-success)"
        />
      </div>

      {/* Charts */}
      <div className="admin-grid-2" style={{ marginBottom: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Monthly Revenue</span>
          </div>
          <div className="admin-card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlySales}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--admin-text-muted)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--admin-text-muted)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--admin-surface)",
                    border: "1px solid var(--admin-border)",
                    borderRadius: 8, fontSize: "0.8rem"
                  }}
                  formatter={(val: number) => [formatCurrency(val), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Orders per Month</span>
          </div>
          <div className="admin-card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--admin-text-muted)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--admin-text-muted)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--admin-surface)",
                    border: "1px solid var(--admin-border)",
                    borderRadius: 8, fontSize: "0.8rem"
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <span className="admin-card-title">Recent Orders</span>
          <a href="/admin/orders" style={{ fontSize: "0.8rem", color: "var(--admin-primary)", textDecoration: "none", fontWeight: 600 }}>
            View All →
          </a>
        </div>
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
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order: any) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, fontSize: "0.8rem" }}>
                    {order.id.substring(0, 8)}...
                  </td>
                  <td>{order.shipping_address?.fullName || "N/A"}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(order.amount)}</td>
                  <td><StatusBadge status={order.payment_status} type="payment" /></td>
                  <td><StatusBadge status={order.order_status} type="order" /></td>
                  <td style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)" }}>
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
              {data.recentOrders.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--admin-text-muted)" }}>
                  No orders yet
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
