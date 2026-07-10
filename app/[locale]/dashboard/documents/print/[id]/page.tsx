"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PrintDocumentPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const load = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) { setLoading(false); return; }
      try {
        const [dRes, sRes] = await Promise.all([
          fetch(`/api/documents/${id}`, { headers: { Authorization: `Bearer ${tok}` } }),
          fetch("/api/settings", { headers: { Authorization: `Bearer ${tok}` } }),
        ]);
        const dData = await dRes.json();
        const sData = await sRes.json();
        if (dData && !dData.error) setDoc(dData);
        if (sData && !sData.error) setSettings(sData);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!loading && doc) {
      const timer = setTimeout(() => { window.print(); }, 600);
      return () => clearTimeout(timer);
    }
  }, [loading, doc]);

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  if (!doc) {
    return <div className="text-center py-5 text-muted">Document not found</div>;
  }

  const companyName = settings?.company_name || "Company Name";
  const companyAddress = settings?.company_address || "";
  const companyPhone = settings?.company_phone || "";
  const companyEmail = settings?.company_email || "";

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print, .sidebar, nav, .navbar, .topbar, header { display: none !important; }
          @page { margin: 20mm; }
          .print-doc { margin: 0; padding: 0; }
        }
        @media screen {
          .print-doc { max-width: 800px; margin: 0 auto; padding: 40px; background: #fff; box-shadow: 0 0 20px rgba(0,0,0,0.1); min-height: 297mm; }
        }
        .print-doc { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .letterhead { border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
        .letterhead h2 { color: #1e293b; font-weight: 700; margin: 0 0 4px; }
        .doc-ref { font-size: 13px; color: #6c757d; }
        .doc-body { line-height: 1.8; font-size: 14px; }
        .signature-area { margin-top: 60px; }
        .signature-line { border-top: 1px solid #000; width: 250px; padding-top: 8px; font-size: 13px; }
      `}</style>

      <div className="no-print text-center mb-3">
        <button className="btn btn-primary me-2" onClick={() => window.print()}>
          <i className="bi bi-printer me-1"></i>Print
        </button>
        <button className="btn btn-secondary" onClick={() => window.close()}>
          <i className="bi bi-x me-1"></i>Close
        </button>
      </div>

      <div className="print-doc">
        <div className="letterhead">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2>{companyName}</h2>
              <p className="mb-0 text-muted small">{companyAddress}</p>
              <p className="mb-0 text-muted small">{companyPhone} | {companyEmail}</p>
            </div>
            <div className="text-end">
              <div className="doc-ref"><strong>Ref:</strong> {doc.reference_no || doc.reference || `DOC-${doc.id}`}</div>
              <div className="doc-ref"><strong>Date:</strong> {doc.created_at ? new Date(doc.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {doc.employee_name && (
          <div className="mb-4">
            <p className="mb-1"><strong>To:</strong> {doc.employee_name}</p>
            {doc.employee_position && <p className="mb-1 small">{doc.employee_position}</p>}
            {doc.employee_department && <p className="mb-0 small">{doc.employee_department}</p>}
          </div>
        )}

        <div className="doc-body">
          <h5 className="mb-3">{doc.title || doc.name || "Document"}</h5>
          {doc.content ? (
            <div dangerouslySetInnerHTML={{ __html: doc.content }} />
          ) : doc.body ? (
            <div dangerouslySetInnerHTML={{ __html: doc.body }} />
          ) : (
            <p>{doc.description || "Document content"}</p>
          )}
        </div>

        <div className="signature-area">
          <div className="row mt-5">
            <div className="col-6">
              <div className="signature-line">Authorized Signature</div>
            </div>
            <div className="col-6 text-end">
              <div className="signature-line">Date</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
