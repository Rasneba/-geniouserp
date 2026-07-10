"use client";

interface LoadingSpinnerProps {
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ text = "Loading...", fullPage = false }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-muted small mb-0">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );
}
