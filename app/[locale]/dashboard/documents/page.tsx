"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DocumentsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"templates" | "generated">("templates");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const load = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) { setLoading(false); return; }
      try {
        const [tRes, dRes] = await Promise.all([
          fetch("/api/documents/templates", { headers: { Authorization: `Bearer ${tok}` } }),
          fetch("/api/documents", { headers: { Authorization: `Bearer ${tok}` } }),
        ]);
        const tData = await tRes.json();
        const dData = await dRes.json();
        if (Array.isArray(tData)) setTemplates(tData);
        if (Array.isArray(dData)) setDocuments(dData);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, []);

  const deleteDocument = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    try {
      await fetch(`/api/documents/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Documents</h4>
        <div className="btn-group">
          <button className={`btn btn-sm ${tab === "templates" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTab("templates")}>
            <i className="bi bi-file-earmark me-1"></i>Templates
          </button>
          <button className={`btn btn-sm ${tab === "generated" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTab("generated")}>
            <i className="bi bi-files me-1"></i>Generated Documents
          </button>
        </div>
      </div>

      {tab === "templates" && (
        <div className="row g-3">
          {templates.length === 0 ? (
            <div className="col-12"><div className="text-muted text-center py-4">No templates found</div></div>
          ) : (
            templates.map((t: any) => (
              <div key={t.id} className="col-md-4 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-file-earmark-text fs-3 text-primary"></i>
                      <div>
                        <h6 className="mb-0 fw-semibold">{t.name}</h6>
                        <span className="badge bg-secondary">{t.type || "General"}</span>
                      </div>
                    </div>
                    {t.code && <div className="small text-muted mb-2">Code: {t.code}</div>}
                    <div className="mt-auto">
                      <Link href={`/dashboard/documents/generate/${t.id}`} className="btn btn-primary btn-sm w-100">
                        <i className="bi bi-file-earmark-plus me-1"></i>Generate
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "generated" && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Reference#</th>
                  <th>Title</th>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ width: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No documents generated yet</td></tr>
                ) : (
                  documents.map((d: any) => (
                    <tr key={d.id}>
                      <td className="fw-semibold">{d.reference_no || d.reference || `#${d.id}`}</td>
                      <td>{d.title || d.name || "-"}</td>
                      <td>{d.employee_name || "-"}</td>
                      <td><span className="badge bg-secondary">{d.type || d.template_name || "-"}</span></td>
                      <td>{d.status === "generated" ? <span className="badge bg-success">Generated</span> : <span className="badge bg-warning">{d.status || "Draft"}</span>}</td>
                      <td>{d.created_at ? new Date(d.created_at).toLocaleDateString() : "-"}</td>
                      <td>
                        <Link href={`/dashboard/documents/print/${d.id}`} target="_blank" className="btn btn-info btn-sm me-1 text-white">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button className="btn btn-success btn-sm me-1" onClick={() => window.open(`/dashboard/documents/print/${d.id}`, "_blank")}>
                          <i className="bi bi-printer"></i>
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteDocument(d.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
