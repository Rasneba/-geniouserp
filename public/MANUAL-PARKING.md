# Parking Management System — Complete Manual

> **For:** Admin & Super Admin Users  
> **Version:** 1.0  
> **Last Updated:** July 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Getting Started](#2-getting-started)
3. [Setup Wizard — First Time Configuration](#3-setup-wizard--first-time-configuration)
4. [Module Reference: All Pages](#4-module-reference-all-pages)
5. [Database Structure](#5-database-structure)
6. [API Reference](#6-api-reference)
7. [Pricing & Fee Calculation](#7-pricing--fee-calculation)
8. [Payment Methods](#8-payment-methods)
9. [QR Entry System](#9-qr-entry-system)
10. [Troubleshooting](#10-troubleshooting)
11. [Environment Variables](#11-environment-variables)

---

## 1. System Overview

The Parking Management System is a complete solution for running a parking facility. It handles:

- **Vehicle entry & exit** — via ANPR cameras, QR codes, NFC, or manual
- **Customer management** — register vehicles, assign subscriptions
- **Pricing & billing** — flexible rate plans, automatic fee calculation
- **POS payments** — cash, mobile money (Telebirr, CBE Birr), Chapa, cards
- **QR Kiosk** — self-service entry for walk-in visitors
- **Reporting** — access logs, subscription reports, CSV export

### Who Can Do What

| Feature | Admin | Super Admin |
|---|---|---|
| Manage zones, slots, gates, cameras | ✅ Own company | ✅ All companies |
| Register customers & vehicles | ✅ Own company | ✅ All companies |
| Create subscriptions | ✅ Own company | ✅ All companies |
| Set rates/pricing | ✅ Own company | ✅ All companies |
| Process POS payments | ✅ Own company | ✅ All companies |
| View reports | ✅ Own company | ✅ All companies |
| Access all companies' data | ❌ | ✅ |

---

## 2. Getting Started

### Login

1. Go to your HRMS login page
2. Enter your email and password
3. Click **Sign In**
4. In the sidebar, expand **Membership** → find **Parking** section
5. Click any parking page (e.g., **Parking Dashboard**)

### Navigation

All parking pages are under the **Membership** group in the left sidebar:

```
▸ Membership
  ▸ Members
  ...
  ─── Parking ───
  ▸ Parking Dashboard    → Overview & KPIs
  ▸ Zones & Lots         → Parking zones
  ▸ Slots                → Individual parking spots
  ▸ Gates                → Entry/exit gates
  ▸ Cameras              → ANPR / webcam cameras
  ▸ Customers            → Registered parking customers
  ▸ Vehicles             → Registered vehicles
  ▸ Subscriptions        → Monthly/annual parking plans
  ▸ Sessions             → Live & past entry/exit records
  ▸ Rates                → Fee/pricing structure
  ▸ QR Tickets           → Visitor QR entry tickets
  ▸ Kiosk                → Self-service entry station
  ▸ POS                  → Payment terminal
  ▸ Reports              → Access logs & subscription reports
```

---

## 3. Setup Wizard — First Time Configuration

When you first install the parking module, you must set up the infrastructure in this order:

### Step 1: Create Zones

Go to **Zones & Lots** → click **Add Zone**

| Field | Description | Example |
|---|---|---|
| Name | Zone name | "Ground Floor A" |
| Code | Short code (unique) | "GFA" |
| Floor | Floor number | 0 |
| Type | Zone type | standard / vip / disabled / electric / staff |
| Description | Notes | "Near elevator" |

Click **Save**. Repeat for each zone.

### Step 2: Create Slots

Go to **Slots** → click **Add Slot**

| Field | Description | Example |
|---|---|---|
| Zone | Which zone this slot belongs to | "Ground Floor A" |
| Slot Number | Spot identifier (unique per company) | "A-01" |
| Floor | Floor number | 0 |
| Type | standard / vip / disabled / electric / staff |
| Status | available / reserved / maintenance | "available" |

### Step 3: Create Gates

Go to **Gates** → click **Add Gate**

| Field | Description | Example |
|---|---|---|
| Name | Gate name | "Main Entry" |
| Code | Short code | "MAIN-IN" |
| Type | entry / exit / dual | "entry" |
| Direction | in / out / both | "in" |
| Enable ANPR | Allow automatic plate recognition | ✅ |
| Enable QR | Allow QR code scanning | ✅ |
| Enable NFC | Allow NFC tag scanning | ❌ |

### Step 4: Add Cameras

Go to **Cameras** → click **Add Camera**

| Field | Description | Example |
|---|---|---|
| Name | Camera name | "Gate 1 ANPR" |
| Code | Short code | "CAM-01" |
| Gate | Which gate this camera serves | "Main Entry" |
| Protocol | http / rtsp / onvif / tcp_ip / **webcam** |
| IP Address | Camera IP (leave blank for webcam) | "192.168.1.100" |
| Port | Port number | 80 |
| RTSP URL | RTSP stream URL | "rtsp://..." |
| Direction | in / out / both | "in" |
| Confidence | Minimum plate confidence % | 85 |

> **Webcam**: Select "webcam" protocol for a laptop/desktop webcam. No IP address needed.

### Step 5: Set Rates (Pricing)

Go to **Rates** → click **Add Rate**

| Field | Description | Example |
|---|---|---|
| Name | Rate name | "Standard Hourly" |
| Vehicle Type | car / suv / truck / bus / motorcycle / all |
| Rate Type | hourly / daily / weekly / monthly / annual / flat / custom |
| Base Rate | Starting fee | 30 |
| Per Hour | Additional per-hour charge | 0 |
| Per Day | Daily cap | 0 |
| Grace Period | Free minutes before charging | 15 |
| Max Daily | Maximum charge per day | 0 (unlimited) |

**Default fallback**: If no rate matches a session, the system charges **30 ETB per 30 minutes** (rounded up).

### Step 6: Register Customers & Vehicles

Go to **Customers** → **Add Customer**

| Field | Description |
|---|---|
| Full Name | Customer name |
| Phone | Phone number |
| Email | Email address |
| Photo | Profile photo (optional) |

After creating a customer, go to **Vehicles** → **Add Vehicle**

| Field | Description |
|---|---|
| Plate Number | Vehicle license plate |
| Vehicle Type | car / suv / truck / bus / motorcycle |
| Model / Color | Optional details |
| Owner | Link to a customer |
| Blacklisted | Block vehicle from entry |

---

## 4. Module Reference: All Pages

### 4.1 Parking Dashboard

The main overview page showing:
- **6 KPI cards**: Occupied Slots, Active Sessions, Today's Entries, Today's Revenue, Total Customers, Active Subscriptions
- **Live active sessions table**: Auto-refreshes every 15 seconds showing vehicles currently parked
- **Quick-link cards**: 12 cards linking to each parking page

### 4.2 Zones & Lots

Manage parking zones (areas/lots).
- **List view**: Shows all zones with occupied/total slots count
- **Badge colors**: standard (blue), VIP (gold), disabled (purple), electric (green), staff (grey)
- **Edit/Delete**: Click the gear icon or delete button on each row
- **Link to Slots**: Button to jump to slots filtered by that zone

### 4.3 Slots

Manage individual parking spots.
- **Filters**: Filter by zone and status
- **Status badges**: available (green) / occupied (red) / reserved (yellow) / maintenance (grey)
- **Auto-management**: When a vehicle enters, the system auto-assigns an available slot. When it exits, the slot is freed.

### 4.4 Gates

Manage entry/exit barriers.
- **Each gate** can enable/disable ANPR, QR, and NFC entry methods
- **IP/Serial port**: Configure hardware integration
- **Barrier delay**: Seconds before barrier opens after scan
- **Status**: active / inactive / maintenance

### 4.5 Cameras

Manage ANPR cameras and webcams.
- **IP Cameras**: Configure IP address, port, RTSP URL for real ANPR cameras
- **Webcam**: Select "webcam" protocol, no IP needed — uses laptop/desktop camera
- **Live preview**: Click "Test" to view camera feed
- **Direction**: Assign camera to inbound or outbound lane

### 4.6 Customers

Manage parking customers (registered members).
- **Search**: Find by name or phone
- **Register**: Creates customer with auto-generated ID (e.g., `CUT-001`) and QR code
- **Details view**: Shows customer info, linked vehicles, and subscriptions
- **Photo upload**: Take or upload customer photo

### 4.7 Vehicles

Manage registered vehicles.
- **Plate search**: Find by plate number
- **Blacklist**: Block specific vehicles from entering
- **Types**: car / suv / truck / bus / motorcycle
- **Owner link**: Each vehicle can be linked to a customer

### 4.8 Subscriptions

Monthly, quarterly, semi-annual, or annual parking plans.
- **Create subscription**: Select customer, vehicle, plan type, set dates and amount
- **Status tracking**: active / expired / cancelled / pending
- **Auto-calculate end date**: Based on plan type from start date
- **Revenue totals**: Shows total subscription revenue
- **Auto-renew**: Optionally auto-renew on expiry

### 4.9 Sessions

Live and historical entry/exit records.
- **Live view**: Shows currently active sessions (auto-refresh 10s)
- **Filters**: By status (active/completed/pending_payment/cancelled) and date
- **Exit action**: Manually end a session — calculates duration and fee
- **Pay link**: Click to go to POS with session pre-selected
- **Details**: Entry time, exit time, duration, gate, slot, amount, payment status

### 4.10 Rates

Fee/pricing configuration.
- **Rate types**: hourly / daily / weekly / monthly / annual / flat / custom
- **Grace period**: Free minutes before charging begins
- **Max daily charge**: Cap on daily fees
- **Currency**: ETB (Ethiopian Birr) by default
- **Default fallback**: If no rate matches, system charges **30 ETB per 30 minutes**

### 4.11 QR Tickets

Generate and manage QR entry tickets for visitors.
- **Create ticket**: Enter visitor name, phone, plate, purpose, host, expiry
- **Auto-generates**: Ticket number (e.g., `QR-001`) and QR code image
- **Statuses**: active / used / expired / cancelled
- **Copy QR data**: Click to copy JSON payload for sharing
- **Expiry**: Tickets auto-expire after set duration

### 4.12 Kiosk

Self-service entry station for walk-in visitors.
- **Step 1**: Select registered customer OR enter walk-in name/phone
- **Step 2**: Select parking zone
- **Step 3**: Click "Generate Entry QR"
- **Result**: Prints QR ticket with session created. Hand to driver.
- **Ticket format**: Plate shows as `KIO-QR-001`, entry method is `qr`

### 4.13 POS (Point of Sale)

Process payments and print receipts. **The main checkout terminal.**

**5 Tabs:**

| Tab | Purpose |
|---|---|
| **Checkout** | Payment form — select session, enter amount, choose method, process |
| **Plate** | Search by plate number to find unpaid session |
| **Phone** | Search by phone number to find unpaid session |
| **QR** | Paste QR scan data or type ticket number to look up session |
| **Camera Scan** | Live webcam QR scanning — hover QR code to auto-detect |

**Payment methods supported:**
- Cash
- Telebirr
- CBE Birr
- Chapa (online payment)
- SantimPay
- Bank Transfer
- POS Machine
- Credit Card
- Debit Card

**Process:**
1. Select a session from the pending list (left column)
2. Review entry time, exit time, duration, zone, vehicle
3. Enter amount (auto-calculated or manual)
4. Select payment method
5. Click **Process Payment & Print Receipt**
6. Receipt modal appears → click **Print Receipt**
7. A clean 80mm thermal receipt prints with: company header, customer info, entry/exit times, duration, amount breakdown, payment method, QR exit pass, thank-you message

### 4.14 Reports

**Subscription Report:** Revenue and status breakdown of all subscription plans. Filterable by status and date range. Printer-friendly view.

**Access Log Report:** Complete audit log of all parking sessions. Shows:
- Ticket, plate, customer, vehicle type
- Entry gate & time, Exit gate & time, Duration
- Zone, slot, amount, payment method, status
- **Summary cards**: Total Entries, Total Exits, Active Now, Avg Duration, Total Revenue
- **Filter**: By date range, plate number, session status
- **CSV export**: Download filtered data as spreadsheet

---

## 5. Database Structure

> **For system administrators only.** You do not need to interact with the database directly — everything is managed through the web interface.

### Table Relationships

```
companies
  └── parking_zones (1 company → many zones)
  └── parking_gates (1 company → many gates)
  └── parking_cameras (1 company → many cameras)
  └── parking_vehicles (1 company → many vehicles)
  └── parking_sessions (1 company → many sessions)
  └── parking_rates (1 company → many rates)
  └── parking_qr_tickets (1 company → many tickets)
  └── parking_payments (1 company → many payments)
  └── parking_subscriptions (1 company → many subscriptions)

parking_zones
  └── parking_slots (1 zone → many slots)

parking_gates
  └── parking_cameras (1 gate → many cameras)
  └── parking_sessions (gate → entry_gate / exit_gate)

parking_vehicles
  └── membership_members (vehicle → customer)
  └── parking_sessions (1 vehicle → many sessions)

parking_sessions
  └── parking_payments (1 session → 1 payment)
  └── parking_qr_tickets (session → QR ticket)
  └── parking_slots (session → assigned slot)
```

### Key Tables Explained

| Table | Stores | Key Fields |
|---|---|---|
| `parking_zones` | Parking areas/lots | name, code, type, slot_count |
| `parking_slots` | Individual parking spots | zone_id, slot_number, status |
| `parking_gates` | Entry/exit barriers | name, type, is_anpr_enabled, is_qr_enabled |
| `parking_cameras` | ANPR/webcam cameras | gate_id, name, protocol, ip_address |
| `parking_vehicles` | Registered vehicles | plate_number, vehicle_type, owner info |
| `parking_sessions` | Every entry/exit record | entry_time, exit_time, status, amount, paid |
| `parking_rates` | Pricing rules | rate_type, base_rate, per_hour_rate |
| `parking_qr_tickets` | Visitor QR entry codes | ticket_number, visitor_name, valid_until, is_used |
| `parking_payments` | Payment transactions | session_id, amount, payment_method |
| `parking_subscriptions` | Monthly/annual plans | customer_id, plan_type, start_date, end_date |

### Key Status Values

**Sessions:**
- `active` → Vehicle is currently parked (not yet paid)
- `pending_payment` → Vehicle ready for checkout, awaiting payment
- `completed` → Paid and exited
- `cancelled` → Session voided

**Slots:**
- `available` → Empty, ready for next vehicle
- `occupied` → Vehicle parked here
- `reserved` → Held for a specific vehicle
- `maintenance` → Out of service

**QR Tickets:**
- `active` → Valid and unused
- `used` → Scanned at entry
- `expired` → Past valid_until date
- `cancelled` → Manually voided

### Database Migration Files

| File | What It Adds |
|---|---|
| `db-migration-v14.sql` | All parking tables, views, indexes (full parking module) |
| `db-migration-v15.sql` | Auto-ID generation system for ticket numbers |
| `db-migration-v16.sql` | Webcam camera support (protocol + nullable IP) |

---

## 6. API Reference

> For developers integrating external systems. All API endpoints require a JWT token in the `Authorization: Bearer <token>` header unless noted.

### Authentication

```
Header: Authorization: Bearer <jwt_token>
Token source: localStorage.getItem("token") after login
```

### Common Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/membership/parking/stats` | Dashboard KPIs & active sessions |
| GET | `/api/membership/parking/sessions` | List sessions (?status=&date=&zone_id=&phone=) |
| POST | `/api/membership/parking/sessions` | Create new session (vehicle entry) |
| GET | `/api/membership/parking/payments` | List payments (?date=) |
| POST | `/api/membership/parking/payments` | Process payment |
| GET | `/api/membership/parking/zones` | List zones |
| POST | `/api/membership/parking/zones` | Create zone |
| GET | `/api/membership/parking/rates` | List rates |
| POST | `/api/membership/parking/kiosk` | Create kiosk QR entry |
| POST | `/api/membership/parking/kiosk/lookup` | Lookup session by QR data |
| GET | `/api/membership/parking/reports/access-logs` | Access log report (?from=&to=&plate=&status=) |

### External Integrations

**Chapa Payment Gateway:**
- Initialize: `POST /api/membership/parking/chapa/initialize`
- Callback: `GET /api/membership/parking/chapa/callback`
- Webhook: `POST /api/membership/parking/chapa/callback`
- Verify: `GET /api/membership/parking/chapa/verify/{tx_ref}`
- Env: `CHAPA_SECRET_KEY`

---

## 7. Pricing & Fee Calculation

### How Fees Are Calculated

1. System checks `parking_rates` for a matching rate (by vehicle type)
2. If no rate matches → fallback: **30 ETB per 30 minutes** (rounded up)
3. Example:
   - 10 min → 1 block → **30 ETB**
   - 35 min → 2 blocks → **60 ETB**
   - 61 min → 3 blocks → **90 ETB**
   - 90 min → 3 blocks → **90 ETB**
   - 120 min → 4 blocks → **120 ETB**

### Setting Custom Rates

Go to **Rates** → **Add Rate**

| Example | Base Rate | Per Hour | Result for 2h stay |
|---|---|---|---|
| Flat rate | 50 | 0 | 50 ETB |
| Hourly | 0 | 30 | 60 ETB |
| Base + hourly | 20 | 30 | 80 ETB |
| Daily | 0 | 0 (daily=200) | 200 ETB |

### Grace Period

If a rate has a grace period (e.g., 15 min), the first N minutes are free.

---

## 8. Payment Methods

### Available Methods

| Method | Type | Description |
|---|---|---|
| Cash | Offline | Hand cash, receipt printed |
| Telebirr | Mobile Money | Ethiopian mobile payment |
| CBE Birr | Mobile Money | Commercial Bank of Ethiopia |
| Chapa | Online Gateway | Ethiopian payment processor (requires internet) |
| SantimPay | Online Gateway | Alternative payment processor |
| Bank Transfer | Bank | Manual bank payment |
| POS Machine | Card Terminal | Physical card reader |
| Credit Card | Card | Online card payment |
| Debit Card | Card | Online debit payment |

### Chapa (Online Payment)

1. Select **Chapa** as payment method
2. Click **Pay with Chapa** — redirected to Chapa checkout
3. Complete payment on Chapa's page
4. You're redirected back → click **Verify Payment**
5. System confirms payment, frees slot, generates receipt

**Requirements:**
- `CHAPA_SECRET_KEY` set in `.env`
- Internet connection
- Customer must have a phone/email for Chapa notification

---

## 9. QR Entry System

### How It Works

1. **At Kiosk**: Operator enters visitor details → system generates QR code → session created as `pending_payment`
2. **QR Ticket**: Contains JSON with ticket number, company ID, name, timestamp (base64 encoded)
3. **At POS**: Scan the QR with:
   - **Camera Scan tab** — hold QR to laptop webcam, auto-detects
   - **QR tab** — paste base64 data or type ticket number
4. System looks up the session → shows details → process payment

### QR Formats Accepted

The POS lookup accepts three formats:
- **Base64 string** (full QR data)
- **Raw JSON** like `{"t":"QR-001","c":1,"n":"John","ts":1234567890}`
- **Plain ticket number** like `QR-001` or `SES-001`

### Kiosk vs Registered Customer

| Type | Kiosk Entry | Registered Customer |
|---|---|---|
| Entry method | "qr" | Any (ANPR/NFC/manual) |
| Plate number | `KIO-{ticket}` | Actual plate |
| Status on entry | `pending_payment` | `active` |
| Payment | At POS before exit | Subscription or pay-per-use |
| QR code | Generated at kiosk | On customer profile |

---

## 10. Troubleshooting

### Problem: Session not appearing in POS pending list

**Causes:**
- Session status is `active` instead of `pending_payment` (kiosk sessions created before the fix)
- **Fix**: Run SQL: `UPDATE parking_sessions SET status = 'pending_payment' WHERE status = 'active' AND paid = false;`
- Or use the Sessions page to manually change status

### Problem: Phone search returns "No pending session found"

**Causes:**
- Phone number doesn't match any session's visitor/customer/owner phone
- Session status isn't `pending_payment` or `active`
- **Fix**: Check the phone number is correct. Verify session exists in Sessions page.

### Problem: Receipt not printing

**Causes:**
- Pop-up blocker preventing the new window
- **Fix**: Allow pop-ups for this site, or click the Print button again

### Problem: Camera not showing video in Camera Scan

**Causes:**
- Browser permissions blocked
- No webcam attached
- **Fix**: Check browser camera permissions (https required). Click "Start Camera" again.

### Problem: QR code not scanning

**Causes:**
- QR code damaged or too small
- Camera not focused
- Poor lighting
- **Fix**: Use the QR tab to manually paste the data instead

### Problem: Webcam option not showing in Cameras page

**Causes:**
- Browser doesn't support `getUserMedia`
- No camera detected
- **Fix**: Use Chrome or Edge. Connect a USB webcam.

---

## 11. Environment Variables

These must be set in your `.env` file:

```
# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=genius_hrms
DB_PASSWORD=your_password
DB_PORT=5432

# Authentication
JWT_SECRET=your_jwt_secret_key

# Chapa Payment Gateway
CHAPA_SECRET_KEY=your_chapa_secret_key

# Application URL (for Chapa callbacks)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Quick Reference Card

### Common Tasks

| Task | Where | Steps |
|---|---|---|
| Add a parking zone | Zones & Lots | Click "Add Zone", fill name/code/type, Save |
| Register a vehicle | Vehicles | Click "Add Vehicle", enter plate/owner, Save |
| Process a payment | POS | Select session → enter amount → choose method → Process |
| Generate QR ticket | Kiosk | Enter walk-in name → choose zone → Generate Entry QR |
| Print receipt | POS | After payment → click "Print Receipt" |
| View access log | Reports | Click "Access Log Report" tab → filter → view/export |
| Create subscription | Subscriptions | Select customer/vehicle → set plan/date/amount → Save |
| Exit a vehicle manually | Sessions | Find session → click "Exit" → confirm |
| Set parking rates | Rates | Click "Add Rate" → configure base rate/per hour → Save |

### Fee Calculation Default

> **30 ETB per 30 minutes** — charged in 30-minute blocks, rounded up.
> Example: 25 min = 30 ETB, 45 min = 60 ETB, 90 min = 90 ETB.

---

*End of Manual*
