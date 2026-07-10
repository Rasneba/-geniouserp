"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ClearanceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [clearance, setClearance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/clearance/${id}`, { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json();
      if (data && !data.error) setClearance(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const updateItem = async (itemId: number, status: string, remarks: string) => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    await fetch(`/api/clearance/${id}/items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
      body: JSON.stringify({ item_id: itemId, status, remarks }),
    });
    load();
  };

  const approveClearance = async (status: string) => {
    if (!confirm(`Mark clearance as ${status}?`)) return;
    const tok = localStorage.getItem("token");
    if (!tok) return;
    const res = await fetch(`/api/clearance/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
    else { const err = await res.json(); alert(err.error || "Failed"); }
  };

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  if (!clearance) return <div className="alert alert-danger">Clearance not found</div>;

  const items = clearance.items || [];
  const completedItems = items.filter((i: any) => i.status === "completed" || i.status === "waived").length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          {clearance.photo ? (
            <img src={clearance.photo} alt="" loading="lazy" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            <div style={{ width: 50, height: 50, borderRadius: "50%", backgroundColor: "var(--table-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-person fs-4 text-muted"></i>
            </div>
          )}
          <div>
            <h4 className="fw-bold mb-0">{clearance.first_name} {clearance.middle_name || ""} {clearance.last_name}</h4>
            <div className="text-muted small">{clearance.employee_code} · {clearance.department_name || "-"} · {clearance.position_title || "-"}</div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="text-muted small">Status</div>
            <div className="fs-5 fw-bold text-capitalize">{clearance.status.replace("_", " ")}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="text-muted small">Type</div>
            <div className="fs-5 fw-bold text-capitalize">{clearance.termination_type || "N/A"}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="text-muted small">Termination Date</div>
            <div className="fs-5 fw-bold">{clearance.termination_date?.split("T")[0] || "-"}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="text-muted small">Checklist Progress</div>
            <div className="fs-5 fw-bold">{completedItems}/{items.length}</div>
          </div>
        </div>
      </div>

      {clearance.reason && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="text-muted small fw-semibold">Termination Reason</div>
            <div>{clearance.reason}</div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
          <span><i className="bi bi-check2-square me-2"></i>Clearance Checklist</span>
          {clearance.status !== "cleared" && clearance.status !== "rejected" && (
            <div className="d-flex gap-2">
              {completedItems === items.length && items.length > 0 && (
                <button className="btn btn-success btn-sm" onClick={() => approveClearance("cleared")}>
                  <i className="bi bi-check-all me-1"></i>Approve Clearance
                </button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => approveClearance("rejected")}>
                <i className="bi bi-x-circle me-1"></i>Reject
              </button>
            </div>
          )}
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th style={{width: "40%"}}>Item</th>
                <th>Department</th>
                <th>Status</th>
                <th>Completed By</th>
                <th>Remarks</th>
                <th style={{width: "200px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-medium">{item.item_name}</div>
                    {item.description && <div className="text-muted small">{item.description}</div>}
                  </td>
                  <td>{item.department_responsible || "-"}</td>
                  <td>
                    {item.status === "completed" ? <span className="badge bg-success">Completed</span>
                    : item.status === "waived" ? <span className="badge bg-secondary">Waived</span>
                    : <span className="badge bg-warning">Pending</span>}
                  </td>
                  <td>{item.completed_by_name || "-"}</td>
                  <td><em className="text-muted small">{item.remarks || "-"}</em></td>
                  <td>
                    {clearance.status !== "cleared" && clearance.status !== "rejected" && (
                      <div className="d-flex gap-1">
                        <button className="btn btn-outline-success btn-sm" onClick={() => updateItem(item.item_id, "completed", "")}>
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => updateItem(item.item_id, "waived", "")}>
                          <i className="bi bi-forward"></i>
                        </button>
                        <button className="btn btn-outline-warning btn-sm" onClick={() => {
                          const r = prompt("Remarks:");
                          if (r !== null) updateItem(item.item_id, item.status, r);
                        }}>
                          <i className="bi bi-chat"></i>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {clearance.notes && (
        <div className="card border-0 shadow-sm mt-3">
          <div className="card-body">
            <div className="text-muted small fw-semibold">Notes</div>
            <div>{clearance.notes}</div>
          </div>
        </div>
      )}
    </div>
  );
}
