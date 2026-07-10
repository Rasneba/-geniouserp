"use client";

import Link from "next/link";

export default function AuditLogsPage() {
  return (
    <div className="page-enter">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1"><i className="bi bi-journal-text me-2"></i>Audit Logs</h4>
          <p className="text-muted small mb-0">Audit module</p>
        </div>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-journal-text fs-1 text-muted mb-3 d-block"></i>
          <p className="text-muted mb-0">Coming soon. This module is under development.</p>
        </div>
      </div>
    </div>
  );
}
