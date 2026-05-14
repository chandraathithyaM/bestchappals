"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: number;       // e.g. +12.5 or -3.2
  trendLabel?: string;  // e.g. "vs last month"
}

export default function StatCard({
  label, value, icon, iconBg, iconColor, trend, trendLabel
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
        {trend !== undefined && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            marginTop: 6, fontSize: "0.75rem", fontWeight: 600
          }}>
            {trend >= 0 ? (
              <TrendingUp size={14} style={{ color: "var(--admin-success)" }} />
            ) : (
              <TrendingDown size={14} style={{ color: "var(--admin-danger)" }} />
            )}
            <span style={{
              color: trend >= 0 ? "var(--admin-success)" : "var(--admin-danger)"
            }}>
              {trend >= 0 ? "+" : ""}{trend}%
            </span>
            {trendLabel && (
              <span style={{ color: "var(--admin-text-muted)", fontWeight: 400 }}>
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="stat-card-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
    </div>
  );
}
