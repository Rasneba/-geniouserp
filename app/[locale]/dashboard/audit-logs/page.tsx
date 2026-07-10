"use client";

import { useEffect, useState } from "react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => { loadLogs(); }, [page]);

  const loadLogs = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/audit-logs?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
        setTotalPages(1);
      } else if (data?.logs) {
        setLogs(data.logs);
        setTotalPages(data.totalPages || Math.ceil(data.total / limit) || 1);
      } else {
        setLogs([]);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Audit Logs</h4>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted py-4">No audit logs found</td></tr>
              ) : (
                logs.map((log: any, i: number) => (
                  <tr key={log.id || i}>
                    <td className="small">{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</td>
                    <td>{log.user_name || log.user_email || log.user || "-"}</td>
                    <td><span className="badge bg-secondary">{log.action || log.event || "-"}</span></td>
                    <td>{log.resource || log.entity || "-"}</td>
                    <td className="small text-muted" style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.details ? (typeof log.details === "string" ? log.details : JSON.stringify(log.details)) : log.description || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <small className="text-muted">Page {page} of {totalPages}</small>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
