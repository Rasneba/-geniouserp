import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    let query = "SELECT dl.*, u.name as issued_by_name FROM demo_licenses dl LEFT JOIN users u ON dl.issued_by = u.id WHERE dl.id = $1";
    const values: any[] = [id];
    if (user.role !== "super_admin" && user.company_id) {
      query += " AND dl.company_id = $2";
      values.push(user.company_id);
    }
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;

  // Company admins can only update their own licenses
  if (user.role !== "super_admin" && user.company_id) {
    const check = await pool.query("SELECT id FROM demo_licenses WHERE id = $1 AND company_id = $2", [id, user.company_id]);
    if (check.rows.length === 0) return NextResponse.json({ error: "Not found in your company" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const allowed = ["company_name","contact_name","contact_email","contact_phone","status","notes"];
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    for (const key of allowed) {
      if (body[key] !== undefined) { sets.push(`${key} = $${idx}`); vals.push(body[key]); idx++; }
    }
    if (sets.length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    sets.push("updated_at = CURRENT_TIMESTAMP");
    vals.push(id);
    const result = await pool.query(
      `UPDATE demo_licenses SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      vals
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;

  // Company admins can only delete their own licenses
  if (user.role !== "super_admin" && user.company_id) {
    const check = await pool.query("SELECT id FROM demo_licenses WHERE id = $1 AND company_id = $2", [id, user.company_id]);
    if (check.rows.length === 0) return NextResponse.json({ error: "Not found in your company" }, { status: 404 });
  }

  try {
    await pool.query("DELETE FROM demo_licenses WHERE id = $1", [id]);
    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
