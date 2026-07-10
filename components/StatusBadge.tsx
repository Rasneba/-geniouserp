"use client";

const DEFAULT_COLORS: Record<string, string> = {
  active: "bg-success",
  pending: "bg-warning",
  pending_payment: "bg-warning",
  completed: "bg-secondary",
  cancelled: "bg-danger",
  inactive: "bg-danger",
  approved: "bg-success",
  rejected: "bg-danger",
  drafted: "bg-secondary",
  submitted: "bg-info",
  paid: "bg-success",
  unpaid: "bg-danger",
  partial: "bg-warning",
  occupied: "bg-warning",
  available: "bg-success",
  reserved: "bg-info",
  maintenance: "bg-danger",
};

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
}

export default function StatusBadge({ status, colorMap }: StatusBadgeProps) {
  const map = { ...DEFAULT_COLORS, ...colorMap };
  const color = map[status] || "bg-secondary";
  return (
    <span className={`badge ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
