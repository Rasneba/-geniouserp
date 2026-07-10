"use client";

import { useEffect, useRef, useState } from "react";

export default function EmploymentLetterPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [letterData, setLetterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    fetch("/api/employees", {
      headers: { Authorization: `Bearer ${tok}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEmployees(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = employees.filter(
    (e) =>
      `${e.first_name ?? ""} ${e.middle_name ?? ""} ${e.last_name ?? ""} ${e.code ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const fullName = (e: any) =>
    [e.first_name, e.middle_name, e.last_name].filter(Boolean).join(" ");

  const generate = async () => {
    if (!selected) return;
    const tok = localStorage.getItem("token");
    if (!tok) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${selected.id}/bank-letter`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      setLetterData(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .letter-preview { box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 20mm; }
        }
        .letter-preview {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: #fff;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.8;
          font-size: 14px;
        }
        .letter-header {
          border-bottom: 2px solid #1e293b;
          padding-bottom: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .letter-header h2 {
          color: #1e293b;
          font-weight: 700;
          margin: 0 0 4px;
          font-size: 22px;
        }
        .letter-header p {
          margin: 0;
          color: #6c757d;
          font-size: 13px;
        }
        .letter-body p { margin-bottom: 16px; }
        .letter-body strong { color: #1e293b; }
        .signature-area { margin-top: 60px; }
        .signature-line { border-top: 1px solid #000; width: 250px; padding-top: 8px; font-size: 13px; }
      `}</style>

      <div className="no-print d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Employment / Bank Letter</h4>
      </div>

      <div className="no-print card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-6" ref={wrapperRef}>
              <label className="form-label small fw-semibold">Search Employee</label>
              <input
                type="text"
                className="form-control"
                placeholder="Type name or code..."
                value={search}
                onFocus={() => setOpen(true)}
                onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
              />
              {open && filtered.length > 0 && (
                <ul className="list-group position-absolute mt-1 shadow-sm" style={{ zIndex: 1000, maxHeight: 250, overflowY: "auto", width: "calc(100% - 24px)" }}>
                  {filtered.map((emp) => (
                    <li
                      key={emp.id}
                      className={`list-group-item list-group-item-action ${selected?.id === emp.id ? "active" : ""}`}
                      style={{ cursor: "pointer", fontSize: "0.85rem" }}
                      onClick={() => { setSelected(emp); setSearch(fullName(emp)); setOpen(false); }}
                    >
                      {fullName(emp)} <span className="text-muted">({emp.code})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button className="btn btn-primary" onClick={generate} disabled={!selected || loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Loading...</>
                ) : (
                  <><i className="bi bi-file-earmark-text me-1"></i>Generate Letter</>
                )}
              </button>
              {letterData && (
                <button className="btn btn-outline-secondary" onClick={() => window.print()}>
                  <i className="bi bi-printer me-1"></i>Print
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {letterData && (
        <div className="letter-preview">
          <div className="letter-header">
            <h2>Genius ERP ICT Solutions PLC</h2>
            <p>Bole Sub-city, Woreda 03, Addis Ababa, Ethiopia</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <div className="letter-body">
            <p className="text-center fw-bold mb-4" style={{ fontSize: "16px" }}>TO WHOM IT MAY CONCERN</p>

            <p className="fw-semibold">Re: Employment Confirmation Letter</p>

            <p>
              This is to confirm that <strong>{fullName(letterData)}</strong> (Code: {letterData.code})
              {" "}is currently employed at Genius ERP ICT Solutions PLC as <strong>{letterData.position_title}</strong>
              {" "}in the <strong>{letterData.department_name}</strong> department since{" "}
              <strong>{new Date(letterData.hire_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong>.
            </p>

            <p>
              Their current monthly salary is <strong>ETB {Number(letterData.salary).toLocaleString()}</strong>.
            </p>

            {letterData.tin && (
              <p>TIN: <strong>{letterData.tin}</strong></p>
            )}

            <p>
              This letter is issued upon request of the employee for whatever legal purpose it may serve.
            </p>
          </div>

          <div className="signature-area">
            <div className="signature-line">Genius ERP ICT Solutions PLC</div>
          </div>
        </div>
      )}
    </div>
  );
}
