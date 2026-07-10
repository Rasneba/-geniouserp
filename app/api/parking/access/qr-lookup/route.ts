import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, err, badRequest } from "@/lib/api-utils";
import { logAccess, daysBetween } from "@/lib/rfid";

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    try {
      const body = await req.json();
      const { subscription_id, company_id, member_id } = body;
      if (!subscription_id) return badRequest("subscription_id is required");

      const cid = company_id || user.company_id;

      const subRes = await pool.query(
        `SELECT ps.*,
          mm.full_name as member_name, mm.phone as member_phone, mm.customer_id as member_code,
          mp.name as plan_name, mp.duration_days as plan_duration_days
         FROM parking_subscriptions ps
         JOIN membership_members mm ON ps.customer_id = mm.id
         LEFT JOIN membership_plans mp ON ps.plan_id = mp.id
         WHERE ps.id = $1 AND ps.company_id = $2`,
        [subscription_id, cid]
      );

      if (subRes.rows.length === 0) {
        return ok({
          granted: false,
          reason: "SUBSCRIPTION_NOT_FOUND",
          message: "QR subscription not found",
        });
      }

      const sub = subRes.rows[0];
      const today = new Date().toISOString().split("T")[0];

      if (sub.status === "cancelled") {
        await logAccess({
          company_id: cid,
          card_uid: `QR-${subscription_id}`,
          member_id: sub.customer_id,
          member_name: sub.member_name,
          granted: false,
          reason: "SUBSCRIPTION_CANCELLED",
          message: "Subscription is cancelled",
          days_remaining: 0,
          door_opened: false,
          plan_name: sub.plan_name,
          subscription_id: sub.id,
        });
        return ok({
          granted: false,
          reason: "SUBSCRIPTION_CANCELLED",
          message: "Subscription is cancelled",
          member: { id: sub.customer_id, name: sub.member_name },
          subscription: { id: sub.id, status: sub.status, plan_name: sub.plan_name },
        });
      }

      if (sub.status === "expired" || sub.end_date < today) {
        await logAccess({
          company_id: cid,
          card_uid: `QR-${subscription_id}`,
          member_id: sub.customer_id,
          member_name: sub.member_name,
          granted: false,
          reason: "SUBSCRIPTION_EXPIRED",
          message: "Subscription has expired",
          days_remaining: 0,
          door_opened: false,
          plan_name: sub.plan_name,
          subscription_id: sub.id,
        });
        return ok({
          granted: false,
          reason: "SUBSCRIPTION_EXPIRED",
          message: "Subscription has expired",
          member: { id: sub.customer_id, name: sub.member_name },
          subscription: { id: sub.id, status: sub.status, end_date: sub.end_date, plan_name: sub.plan_name },
        });
      }

      if (sub.status === "frozen") {
        await logAccess({
          company_id: cid,
          card_uid: `QR-${subscription_id}`,
          member_id: sub.customer_id,
          member_name: sub.member_name,
          granted: false,
          reason: "SUBSCRIPTION_FROZEN",
          message: "Subscription is frozen",
          days_remaining: 0,
          door_opened: false,
          plan_name: sub.plan_name,
          subscription_id: sub.id,
        });
        return ok({
          granted: false,
          reason: "SUBSCRIPTION_FROZEN",
          message: "Subscription is frozen",
          member: { id: sub.customer_id, name: sub.member_name },
          subscription: { id: sub.id, status: sub.status, plan_name: sub.plan_name },
        });
      }

      if (sub.start_date > today) {
        await logAccess({
          company_id: cid,
          card_uid: `QR-${subscription_id}`,
          member_id: sub.customer_id,
          member_name: sub.member_name,
          granted: false,
          reason: "SUBSCRIPTION_NOT_STARTED",
          message: "Subscription not yet active",
          days_remaining: 0,
          door_opened: false,
          plan_name: sub.plan_name,
          subscription_id: sub.id,
        });
        return ok({
          granted: false,
          reason: "SUBSCRIPTION_NOT_STARTED",
          message: "Subscription not yet active",
          member: { id: sub.customer_id, name: sub.member_name },
          subscription: { id: sub.id, status: sub.status, start_date: sub.start_date, plan_name: sub.plan_name },
        });
      }

      const daysRemaining = daysBetween(sub.end_date);

      await logAccess({
        company_id: cid,
        card_uid: `QR-${subscription_id}`,
        member_id: sub.customer_id,
        member_name: sub.member_name,
        granted: true,
        reason: "ACCESS_GRANTED",
        message: "QR access granted",
        days_remaining: daysRemaining,
        door_opened: true,
        plan_name: sub.plan_name,
        subscription_id: sub.id,
      });

      return ok({
        granted: true,
        reason: "ACCESS_GRANTED",
        message: "Access granted",
        member: { id: sub.customer_id, name: sub.member_name, phone: sub.member_phone, code: sub.member_code },
        subscription: { id: sub.id, status: sub.status, end_date: sub.end_date, plan_name: sub.plan_name },
        days_remaining: daysRemaining,
      });
    } catch (e: any) {
      return err(e.message);
    }
  });
}
