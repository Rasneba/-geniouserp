"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function GenerateDocumentPage() {
  const { id } = useParams();
  const [template, setTemplate] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const load = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) { setLoading(false); return; }
      try {
        const [tRes, eRes] = await Promise.all([
          fetch(`/api/documents/templates/${id}`, { headers: { Authorization: `Bearer ${tok}` } }),
          fetch("/api/employees", { headers: { Authorization: `Bearer ${tok}` } }),
        ]);
        const tData = await tRes.json();
        const eData = await eRes.json();
        if (tData && !tData.error) setTemplate(tData);
        if (Array.isArray(eData)) setEmployees(eData);

        if (tData?.code === "BANK_LTR" || tData?.code?.includes("VOUCHER")) {
          const vRes = await fetch("/api/vouchers", { headers: { Authorization: `Bearer ${tok}` } });
          const vData = await vRes.json();
          if (Array.isArray(vData)) setVouchers(vData);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [id]);

  const generate = async () => {
    if (!selectedEmployee) { setError("Please select an employee"); return; }
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          template_id: parseInt(id as string),
          employee_id: parseInt(selectedEmployee),
          voucher_id: selectedVoucher ? parseInt(selectedVoucher) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedDoc(data);
      } else {
        setError(data.error || "Failed to generate");
      }
    } catch { setError("Server error"); }
    setGenerating(false);
  };

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  if (!template) {
    return <div className="text-center py-5 text-muted">Template not found</div>;
  }

  if (generatedDoc) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Generated Document</h4>
          <div className="d-flex gap-2">
            <Link href={`/dashboard/documents/print/${generatedDoc.id}`} target="_blank" className="btn btn-success">
              <i className="bi bi-printer me-1"></i>Print
            </Link>
            <Link href="/dashboard/documents" className="btn btn-secondary">
              <i className="bi bi-arrow-left me-1"></i>Back
            </Link>
          </div>
        </div>
        <div className="card border-0 shadow-sm" ref={contentRef}>
          <div className="card-body" dangerouslySetInnerHTML={{ __html: generatedDoc.content || generatedDoc.body || "<p>Document generated successfully.</p>" }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Generate: {template.name}</h4>
        <Link href="/dashboard/documents" className="btn btn-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i>Back
        </Link>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {template.code && <div className="mb-3"><span className="badge bg-secondary">Code: {template.code}</span></div>}
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Select Employee *</label>
              <select className="form-control" value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
                <option value="">Choose employee...</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.code})</option>
                ))}
              </select>
            </div>

            {(template.code === "BANK_LTR" || template.code?.includes("VOUCHER")) && (
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Select Voucher</label>
                <select className="form-control" value={selectedVoucher} onChange={e => setSelectedVoucher(e.target.value)}>
                  <option value="">Choose voucher...</option>
                  {vouchers.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.reference_no || v.reference || `#${v.id}`} - {v.type || ""}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-12">
              <button className="btn btn-primary px-4" onClick={generate} disabled={generating}>
                <i className="bi bi-file-earmark-plus me-1"></i>{generating ? "Generating..." : "Generate Document"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
