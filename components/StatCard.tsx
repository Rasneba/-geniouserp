"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  onClick?: () => void;
}

export default function StatCard({ label, value, icon, color = "primary", onClick }: StatCardProps) {
  return (
    <div
      className="card border-0 shadow-sm h-100"
      style={onClick ? { cursor: "pointer" } : undefined}
      onClick={onClick}
    >
      <div className="card-body d-flex align-items-center gap-3 p-3">
        <div className={`rounded-3 bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center`}
          style={{ width: 48, height: 48, flexShrink: 0 }}>
          <i className={`bi bi-${icon} fs-4 text-${color}`}></i>
        </div>
        <div className="min-w-0">
          <div className="text-muted small text-nowrap">{label}</div>
          <div className="fw-bold fs-5">{value}</div>
        </div>
      </div>
    </div>
  );
}
