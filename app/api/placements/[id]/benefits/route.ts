import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

async function verifyPlacementCompany(placementId: number, user: any): Promise<boolean> {
  if (user.role === "super_admin") return true;
  const result = await pool.query(
    `SELECT e.company_id FROM placements p JOIN employees e ON p.employee_id = e.id WHERE p.id = $1`,
    [placementId]
  );
  if (result.rows.length === 0) return false;
  return result.rows[0].company_id === user.company_id;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  if (!(await verifyPlacementCompany(Number(id), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await pool.query(`
      SELECT pb.*, pi.name as payroll_item_name, pi.code as payroll_item_code, pi.type as payroll_item_type
      FROM placement_benefits pb
      JOIN payroll_items pi ON pb.payroll_item_id = pi.id
      WHERE pb.placement_id = $1
      ORDER BY pb.id
    `, [id]);

    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  if (!(await verifyPlacementCompany(Number(id), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { payroll_item_id, amount, is_percentage, percentage_value } = await req.json();

    const result = await pool.query(
      `INSERT INTO placement_benefits (placement_id, payroll_item_id, amount, is_percentage, percentage_value)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, payroll_item_id, amount, is_percentage || false, percentage_value]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
