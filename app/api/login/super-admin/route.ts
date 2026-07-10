import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT u.*, r.name as role_name FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1 AND r.name = 'super_admin'`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Super admin not found" }, { status: 404 });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: "super_admin",
      company_id: user.company_id,
    });

    return NextResponse.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "super_admin",
        role_id: user.role_id,
        company_id: user.company_id,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
