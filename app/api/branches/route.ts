import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "branches");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const admin = isAdmin(user);
    try {
      let query = `SELECT * FROM branches`;
      const params: any[] = [];
      if (!admin) {
        query += ` WHERE company_id = $1`;
        params.push(user.company_id);
      }
      query += ` ORDER BY name`;
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "branches");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const { name, code, address, phone, email, is_head_office } = await req.json();
      const result = await pool.query(
        `INSERT INTO branches (name, code, address, phone, email, is_head_office, company_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, code, address, phone, email, is_head_office || false, user.company_id]
      );
      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}
