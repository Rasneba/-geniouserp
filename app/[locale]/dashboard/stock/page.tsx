"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StockStats {
  totalItems: number;
  totalCategories: number;
  totalWarehouses: number;
  lowStockItems: any[];
  recentMovements: any[];
}

export default function StockDashboard() {
  const [stats, setStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    fetch("/api/stock/dashboard", { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.json())
      .then(d => { if (d && d.totalItems !== undefined) setStats(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  const cards = [
    { label: "Total Items", value: stats?.totalItems || 0, icon: "bi-box", color: "text-primary", href: "/dashboard/stock/inventory" },
    { label: "Categories", value: stats?.totalCategories || 0, icon: "bi-tags", color: "text-success", href: "/dashboard/stock/inventory" },
    { label: "Warehouses", value: stats?.totalWarehouses || 0, icon: "bi-building", color: "text-info", href: "/dashboard/stock/warehouses" },
    { label: "Low Stock Items", value: stats?.lowStockItems?.length || 0, icon: "bi-exclamation-triangle", color: stats?.lowStockItems?.length ? "text-danger" : "text-success", href: "/dashboard/stock/inventory" },
  ];

  return (
    <div className="page-enter">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1"><i className="bi bi-box-seam me-2"></i>Stock Dashboard</h4>
          <p className="text-muted small mb-0">Inventory management and stock control</p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/dashboard/stock/inventory" className="btn btn-outline-primary btn-sm"><i className="bi bi-archive me-1"></i>Inventory</Link>
          <Link href="/dashboard/stock/warehouses" className="btn btn-outline-primary btn-sm"><i className="bi bi-building me-1"></i>Warehouses</Link>
          <Link href="/dashboard/stock/movements" className="btn btn-outline-primary btn-sm"><i className="bi bi-arrow-left-right me-1"></i>Movements</Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {cards.map(c => (
          <div className="col-md-3" key={c.label}>
            <Link href={c.href} className="text-decoration-none">
              <div className="card interactive-card border-0 shadow-sm p-3 rounded-3 h-100">
                <div className="d-flex align-items-center gap-3">
                  <i className={`bi ${c.icon} fs-2 ${c.color}`}></i>
                  <div>
                    <div className="text-muted small text-uppercase fw-bold">{c.label}</div>
                    <div className={`fs-4 fw-bold counter-value ${c.color}`}>{c.value}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
              <span><i className="bi bi-exclamation-triangle me-2"></i>Low Stock Alerts</span>
              <Link href="/dashboard/stock/adjustments" className="btn btn-sm btn-outline-warning">Adjust</Link>
            </div>
            <div className="card-body p-0">
              {(!stats?.lowStockItems || stats.lowStockItems.length === 0) ? (
                <div className="text-center text-muted py-4"><i className="bi bi-check-circle fs-2 text-success d-block mb-2"></i>All items are sufficiently stocked</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr><th>Item</th><th>Code</th><th>Stock</th><th>Min Level</th></tr>
                    </thead>
                    <tbody>
                      {stats.lowStockItems.map((item: any) => (
                        <tr key={item.id} className="table-warning">
                          <td className="fw-semibold">{item.name}</td>
                          <td><code className="small">{item.code}</code></td>
                          <td className="text-danger fw-bold">{item.total_stock}</td>
                          <td>{item.reorder_level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header fw-semibold"><i className="bi bi-clock-history me-2"></i>Recent Movements</div>
            <div className="card-body p-0">
              {(!stats?.recentMovements || stats.recentMovements.length === 0) ? (
                <div className="text-center text-muted py-4"><i className="bi bi-inbox fs-2 d-block mb-2"></i>No movements yet</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr><th>Item</th><th>Type</th><th>Qty</th><th>Warehouse</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {stats.recentMovements.map((m: any) => (
                        <tr key={m.id}>
                          <td className="small">{m.item_name}</td>
                          <td>
                            <span className={`badge ${m.movement_type === 'in' || m.movement_type === 'transfer_in' ? 'bg-success' : m.movement_type === 'adjustment' ? 'bg-warning' : 'bg-danger'}`}>
                              {m.movement_type}
                            </span>
                          </td>
                          <td className="fw-bold">{m.quantity}</td>
                          <td className="small text-muted">{m.warehouse_name}</td>
                          <td className="small text-muted">{new Date(m.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
