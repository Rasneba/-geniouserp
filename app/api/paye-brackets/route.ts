import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "paye_brackets");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const result = await pool.query("SELECT * FROM paye_brackets ORDER BY min_income");
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function PUT(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "paye_brackets");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const brackets = await req.json();
      if (!Array.isArray(brackets)) {
        return badRequest("Expected array of brackets");
      }
      await pool.query("UPDATE paye_brackets SET is_active = false");
      for (const b of brackets) {
        if (b.id) {
          await pool.query(
            "UPDATE paye_brackets SET min_income=$1, max_income=$2, rate=$3, deductible_amount=$4, is_active=true WHERE id=$5",
            [b.min_income, b.max_income, b.rate, b.deductible_amount, b.id]
          );
        } else {
          await pool.query(
            "INSERT INTO paye_brackets (min_income, max_income, rate, deductible_amount, is_active) VALUES ($1,$2,$3,$4,true)",
            [b.min_income, b.max_income, b.rate, b.deductible_amount]
          );
        }
      }
      return ok({ message: "Brackets updated" });
    } catch (e: any) {
      return err(e.message);
    }
  });
}
