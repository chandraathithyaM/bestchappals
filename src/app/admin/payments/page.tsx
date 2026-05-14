"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

export default function PaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 24 }}>Payment Analytics</h1>
      <LoadingSkeleton type="card" count={4} />
      <div style={{ marginTop: 24 }}><LoadingSkeleton type="chart" /></div>
    </div>
  );

  if (!data) return <p>Failed to load payment data.</p>;

  const formatCurrency = (n: number) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 24 }}>Payment Analytics</h1>

      <div className="admin-grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)}
          icon={<DollarSign size={22} />} iconBg="var(--admin-success-light)" iconColor="var(--admin-success)" />
        <StatCard label="Successful Payments" value={data.successfulPayments}
          icon={<CheckCircle size={22} />} iconBg="var(--admin-success-light)" iconColor="var(--admin-success)" />
        <StatCard label="Failed Payments" value={data.failedPayments}
          icon={<XCircle size={22} />} iconBg="var(--admin-danger-light)" iconColor="var(--admin-danger)" />
        <StatCard label="Avg Transaction"
          value={data.successfulPayments > 0 ? formatCurrency(data.totalRevenue / data.successfulPayments) : "₹0"}
          icon={<TrendingUp size={22} />} iconBg="var(--admin-info-light)" iconColor="var(--admin-info)" />
      </div>

      <div className="admin-grid-2" style={{ marginBottom: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header"><span className="admin-card-title">Daily Revenue (30 days)</span></div>
          <div className="admin-card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyRevenue}>
                <defs>
                  <linearGradient id="colorDailyRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--admin-text-muted)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--admin-text-muted)" />
                <Tooltip contentStyle={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 8, fontSize: "0.8rem" }}
                  formatter={(val: number) => [formatCurrency(val), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorDailyRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-header"><span className="admin-card-title">Monthly Revenue</span></div>
          <div className="admin-card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--admin-text-muted)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--admin-text-muted)" />
                <Tooltip contentStyle={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 8, fontSize: "0.8rem" }}
                  formatter={(val: number) => [formatCurrency(val), "Revenue"]} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header"><span className="admin-card-title">Top Customers</span></div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr><th>Customer</th><th>Email</th><th>Orders</th><th>Total Spent</th></tr>
            </thead>
            <tbody>
              {(data.topCustomers || []).map((c: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ fontSize: "0.8rem" }}>{c.email}</td>
                  <td>{c.orders}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(c.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="admin-card">
        <div className="admin-card-header"><span className="admin-card-title">Recent Transactions</span></div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr><th>Payment ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {(data.recentTransactions || []).map((t: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{t.paymentId || "N/A"}</td>
                  <td>{t.customer}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(t.amount)}</td>
                  <td><StatusBadge status={t.status} type="payment" /></td>
                  <td style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)" }}>
                    {new Date(t.date).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
