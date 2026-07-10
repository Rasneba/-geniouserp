import pool from "@/lib/db";
import { withAuth, ok, err } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const perm = await requirePermission(user, "view", "dashboard");
    if (!perm.allowed) return err("Permission denied", 403);

    try {
      const today = new Date().toISOString().split("T")[0];
      const isSuper = user.role === "super_admin";
      const cid = user.company_id;

      const empWhere = isSuper ? "WHERE e.is_active = true" : cid ? `WHERE e.is_active = true AND e.company_id = ${cid}` : "WHERE 1=0";
      const empJoin = isSuper ? "" : cid ? `AND e.company_id = ${cid}` : "AND 1=0";
      const deptWhere = isSuper ? "WHERE d.is_active = true" : cid ? `WHERE d.is_active = true AND d.company_id = ${cid}` : "WHERE 1=0";
      const posWhere = isSuper ? "WHERE p.is_active = true" : cid ? `WHERE p.is_active = true AND p.company_id = ${cid}` : "WHERE 1=0";
      const voucherWhere = isSuper ? "WHERE v.status = 'prepared'" : cid ? `WHERE v.company_id = ${cid} AND v.status = 'prepared'` : "WHERE 1=0";
      const userWhere = isSuper ? "" : cid ? `WHERE u.company_id = ${cid}` : "WHERE 1=0";
      const branchWhere = isSuper ? "" : cid ? `WHERE b.company_id = ${cid}` : "WHERE 1=0";

      const [
        totalEmployees,
        presentToday,
        totalPayroll,
        pendingLeave,
        totalDepartments,
        totalPositions,
        pendingOvertime,
        pendingVouchers,
        pendingEvaluations,
        activePlacements,
        recentEmployees,
        totalUsers,
        totalBranches,
        pendingDocuments,
      ] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM employees e ${empWhere}`),
        pool.query(`SELECT COUNT(*) FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE a.date = $1 AND a.status = 'present' ${empJoin}`, [today]),
        pool.query(`SELECT COALESCE(SUM(net_pay), 0) FROM payroll p JOIN employees e ON p.employee_id = e.id WHERE p.status IN ('processed', 'paid') ${empJoin}`),
        pool.query(`SELECT COUNT(*) FROM leave_requests lr JOIN employees e ON lr.employee_id = e.id WHERE lr.status = 'pending' ${empJoin}`),
        pool.query(`SELECT COUNT(*) FROM departments d ${deptWhere}`),
        pool.query(`SELECT COUNT(*) FROM positions p ${posWhere}`),
        pool.query(`SELECT COUNT(*) FROM overtime_records ot JOIN employees e ON ot.employee_id = e.id WHERE ot.status = 'pending' ${empJoin}`),
        pool.query(`SELECT COUNT(*) FROM vouchers v ${voucherWhere}`),
        pool.query(`SELECT COUNT(*) FROM performance_evaluations pe JOIN employees e ON pe.employee_id = e.id WHERE pe.status = 'draft' ${empJoin}`),
        pool.query(`SELECT COUNT(*) FROM placements pl JOIN employees e ON pl.employee_id = e.id WHERE (pl.end_date IS NULL OR pl.end_date >= CURRENT_DATE) ${empJoin}`),
        pool.query(`SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id ${empWhere} ORDER BY e.created_at DESC LIMIT 5`),
        pool.query(`SELECT COUNT(*) FROM users u ${userWhere}`),
        pool.query(`SELECT COUNT(*) FROM branches b ${branchWhere}`),
        pool.query(`SELECT COUNT(*) FROM generated_documents gd JOIN employees e ON gd.employee_id = e.id WHERE gd.status = 'draft' ${empJoin}`),
      ]);

      return ok({
        totalEmployees: parseInt(totalEmployees.rows[0].count),
        presentToday: parseInt(presentToday.rows[0].count),
        totalPayroll: parseFloat(totalPayroll.rows[0].coalesce),
        pendingLeave: parseInt(pendingLeave.rows[0].count),
        totalDepartments: parseInt(totalDepartments.rows[0].count),
        totalPositions: parseInt(totalPositions.rows[0].count),
        pendingOvertime: parseInt(pendingOvertime.rows[0].count),
        pendingVouchers: parseInt(pendingVouchers.rows[0].count),
        pendingEvaluations: parseInt(pendingEvaluations.rows[0].count),
        activePlacements: parseInt(activePlacements.rows[0].count),
        recentEmployees: recentEmployees.rows,
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalBranches: parseInt(totalBranches.rows[0].count),
        pendingDocuments: parseInt(pendingDocuments.rows[0].count),
      });
    } catch (e: any) {
      console.error("Dashboard stats error:", e);
      return err(e.message);
    }
  });
}
