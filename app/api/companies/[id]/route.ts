import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    const result = await pool.query(
      `SELECT c.*,
        (SELECT json_agg(json_build_object('id', m.id, 'code', m.code, 'name', m.name, 'enabled', cm.is_enabled))
         FROM company_modules cm JOIN modules m ON cm.module_id = m.id WHERE cm.company_id = c.id) as modules
       FROM companies c WHERE c.id = $1`,
      [id]
    );
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
  try {
    const body = await req.json();
    const allowed = ["name","code","address","phone","email","website","contact_person","contact_phone","contact_email","tin","license_type","status","notes"];
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    for (const key of allowed) {
      if (body[key] !== undefined) { sets.push(`${key} = $${idx}`); vals.push(body[key]); idx++; }
    }
    if (sets.length === 0) return NextResponse.json({ error: "No fields" }, { status: 400 });
    sets.push("updated_at = CURRENT_TIMESTAMP");
    vals.push(id);

    const result = await pool.query(
      `UPDATE companies SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      vals
    );

    if (body.modules && Array.isArray(body.modules)) {
      await pool.query("DELETE FROM company_modules WHERE company_id = $1", [id]);
      for (const mid of body.modules) {
        await pool.query(
          "INSERT INTO company_modules (company_id, module_id, is_enabled) VALUES ($1, $2, true) ON CONFLICT DO NOTHING",
          [id, mid]
        );
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    await pool.query("DELETE FROM companies WHERE id = $1", [id]);
    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
