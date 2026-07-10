import pool from "@/lib/db";
import { withAuth, ok, err } from "@/lib/api-utils";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    try {
      const { searchParams } = new URL(req.url);
      const memberId = searchParams.get("member_id");
      const dateFrom = searchParams.get("from");
      const dateTo = searchParams.get("to");
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "100");
      const offset = parseInt(searchParams.get("offset") || "0");

      let query = `SELECT gc.*, mm.full_name as member_name, mm.customer_id as member_code, mm.photo_url
                   FROM gym_checkins gc
                   JOIN membership_members mm ON gc.member_id = mm.id
                   WHERE gc.company_id = $1`;
      const params: any[] = [user.company_id];
      let idx = 2;

      if (memberId) { query += ` AND gc.member_id = $${idx}`; params.push(memberId); idx++; }
      if (dateFrom) { query += ` AND gc.check_in_at >= $${idx}`; params.push(dateFrom); idx++; }
      if (dateTo) { query += ` AND gc.check_in_at <= $${idx}`; params.push(dateTo + "T23:59:59"); idx++; }
      if (status) { query += ` AND gc.status = $${idx}`; params.push(status); idx++; }

      query += " ORDER BY gc.check_in_at DESC LIMIT $" + idx + " OFFSET $" + (idx + 1);
      params.push(limit, offset);

      const result = await pool.query(query, params);

      const countRes = await pool.query(
        `SELECT COUNT(*) FROM gym_checkins gc WHERE gc.company_id = $1`,
        [user.company_id]
      );

      return ok({
        data: result.rows,
        total: parseInt(countRes.rows[0].count),
        limit,
        offset,
      });
    } catch (e: any) { return err(e.message); }
  });
}
