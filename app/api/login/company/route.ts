import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { company_tin, email, password } = await req.json();
    if (!company_tin) {
      return NextResponse.json({ error: "Company TIN is required" }, { status: 400 });
    }

    const companyRes = await pool.query(
      "SELECT id, name, tin, status FROM companies WHERE tin = $1",
      [company_tin]
    );
    if (companyRes.rows.length === 0) {
      return NextResponse.json({ error: "Company not found with this TIN" }, { status: 404 });
    }

    const company = companyRes.rows[0];
    if (company.status !== "active") {
      return NextResponse.json({ error: "Company account is not active" }, { status: 403 });
    }

    const licenseRes = await pool.query(
      "SELECT id, status, expiry_date FROM demo_licenses WHERE company_id = $1 AND status = 'active' AND expiry_date >= CURRENT_DATE ORDER BY expiry_date DESC LIMIT 1",
      [company.id]
    );
    const hasActiveLicense = licenseRes.rows.length > 0;
    if (!hasActiveLicense && company.tin !== 'TIN-000001') {
      return NextResponse.json({ error: "No active license for this company" }, { status: 403 });
    }

    const result = await pool.query(
      `SELECT u.*, r.name as role_name FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1 AND u.company_id = $2 AND r.name IN ('admin', 'super_admin')`,
      [email, company.id]
    );

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: "Admin not found for this company" }, { status: 404 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const roleName = user.role_name || "admin";
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: roleName,
      company_id: company.id,
      company_name: company.name,
      company_tin: company.tin,
    });

    return NextResponse.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
        role_id: user.role_id,
        company_id: company.id,
        company_name: company.name,
        company_tin: company.tin,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
