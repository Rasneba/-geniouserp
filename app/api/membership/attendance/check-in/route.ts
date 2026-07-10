import pool from "@/lib/db";
import { withAuth, ok, err, badRequest } from "@/lib/api-utils";
import { lookupCard, logAccess, updateCardLastUsed } from "@/lib/rfid";

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    try {
      const body = await req.json();
      const { card_uid, member_id, source } = body;

      let targetMemberId = member_id;
      let cardUid = card_uid;
      let cardLabel = null;

      if (card_uid) {
        const result = await lookupCard(card_uid, user);
        if (!result.found) {
          await logAccess({
            company_id: user.company_id,
            card_uid,
            member_id: null, member_name: null,
            granted: false, reason: result.error || "CARD_NOT_FOUND",
            message: result.card ? `Card is ${result.card.status}` : "RFID card not found",
            days_remaining: 0, door_opened: false,
          });
          return ok({ checked_in: false, reason: result.error || "CARD_NOT_FOUND" });
        }
        if (!result.member) {
          await logAccess({
            company_id: user.company_id, card_uid,
            member_id: null, member_name: null,
            granted: false, reason: "NO_MEMBER",
            message: "Card not assigned to any member",
            days_remaining: 0, door_opened: false,
          });
          return ok({ checked_in: false, reason: "NO_MEMBER" });
        }

        targetMemberId = result.member.id;
        cardUid = result.card.card_uid;
        cardLabel = result.card.label;

        const today = new Date().toISOString().split("T")[0];
        if (!result.member.plan_id || (result.member.end_date && result.member.end_date < today)) {
          await logAccess({
            company_id: user.company_id, card_uid,
            member_id: result.member.id, member_name: result.member.name,
            granted: false, reason: "NO_ACTIVE_MEMBERSHIP",
            message: "Member does not have an active gym membership",
            days_remaining: 0, door_opened: false,
          });
          return ok({ checked_in: false, reason: "NO_ACTIVE_MEMBERSHIP", member: result.member });
        }

        await updateCardLastUsed(result.card.id);
      }

      if (!targetMemberId) return badRequest("Either card_uid or member_id is required");

      const existing = await pool.query(
        `SELECT id FROM gym_checkins WHERE member_id = $1 AND status = 'checked_in' AND company_id = $2 LIMIT 1`,
        [targetMemberId, user.company_id]
      );
      if (existing.rows.length > 0) {
        return ok({ checked_in: true, already_checked_in: true, checkin_id: existing.rows[0].id });
      }

      const checkin = await pool.query(
        `INSERT INTO gym_checkins (company_id, member_id, card_uid, status, source)
         VALUES ($1,$2,$3,'checked_in',$4) RETURNING *`,
        [user.company_id, targetMemberId, cardUid || null, source || "rfid"]
      );

      const memberRes = await pool.query("SELECT full_name, customer_id FROM membership_members WHERE id = $1", [targetMemberId]);
      const member = memberRes.rows[0];

      await logAccess({
        company_id: user.company_id,
        card_uid: cardUid || "manual",
        member_id: targetMemberId,
        member_name: member?.full_name || null,
        granted: true, reason: "GYM_CHECKIN",
        message: "Gym check-in granted",
        days_remaining: 0, door_opened: false,
      });

      return ok({
        checked_in: true,
        checkin: checkin.rows[0],
        member: { id: targetMemberId, name: member?.full_name, code: member?.customer_id },
        card: cardUid ? { uid: cardUid, label: cardLabel } : null,
      });
    } catch (e: any) { return err(e.message); }
  });
}
