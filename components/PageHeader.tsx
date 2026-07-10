"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon, children }: PageHeaderProps) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 className="fw-bold mb-1">
          {icon && <i className={`bi bi-${icon} me-2`}></i>}
          {title}
        </h4>
        {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
      </div>
      {children && (
        <div className="d-flex gap-2 align-items-center">
          {children}
        </div>
      )}
    </div>
  );
}
