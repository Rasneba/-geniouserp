"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export default function CompanyAdminLogin() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [companies, setCompanies] = useState<any[]>([]);
  const [company_tin, setCompanyTin] = useState("TIN-000001");
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingUser, setExistingUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setExistingUser(JSON.parse(stored));
    fetch("/api/companies/public")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCompanies(d); })
      .catch(() => {});
  }, [router]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_tin, email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setLoading(false);
      setError("Server error");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}>
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button onClick={toggle} className="theme-toggle" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'} fs-4 text-white`}></i>
        </button>
      </div>
      <div className="card border-0 shadow-lg p-4" style={{ width: "400px", borderRadius: "12px" }}>
        <div className="text-center mb-4">
          <div className="bg-success text-white d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: "60px", height: "60px" }}>
            <i className="bi bi-building fs-3"></i>
          </div>
          <h3 className="fw-bold">Company Admin</h3>
          <p className="text-muted small">Sign in with your company account</p>
        </div>

        {existingUser && (
          <div className="alert alert-warning py-2 small d-flex justify-content-between align-items-center">
            <span><i className="bi bi-info-circle me-1"></i>Logged in as <strong>{existingUser.name || existingUser.email}</strong></span>
            <button className="btn btn-sm btn-outline-warning" onClick={() => { localStorage.clear(); setExistingUser(null); }}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        )}

        <form onSubmit={login}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Company</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-building"></i></span>
              <select className="form-control" value={company_tin} onChange={e => setCompanyTin(e.target.value)} required>
                {companies.map(c => (
                  <option key={c.id} value={c.tin}>{c.tin} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input className="form-control" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <button type="submit" className="btn btn-success w-100 py-2 fw-semibold" disabled={loading}>
            {loading ? (
              <span><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing in...</span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-3">
          <Link href="/login" className="text-decoration-none small">
            <i className="bi bi-arrow-left me-1"></i>Back to login selection
          </Link>
        </div>
      </div>
    </div>
  );
}
