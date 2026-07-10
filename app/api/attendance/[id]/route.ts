import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  if (user.role !== "super_admin" && user.company_id) {
    const check = await pool.query(
      `SELECT a.id FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE a.id = $1 AND e.company_id = $2`,
      [id, user.company_id]
    );
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
    }
  }

  try {
    const { time_in, time_out, status, remarks } = await req.json();

    const result = await pool.query(
      `UPDATE attendance SET time_in = $1, time_out = $2, status = $3, remarks = $4
       WHERE id = $5 RETURNING *`,
      [time_in, time_out, status, remarks, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
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

  if (user.role !== "super_admin" && user.company_id) {
    const check = await pool.query(
      `SELECT a.id FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE a.id = $1 AND e.company_id = $2`,
      [id, user.company_id]
    );
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
    }
  }

  try {
    await pool.query("DELETE FROM attendance WHERE id = $1", [id]);
    return NextResponse.json({ message: "Attendance record deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
