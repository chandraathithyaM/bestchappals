"use client";

interface LoadingSkeletonProps {
  type: "card" | "table" | "chart" | "text";
  count?: number;
}

export function SkeletonCard() {
  return (
    <div className="stat-card" style={{ minHeight: 110 }}>
      <div style={{ flex: 1 }}>
        <div className="admin-skeleton" style={{ width: 80, height: 12, marginBottom: 12 }} />
        <div className="admin-skeleton" style={{ width: 120, height: 28, marginBottom: 8 }} />
        <div className="admin-skeleton" style={{ width: 100, height: 10 }} />
      </div>
      <div className="admin-skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} style={{ padding: "12px 16px" }}>
          <div className="admin-skeleton" style={{
            width: `${60 + (i * 7) % 35}%`, height: "14px"
          }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonChart() {
  return (
    <div className="admin-skeleton" style={{ width: "100%", height: 300, borderRadius: 12 }} />
  );
}

export default function LoadingSkeleton({ type, count = 4 }: LoadingSkeletonProps) {
  if (type === "card") {
    return (
      <div className="admin-grid-4">
        {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }
  if (type === "table") {
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <tbody>
            {Array.from({ length: count }, (_, i) => <SkeletonTableRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }
  if (type === "chart") return <SkeletonChart />;
  return <div className="admin-skeleton" style={{ width: "60%", height: 16 }} />;
}
