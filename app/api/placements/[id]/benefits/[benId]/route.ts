import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

async function verifyBenefitCompany(benId: number, user: any): Promise<boolean> {
  if (user.role === "super_admin") return true;
  const result = await pool.query(
    `SELECT e.company_id FROM placement_benefits pb
     JOIN placements p ON pb.placement_id = p.id
     JOIN employees e ON p.employee_id = e.id
     WHERE pb.id = $1`,
    [benId]
  );
  if (result.rows.length === 0) return false;
  return result.rows[0].company_id === user.company_id;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; benId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { benId } = await params;

  if (!(await verifyBenefitCompany(Number(benId), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { payroll_item_id, amount, is_percentage, percentage_value } = await req.json();

    const result = await pool.query(
      `UPDATE placement_benefits SET payroll_item_id = $1, amount = $2,
        is_percentage = $3, percentage_value = $4
       WHERE id = $5 RETURNING *`,
      [payroll_item_id, amount, is_percentage, percentage_value, benId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Benefit not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; benId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { benId } = await params;

  if (!(await verifyBenefitCompany(Number(benId), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await pool.query("DELETE FROM placement_benefits WHERE id = $1", [benId]);
    return NextResponse.json({ message: "Benefit deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
