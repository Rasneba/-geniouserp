# RFID Access Control System — Operation Manual

## Overview

This system integrates an RFID door access controller (192.168.0.68) with the HRMS to:
- Validate RFID cards against active subscriptions
- Automatically open the door when a valid card is swiped
- Show remaining subscription days on the dashboard
- Work both locally (with hardware control) and from Vercel (data only)

---

## Architecture

### Integrated Mode (no separate proxy)

```
┌─────────────────────┐
│  Browser             │
│  localhost:3000      │
│  Access Control page │
└────────┬────────────┘
         │ fetch() same-origin
         ▼
┌─────────────────────┐    proxies to     ┌──────────────────┐
│  Next.js             │──────────────────►│  Access Controller│
│  /api/parking/access │◄─────────────────│  192.168.0.68    │
│  (middleware auth)   │    Event.xml      └──────────────────┘
└────────┬────────────┘     cdor.cgi
         │ pool.query()
         ▼
┌─────────────────────┐
│  Neon PostgreSQL     │
│  (cloud database)    │
└─────────────────────┘
```

**Key insight:** The Next.js API route `/api/parking/access` runs on the server. When Next.js runs locally (`npm run dev`), the server can reach 192.168.0.68 on the LAN. When deployed to Vercel (cloud), the controller is unreachable — the page shows data-only mode.

### Legacy Proxy Mode (optional standalone)

```
┌─────────────┐    polls /Event.xml     ┌──────────────┐
│  Access      │◄──────────────────────│  Local Proxy  │
│  Controller  │                        │  (port 3001) │
│  192.168.0.68│────── /cdor.cgi ──────►│              │
└─────────────┘                        │  serves UI   │
                                       │  + proxies   │
                                       │  controller  │
                                       └──────┬───────┘
                                              │ POST /api/lookup
                                              ▼
                                       ┌──────────────┐
                                       │  HRMS API    │
                                       │  (Next.js)   │
                                       │  port 3000   │
                                       └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │  Neon DB     │
                                       │  (Postgres)  │
                                       └──────────────┘
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- `npm run dev` running on localhost:3000
- Access controller at 192.168.0.68 (same LAN)
- Logged into HRMS site to get JWT token

### 2. Get Token

Open HRMS in browser → F12 Console → paste:

```js
copy(localStorage.getItem("token"))
```

### 3. Start Dev Server & Open Page

```bash
npm run dev
```

Then navigate to **Parking > Access Control** in the sidebar, or open:

```
http://localhost:3000/en/dashboard/membership/parking/access
```

- **Green dot** = controller connected — live swipe feed + door control work
- **Red dot** = controller offline — shows cards & remaining days only

---

## New Card Setup (end-to-end)

### Via HRMS UI (recommended)

1. Go to **Parking > Customers** → **Add Customer**
2. Enter name, phone → save
3. Go to **Parking > Subscriptions** → **Add Subscription**
   - Select customer, set start = today, end = today + N days, amount = any value
4. Go to **Parking > RFID Cards** → **Register Card**
   - Card UID = number from controller or physical card
   - Select the member
5. Swipe card at reader → door opens automatically

### Via API (for testing/automation)

```bash
# 1. Create member
curl -X POST http://localhost:3000/api/membership/parking/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"full_name":"Test User","phone":"0911000000"}'

# 2. Create 5-day subscription (replace MEMBER_ID from step 1)
curl -X POST http://localhost:3000/api/membership/parking/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"customer_id":MEMBER_ID,"start_date":"2026-07-08","end_date":"2026-07-13","amount":1}'

# 3. Register card
curl -X POST http://localhost:3000/api/membership/parking/rfid-cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"card_uid":"7156649","member_id":MEMBER_ID,"label":"test"}'
```

---

## Controller Details

### Hardware
- **Model:** Standalone IP door access controller
- **IP:** 192.168.0.68 (static, port 80)
- **Auth:** HTTP Basic — `admin` / `888888`
- **Protocol:** HTTP GET requests

### Commands

| Action        | URL                                           |
|---------------|-----------------------------------------------|
| Open door     | `http://192.168.0.68/cdor.cgi?open=1`         |
| Close door    | `http://192.168.0.68/cdor.cgi?open=0`         |
| Lock door     | `http://192.168.0.68/cdor.cgi?open=6`         |
| Unlock door   | `http://192.168.0.68/cdor.cgi?open=7`         |
| Fire alarm    | `http://192.168.0.68/cdor.cgi?open=c`         |
| Clear alarm   | `http://192.168.0.68/cdor.cgi?open=d`         |
| Live events   | `http://192.168.0.68/Event.xml?ID=0`          |
| Web UI        | `http://192.168.0.68/`                        |
| Cards list    | `http://192.168.0.68/card.htm?page=0`         |
| Event history | `http://192.168.0.68/Event.htm?page=0`        |

### Test from command line

```bash
curl -u admin:888888 "http://192.168.0.68/cdor.cgi?open=1"
curl -u admin:888888 "http://192.168.0.68/Event.xml?ID=0"
```

---

## How Card Swipe Works (Integrated Mode)

```
Browser                    Next.js Server                Controller
   │                           │                           │
   │─── GET /access page ──────►                           │
   │                           │                           │
   │◄─── page rendered ────────┤                           │
   │    (cards table, stats)   │                           │
   │                           │                           │
   │─── GET /api/parking/access?action=ping ───────────────►│
   │◄─── {ok:true} ────────────┤◄──────────────────────────┤
   │                           │                           │
   │─── poll event every 1s ───┤                           │
   │─── GET /api/parking/access?action=event&ID=N ────────►│
   │◄─── {Card:"11411741"} ────┤◄──────────────────────────┤
   │                           │                           │
   │─── POST /api/membership/parking/rfid-card-lookup ─────┤
   │    (check subscription)   │   (queries Neon DB)       │
   │◄─── {granted:true, days_remaining:28} ────────────────┤
   │                           │                           │
   │─── GET /api/parking/access?action=open-door ─────────►│
   │    (auto open door)       │   /cdor.cgi?open=1       │
   │◄─── door opened ──────────┤◄──────────────────────────┤
   │                           │                           │
   │ DISPLAY: ACCESS GRANTED   │                           │
   │ 28 days remaining         │                           │
```

---

## API Reference

### GET /api/parking/access?action=ping

Tests controller connectivity. Proxies `GET /index.htm` on controller.

**Response:**
```json
{ "ok": true, "data": "..." }
```
`ok: false` if controller unreachable.

### GET /api/parking/access?action=event&ID=N

Polls for new card events. Proxies `GET /Event.xml?ID=N` on controller.

**Response:**
```json
{ "ok": true, "data": "<response>{\"ID\":\"30\",\"Card\":\"11411741\",\"Note\":\"Invalid card\",...}</response>" }
```

### GET /api/parking/access?action=open-door

Opens door. Proxies `GET /cdor.cgi?open=1` on controller.

### POST /api/membership/parking/rfid-card-lookup

Validates a card against the database.

**Request:** `{ "card_uid": "11411741" }`

**Response (granted):**
```json
{
  "granted": true,
  "reason": "ACCESS_GRANTED",
  "card": { "uid": "11411741", "label": "test" },
  "member": { "id": 5, "name": "Ephrem Awulachew" },
  "subscription": { "id": 4, "end_date": "2026-08-05T21:00:00.000Z" },
  "days_remaining": 28,
  "doorUrl": "http://192.168.0.68:80/cdor.cgi?open=1"
}
```

**Response (denied):**
```json
{
  "granted": false,
  "reason": "NO_ACTIVE_SUBSCRIPTION",
  "message": "No active subscription covering today",
  "card": { "uid": "11411741", "label": "test" },
  "member": { "id": 5, "name": "Ephrem Awulachew" },
  "days_remaining": 0
}
```

**Possible reasons:** `CARD_NOT_FOUND`, `CARD_INACTIVE`, `NO_MEMBER`, `CARD_EXPIRED`, `NO_ACTIVE_SUBSCRIPTION`

---

## Database Schema

### rfid_cards

Created by `db-migration-v21.sql`.

| Column       | Type            | Description                        |
|-------------|-----------------|------------------------------------|
| id          | SERIAL PK       |                                    |
| company_id  | INTEGER NOT NULL| FK → companies(id)                 |
| member_id   | INTEGER         | FK → membership_members(id)        |
| card_uid    | VARCHAR(100)    | Unique per company                 |
| label       | VARCHAR(200)    | Human-readable name                |
| status      | VARCHAR(20)     | active / disabled / lost           |
| issued_at   | DATE            | Default CURRENT_DATE               |
| expiry_date | DATE            | Card-level expiry (optional)       |
| last_used_at| TIMESTAMP       | Updated on each access grant       |
| created_by  | INTEGER         | FK → users(id)                     |
| created_at  | TIMESTAMP       | Auto                               |
| updated_at  | TIMESTAMP       | Auto                               |

**Index:** `UNIQUE (company_id, card_uid)`

### parking_subscriptions

| Column      | Type         | Description                              |
|------------|--------------|------------------------------------------|
| id         | SERIAL PK    |                                          |
| company_id | INTEGER FK   | References companies                     |
| customer_id| INTEGER FK   | References membership_members.id         |
| start_date | DATE         | Subscription start date                  |
| end_date   | DATE         | Subscription end date                    |
| amount     | DECIMAL(12,2)| Must be >= 0 (pass 1 for free)          |
| status     | VARCHAR(20)  | active / expired / cancelled / pending   |

### membership_members

| Column      | Type         | Description                |
|------------|--------------|----------------------------|
| id         | SERIAL PK    | Referenced by rfid_cards.member_id |
| company_id | INTEGER FK   |                            |
| full_name  | VARCHAR      | Member name                |
| phone      | VARCHAR      | Contact phone              |
| customer_id| VARCHAR(50)  | Auto-generated code        |

---

## Test Cards

| Card UID    | Member            | Subscription | Days Left | Status   |
|-------------|-------------------|-------------|-----------|----------|
| 11411741    | Ephrem Awulachew  | id=4        | 28        | Active   |
| 7156649     | Test Customer 2   | id=5        | 5         | Active   |

---

## Troubleshooting

| Symptom                     | Cause                          | Fix                                              |
|-----------------------------|--------------------------------|--------------------------------------------------|
| Red dot / "Controller Offline" | Controller unreachable       | `ping 192.168.0.68` — check LAN connection       |
| All pages 404               | Middleware not loaded          | Ensure `middleware.ts` exists with default export |
| "CARD_NOT_FOUND"            | Card UID not in `rfid_cards`   | Register card via HRMS UI                        |
| "NO_ACTIVE_SUBSCRIPTION"    | No subscription for today      | Create subscription covering today's date        |
| "Amount is required"        | Amount = 0 rejected           | Pass amount >= 1, or fix `!amount` check         |
| Card swiped, no event       | Wrong event ID polling         | Check browser console for fetch errors           |
| Door won't open             | Wrong door URL                 | Test manually: `curl -u admin:888888 "http://192.168.0.68/cdor.cgi?open=1"` |
| Works locally, not on Vercel| Controller on local LAN only   | Expected — use from `http://localhost:3000`       |
| Mixed content error         | HTTPS → HTTP to controller     | Access page via HTTP locally, not HTTPS           |
| 401 on controller           | Wrong credentials              | Default: admin / 888888                          |

---

## Access Control Page Features

At **Parking > Access Control** (`/en/dashboard/membership/parking/access`):

### Works Everywhere (Vercel + Local)
- **Cards table** — all active cards with member name, UID, label, days remaining, status
- **Stat cards** — count of active cards, valid subscriptions, expiring soon (≤7d), expired

### Local Network Only (controller reachable)
- **Connection indicator** — green/red dot
- **Live swipe feed** — real-time card events from controller
- **Auto door open** — valid card swipe → door opens automatically
- **Manual Open Door button**

---

## Files Reference

### Core System Files

| File | Purpose |
|------|---------|
| `middleware.ts` | next-intl i18n middleware — enables locale routing (`/en/...`, `/am/...`) |
| `app/api/parking/access/route.ts` | Proxies controller commands — ping, event poll, open-door |
| `app/[locale]/dashboard/membership/parking/access/page.tsx` | Access Control dashboard page |
| `app/api/membership/parking/rfid-card-lookup/route.ts` | Card validation API — checks card + subscription |
| `app/api/membership/parking/rfid-cards/route.ts` | RFID cards CRUD (list, create) |
| `app/api/membership/parking/rfid-cards/[id]/route.ts` | RFID cards CRUD (get, update, delete) |
| `app/api/membership/parking/subscriptions/route.ts` | Subscriptions CRUD |
| `app/api/membership/parking/customers/route.ts` | Customer/member CRUD |
| `app/[locale]/dashboard/layout.tsx` | Dashboard layout with sidebar config |
| `lib/access-control.ts` | Shared HTTP client for door controller |
| `lib/auth.ts` | JWT token creation and verification |
| `lib/api-utils.ts` | Helpers: withAuth, ok, err, badRequest, etc. |
| `lib/db.ts` | PostgreSQL connection pool (Neon) |
| `messages/en.json` | English translations |
| `messages/am.json` | Amharic translations |

### Database

| File | Purpose |
|------|---------|
| `db-migration-v21.sql` | Creates `rfid_cards` table, adds `is_rfid_enabled` to gates, seeds permissions |
| `db-migration-v14.sql` | Creates `parking_subscriptions`, `parking_vehicles`, adds `customer_id` to members |

### Legacy / Standalone Scripts

| File | Purpose |
|------|---------|
| `scripts/local-proxy.mjs` | Standalone Node.js proxy (port 3001) — serves HTML console + proxies controller (legacy) |
| `scripts/access-relay.mjs` | CLI-only relay — polls controller + opens door (no browser needed) |
| `scripts/MANUAL.md` | This document |
