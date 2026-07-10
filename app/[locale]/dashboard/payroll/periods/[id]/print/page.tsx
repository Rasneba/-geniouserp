"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PrintPayslipPage() {
  const { id } = useParams();
  const [period, setPeriod] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) { setLoading(false); return; }
      try {
        const perRes = await fetch(`/api/payroll/periods/${id}`, { headers: { Authorization: `Bearer ${tok}` } });
        const perData = await perRes.json();
        if (perData && !perData.error) {
          setPeriod(perData);
          if (perData.run_id) {
            const itRes = await fetch(`/api/payroll/items?run_id=${perData.run_id}`, { headers: { Authorization: `Bearer ${tok}` } });
            const itData = await itRes.json();
            if (Array.isArray(itData)) setItems(itData);
          }
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  const fmt = (v: any) => parseFloat(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDate = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };
  const monthName = (m: number) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1] || m;

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!period || items.length === 0) {
    return <div className="alert alert-warning">No payroll data found for this period.</div>;
  }

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .payslip-card {
            page-break-after: always;
            page-break-inside: avoid;
            border: 1px solid #000 !important;
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .payslip-card:last-child { page-break-after: auto; }
          @page { margin: 15mm; size: A4; }
          .payslip-container { padding: 0 !important; }
        }
        @media screen {
          .payslip-container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .payslip-card {
            background: #fff;
            border: 1px solid #dee2e6;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 30px;
            padding: 30px;
          }
        }
        .payslip-card { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .slip-header { border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px; text-align: center; }
        .slip-header h5 { margin: 0; font-weight: 700; color: #1e293b; }
        .slip-header .subtitle { font-size: 12px; color: #6c757d; }
        .slip-section-title {
          font-size: 13px; font-weight: 700; text-transform: uppercase;
          background: #f1f5f9; padding: 4px 10px; margin-bottom: 6px; margin-top: 14px;
          border-left: 3px solid #1e293b; letter-spacing: 0.5px;
        }
        .slip-row { display: flex; justify-content: space-between; padding: 3px 10px; font-size: 13px; }
        .slip-row .label { color: #495057; }
        .slip-row .value { font-weight: 600; }
        .slip-row.total-row { border-top: 2px solid #1e293b; margin-top: 6px; padding-top: 6px; }
        .slip-row.total-row .label { font-weight: 700; font-size: 14px; }
        .slip-row.total-row .value { font-weight: 700; font-size: 14px; color: #198754; }
        .net-pay-box {
          margin-top: 12px; padding: 10px; text-align: center;
          border: 2px solid #198754; border-radius: 4px; background: #f0fdf4;
        }
        .net-pay-box .amount { font-size: 20px; font-weight: 700; color: #198754; }
        .net-pay-box .lbl { font-size: 12px; text-transform: uppercase; color: #6c757d; letter-spacing: 1px; }
      `}</style>

      <div className="no-print text-center mb-3">
        <button className="btn btn-primary me-2" onClick={() => window.print()}>
          <i className="bi bi-printer me-1"></i>Print Payslips
        </button>
        <button className="btn btn-secondary" onClick={() => window.history.back()}>
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
      </div>

      <div className="payslip-container">
        {items.map((item: any, idx: number) => (
          <div className="payslip-card" key={item.id || idx}>
            <div className="slip-header">
              <h5>Genius ERP ICT Solutions PLC</h5>
              <div className="subtitle">Payslip &mdash; {monthName(period.month)} {period.year}</div>
            </div>

            <div className="row mb-2" style={{ fontSize: "13px" }}>
              <div className="col-6">
                <div><strong>Employee:</strong> {item.first_name} {item.middle_name || ""} {item.last_name}</div>
                <div><strong>Code:</strong> {item.employee_code || "-"}</div>
                <div><strong>Department:</strong> {item.department_name || "-"}</div>
              </div>
              <div className="col-6 text-end">
                <div><strong>Position:</strong> {item.position_name || "-"}</div>
                <div><strong>Period:</strong> {formatDate(period.start_date)} to {formatDate(period.end_date)}</div>
              </div>
            </div>

            <div className="slip-section-title">Earnings</div>
            <div className="slip-row">
              <span className="label">Basic Salary</span>
              <span className="value">{fmt(item.basic_salary)}</span>
            </div>
            <div className="slip-row">
              <span className="label">Allowances</span>
              <span className="value">{fmt(item.allowances)}</span>
            </div>
            {parseFloat(item.overtime || 0) > 0 && (
              <div className="slip-row">
                <span className="label">Overtime</span>
                <span className="value">{fmt(item.overtime)}</span>
              </div>
            )}
            <div className="slip-row total-row">
              <span className="label">Gross Pay</span>
              <span className="value">{fmt(item.gross_pay)}</span>
            </div>

            <div className="slip-section-title">Deductions</div>
            <div className="slip-row">
              <span className="label">PAYE Tax</span>
              <span className="value text-danger">{fmt(item.paye_tax)}</span>
            </div>
            <div className="slip-row">
              <span className="label">Employee Pension</span>
              <span className="value text-danger">{fmt(item.employee_pension)}</span>
            </div>
            <div className="slip-row total-row">
              <span className="label">Total Deductions</span>
              <span className="value text-danger">{fmt(parseFloat(item.paye_tax || 0) + parseFloat(item.employee_pension || 0))}</span>
            </div>

            <div className="net-pay-box">
              <div className="lbl">Net Pay</div>
              <div className="amount">{fmt(item.net_pay)}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
