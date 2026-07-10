"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  show: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  show,
  title = "Confirm",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (show) {
      const t = setTimeout(() => btnRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h6 className="modal-title fw-bold">{title}</h6>
          </div>
          <div className="modal-body">
            <p className="mb-0 small">{message}</p>
          </div>
          <div className="modal-footer border-0 pt-0">
            <button className="btn btn-sm btn-outline-secondary" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button ref={btnRef} className={`btn btn-sm btn-${variant}`} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
