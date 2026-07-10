"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PayrollPeriodDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [period, setPeriod] = useState<any>(null);
  const [run, setRun] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) return;
      try {
        const [perRes, itRes] = await Promise.all([
          fetch(`/api/payroll/periods/${id}`, { headers: { Authorization: `Bearer ${tok}` } }),
          fetch(`/api/payroll/items/${id}`, { headers: { Authorization: `Bearer ${tok}` } }),
        ]);
        const per = await perRes.json();
        const its = await itRes.json();
        setPeriod(per);
        if (Array.isArray(its)) {
          setItems(its);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  const monthName = (m: number) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1] || m;

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!period) return <div className="alert alert-danger">Period not found</div>;

  const totalBasic = items.reduce((s, i) => s + parseFloat(i.basic_salary || 0), 0);
  const totalGross = items.reduce((s, i) => s + parseFloat(i.gross_pay || 0), 0);
  const totalPAYE = items.reduce((s, i) => s + parseFloat(i.paye_tax || 0), 0);
  const totalEmpPension = items.reduce((s, i) => s + parseFloat(i.employee_pension || 0), 0);
  const totalEmprPension = items.reduce((s, i) => s + parseFloat(i.employer_pension || 0), 0);
  const totalNet = items.reduce((s, i) => s + parseFloat(i.net_pay || 0), 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">
            <i className="bi bi-wallet2 me-2"></i>
            {monthName(period.month)} {period.year} Payroll
          </h4>
          <div className="text-muted small">{period.start_date?.split("T")[0]} to {period.end_date?.split("T")[0]}</div>
        </div>
        <div className="d-flex gap-2">
          {items.length > 0 && (
            <a href={`/dashboard/payroll/periods/${id}/print`} target="_blank" className="btn btn-outline-primary">
              <i className="bi bi-printer me-1"></i>Print Payslips
            </a>
          )}
          <button className="btn btn-secondary" onClick={() => router.back()}>
            <i className="bi bi-arrow-left me-1"></i>Back
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="text-muted small">Employees</div>
            <div className="fs-4 fw-bold">{items.length}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="text-muted small">Total Gross</div>
            <div className="fs-4 fw-bold">{totalGross.toLocaleString()}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="text-muted small">Total PAYE Tax</div>
            <div className="fs-4 fw-bold text-danger">{totalPAYE.toLocaleString()}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="text-muted small">Total Net Pay</div>
            <div className="fs-4 fw-bold text-success">{totalNet.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header fw-semibold">Employee Payroll Details</div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Employee</th>
                <th>Code</th>
                <th>Department</th>
                <th>Basic</th>
                <th>Allowances</th>
                <th>Gross</th>
                <th>Taxable</th>
                <th>PAYE</th>
                <th>Emp Pension</th>
                <th>Empr Pension</th>
                <th>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i: any) => (
                <tr key={i.id}>
                  <td className="fw-medium">{i.first_name} {i.middle_name || ""} {i.last_name}</td>
                  <td>{i.employee_code}</td>
                  <td>{i.department_name || "-"}</td>
                  <td>{parseFloat(i.basic_salary).toLocaleString()}</td>
                  <td>{parseFloat(i.allowances || 0).toLocaleString()}</td>
                  <td>{parseFloat(i.gross_pay).toLocaleString()}</td>
                  <td>{parseFloat(i.taxable_income).toLocaleString()}</td>
                  <td className="text-danger">{parseFloat(i.paye_tax).toLocaleString()}</td>
                  <td>{parseFloat(i.employee_pension).toLocaleString()}</td>
                  <td className="text-muted">{parseFloat(i.employer_pension).toLocaleString()}</td>
                  <td className="fw-bold text-success">{parseFloat(i.net_pay).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light fw-semibold">
              <tr>
                <td colSpan={3} className="text-end">Totals:</td>
                <td>{totalBasic.toLocaleString()}</td>
                <td>-</td>
                <td>{totalGross.toLocaleString()}</td>
                <td>-</td>
                <td className="text-danger">{totalPAYE.toLocaleString()}</td>
                <td>{totalEmpPension.toLocaleString()}</td>
                <td className="text-muted">{totalEmprPension.toLocaleString()}</td>
                <td className="text-success">{totalNet.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {period.notes && (
        <div className="card border-0 shadow-sm mt-3">
          <div className="card-body">
            <div className="text-muted small fw-semibold">Notes</div>
            <div>{period.notes}</div>
          </div>
        </div>
      )}
    </div>
  );
}
