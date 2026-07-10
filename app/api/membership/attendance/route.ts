import pool from "@/lib/db";
import { withAuth, ok, err } from "@/lib/api-utils";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    try {
      const { searchParams } = new URL(req.url);
      const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

      const activeRes = await pool.query(
        `SELECT gc.*, mm.full_name as member_name, mm.customer_id as member_code,
                mm.photo_url, mp.name as plan_name
         FROM gym_checkins gc
         JOIN membership_members mm ON gc.member_id = mm.id
         LEFT JOIN membership_plans mp ON mm.plan_id = mp.id
         WHERE gc.status = 'checked_in'
           AND gc.company_id = $1
         ORDER BY gc.check_in_at DESC`,
        [user.company_id]
      );

      const todayRes = await pool.query(
        `SELECT COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'checked_in') as active,
                COUNT(*) FILTER (WHERE status = 'checked_out') as completed
         FROM gym_checkins
         WHERE DATE(check_in_at) = $1
           AND company_id = $2`,
        [date, user.company_id]
      );

      const hourlyRes = await pool.query(
        `SELECT EXTRACT(HOUR FROM check_in_at) as hour, COUNT(*) as count
         FROM gym_checkins
         WHERE DATE(check_in_at) = $1
           AND company_id = $2
         GROUP BY hour ORDER BY hour`,
        [date, user.company_id]
      );

      return ok({
        activeCheckins: activeRes.rows,
        stats: todayRes.rows[0],
        hourly: hourlyRes.rows,
        date,
      });
    } catch (e: any) { return err(e.message); }
  });
}
