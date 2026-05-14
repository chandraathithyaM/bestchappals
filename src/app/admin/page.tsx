"use client";

import { useEffect, useState } from "react";
import {
  Package, ShoppingCart, Users, DollarSign,
  AlertTriangle, TrendingUp, ArrowUpRight
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

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Dashboard</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)", marginTop: 4 }}>
            Welcome back! Here&apos;s your store overview.
          </p>
        </div>
      </div>

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
