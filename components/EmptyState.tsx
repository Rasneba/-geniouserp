"use client";

interface EmptyStateProps {
  message?: string;
  icon?: string;
  children?: React.ReactNode;
}

export default function EmptyState({ message = "No data found", icon = "inbox", children }: EmptyStateProps) {
  return (
    <div className="text-center text-muted py-5">
      <i className={`bi bi-${icon} fs-1 d-block mb-2`}></i>
      <p className="mb-0">{message}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
