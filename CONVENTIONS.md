# Genius HRMS — Conventions

## API Layer

### File Structure
```
app/api/<module>/
  route.ts           — GET (list), POST (create)
  [id]/route.ts      — GET (single), PUT (update), DELETE
  <action>/route.ts  — custom endpoints (e.g. process, sync, callback)
```

### Route Handler Pattern
Every route handler uses `withAuth` from `lib/api-utils.ts`:

```ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted } from "@/lib/api-utils";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    try {
      const result = await pool.query("SELECT * FROM items WHERE company_id = $1", [user.company_id]);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    try {
      const body = await req.json();
      const result = await pool.query(
        "INSERT INTO items (name, company_id) VALUES ($1, $2) RETURNING *",
        [body.name, user.company_id]
      );
      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}
```

### Response Helpers
| Function | Status | Body |
|----------|--------|------|
| `ok(data)` | 200 | `data` |
| `created(data)` | 201 | `data` |
| `err(msg, status?)` | 500 (default) | `{ error: msg }` |
| `notFound(entity?)` | 404 | `{ error: "..." }` |
| `badRequest(msg)` | 400 | `{ error: msg }` |
| `unauthorized()` | 401 | `{ error: "Unauthorized" }` |
| `deleted(entity?)` | 200 | `{ message: "..." }` |

### Auth
- Every route (except login/public) guards with `withAuth(req, handler)`.
- `user` object contains: `id`, `email`, `role`, `company_id`, `company_name`, `company_tin`.
- Use `isAdmin(user)` to check for admin/super_admin roles.
- Use `buildCompanyFilter(user, params, alias?)` to inject company isolation into SQL queries.

### Error Handling
- Wrap handler logic in `try/catch`, return `err(e.message)`.
- Return `notFound("Entity")` when a single record is not found.
- Return `badRequest("reason")` for validation failures.

---

## UI Layer

### Component Library (`components/`)
All shared UI components are in `components/` and re-exported from `components/index.ts`:

| Component | Props | Purpose |
|-----------|-------|---------|
| `PageHeader` | `title`, `subtitle?`, `icon?`, `children?` | Consistent page title + actions |
| `DataTable` | `columns`, `data`, `loading?`, `emptyMessage?`, `keyExtractor`, `onRowClick?` | Reusable table with loading/empty states |
| `StatusBadge` | `status`, `colorMap?` | Colored badge for status values |
| `SearchInput` | `value`, `onChange`, `placeholder?`, `debounceMs?` | Debounced search input |
| `FormField` | `label`, `error?`, `required?`, `children` | Form field wrapper |
| `ConfirmDialog` | `show`, `title?`, `message`, `confirmLabel?`, `variant?`, `onConfirm`, `onCancel` | Confirmation modal |
| `StatCard` | `label`, `value`, `icon`, `color?`, `onClick?` | Dashboard stat card |
| `LoadingSpinner` | `text?`, `fullPage?` | Loading indicator |
| `EmptyState` | `message?`, `icon?`, `children?` | Empty/no-data state |

### Page Structure
```
app/[locale]/dashboard/<module>/
  page.tsx              — list or dashboard overview
  add/page.tsx          — create form
  [id]/page.tsx         — detail/edit
  edit/[id]/page.tsx    — dedicated edit page (when detail ≠ edit)
  view/[id]/page.tsx    — dedicated view page (when complex)
```

### Page Template
```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, DataTable, StatusBadge, LoadingSpinner } from "@/components";
import type { Column } from "@/components/DataTable";

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    setLoading(true);
    try {
      const res = await fetch("/api/items", { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {}
    setLoading(false);
  };

  const columns: Column<any>[] = [
    { key: "id", label: "ID", width: "80px" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Items" icon="box" subtitle="Manage system items">
        <Link href="/dashboard/items/add" className="btn btn-primary btn-sm">
          <i className="bi bi-plus-lg me-1"></i>Add Item
        </Link>
      </PageHeader>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="No items found"
        keyExtractor={(r) => r.id}
      />
    </div>
  );
}
```

### Styling
- Bootstrap 5 classes throughout (no custom CSS files).
- Tables use `table table-hover mb-0` with `table-dark` or `table-light` thead.
- Cards use `card border-0 shadow-sm`.
- Icons use `bootstrap-icons` (`bi-<name>`).
- Status badges use `badge bg-<color>`.

---

## Database Layer

### Naming
| Element | Convention | Example |
|---------|-----------|---------|
| Tables | `snake_case`, **plural** | `parking_sessions`, `payroll_items` |
| Columns | `snake_case` | `start_date`, `is_active` |
| Primary key | `id SERIAL PRIMARY KEY` | `id` |
| Foreign key | `<singular>_id` | `employee_id`, `company_id` |
| Booleans | `is_<adjective>` | `is_active`, `is_paid` |
| Statuses | `VARCHAR(20)` + `CHECK` | `CHECK (status IN ('active','completed'))` |
| Indexes | `idx_<table>_<column>` | `idx_parking_slots_zone` |

### Required Columns
Every table must have:
- `id SERIAL PRIMARY KEY`
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` (if rows are updated post-insert)

### Multi-Tenancy
- Every tenant-scoped table has `company_id` column.
- All queries filter by `company_id` using `buildCompanyFilter()` (or manual `WHERE company_id = $N`).
- Admin/super_admin users bypass company filtering.

### Migrations
- Raw numbered SQL files: `db-migration-v<N>.sql` in project root.
- Each file adds new tables or alters existing ones.
- File names must be sequential (v16 → v17 → ...).
- Use `CREATE OR REPLACE` and `IF NOT EXISTS` for idempotency.

### Connection
Single shared pool via `lib/db.ts` — always import `import pool from "@/lib/db"`.

---

## Shared Libraries

### `lib/api-utils.ts` — API Response Helpers
- `withAuth(req, handler)` — wraps handler with auth check, injects `user` object
- `ok(data)` / `created(data)` / `err(msg, status)` / `notFound(entity)` / `badRequest(msg)` / `deleted(entity)`
- `isAdmin(user)` — checks for `admin` or `super_admin` role
- `buildCompanyFilter(user, params, alias?)` — returns SQL fragment for company isolation

### `lib/audit.ts` — Audit Logging
- `logAudit(entry)` — inserts immutable audit record
- `extractChanges(oldRow, newRow)` — computes diff between old/new row values
- Call after every CREATE, UPDATE, DELETE in route handlers

### `lib/storage.ts` — File Storage Abstraction
- `upload(tenant, dir, filename, buffer, mime)` — stores file, returns URL
- Backend configurable via `STORAGE_BACKEND` (local|s3|minio)
- Default: base64 data URL (no external deps required)
- S3/MinIO requires `@aws-sdk/client-s3` as optional dependency

### `lib/cache.ts` — Caching Layer
- `get(key)` / `set(key, data, ttl?)` / `del(key)` / `remember(key, fn, ttl?)`
- Backend configurable via `CACHE_BACKEND` (memory|redis), `CACHE_TTL` (default 300s)
- Default: in-memory Map (no external deps required)
- Redis requires `redis` as optional dependency
