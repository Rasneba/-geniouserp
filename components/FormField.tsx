"use client";

import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export default function FormField({ label, error, required, children, className = "" }: FormFieldProps) {
  return (
    <div className={`mb-3 ${className}`}>
      <label className="form-label fw-semibold small">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      {children}
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
