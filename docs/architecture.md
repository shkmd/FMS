# Architecture — Athachi Farms FMS

## Overview

A pnpm/Turborepo monorepo with a NestJS REST API and a Next.js (App Router) frontend as separate
deployables, sharing one package of types/enums/permission-codes/Zod schemas. This matches the spec's
"Recommended" stack (§11) and its layering requirement (§17: presentation / application services /
domain rules / data access / background jobs / notifications / file storage must be separate).

```
FMS/
  apps/
    api/     NestJS — REST API, Swagger docs, Prisma, business logic, scheduled jobs
    web/     Next.js 14 — PWA, Tailwind + shadcn/ui-style components, TanStack Query, Leaflet map
  packages/
    shared/  Enums, permission codes + the seeded role→permission matrix, Zod DTO schemas
  infra/     docker-compose (Postgres/Redis/MinIO for dev; prod composition + nginx reference)
  docs/      This directory
```

## Layering (apps/api/src)

- `modules/<domain>/*.controller.ts` — HTTP surface: routes, DTOs (class-validator), Swagger, permission
  guards. No business logic.
- `modules/<domain>/*.service.ts` — all domain rules live here (state machines, overlap checks,
  reassignment approval, audit writes). Pure, unit-testable helpers (e.g. `task-state-machine.ts`,
  `task-assignment.util.ts`) are factored out of the service so the rules can be tested without a
  database.
- `common/prisma` — the only place Prisma is imported from outside a service; `PrismaService` is a
  global provider.
- `common/audit` — `AuditService.write()` is called explicitly at every mutation spec §13 calls out
  (approvals, reassignment, RBAC changes) — not inferred generically, so before/after snapshots are
  always meaningful.
- `common/notifications` — DB-backed now; `channel` column already models push/email/WhatsApp for
  Phase 2 adapters, so callers don't change later.
- `jobs/` — `@nestjs/schedule` cron sweeps (overdue-task alerts, end-of-day incomplete-task reminders).
  BullMQ + Redis are wired (`@nestjs/bullmq`) for Phase 2 queue-based jobs, but Milestone 1's two jobs
  deliberately don't depend on Redis being reachable.

## Auth & RBAC

JWT access token (15 min, bearer header) + rotating refresh token (7 day, httpOnly cookie scoped to
`/api/auth`, hashed at rest in `refresh_tokens`). `PermissionsGuard` reads `@RequirePermissions(...)`
metadata and checks the caller's aggregated permission codes (union across all held roles); `SUPER_ADMIN`
holds a single `platform:manage` permission that short-circuits every check. `user_area_access` scopes a
user (typically a Plot/Garden Supervisor) to specific `farm_areas` — enforced at the query layer in the
services that read/write scoped data.

## Database

PostgreSQL via Prisma (`apps/api/prisma/schema.prisma`) — see `erd.md`. The schema models every entity
from spec §12 (~65 tables) in one migration so later phases attach modules to an already-correct shape
instead of reworking it; only the Milestone 1 subset has a wired NestJS module + UI today.

## Object storage

MinIO in dev (S3-compatible), behind a `MediaService` that issues short-lived presigned PUT URLs — the
client uploads the photo/video directly to the bucket, then registers a `MediaFile` row. Swapping to
real S3/DigitalOcean Spaces in production is an env-var change only.

## Frontend

Next.js App Router, a single authenticated shell (`app/(app)/layout.tsx`) with permission-filtered nav,
TanStack Query for all server state, React Hook Form + the shared Zod schemas for forms. Leaflet renders
the farm map from `boundary` GeoJSON stored as a plain `Json` column — PostGIS is deferred to Phase 3
(see `erd.md`), so this works unchanged when that migration lands. The app is installable as a PWA
(`public/manifest.json`); a first offline slice (IndexedDB-queued task progress updates) is scoped for
Phase 2 per the spec's own phasing.

## What's out of scope for Milestone 1

Everything in spec §5.5–§5.18 beyond a lightweight crop/crop-cycle model — the Prisma schema for
inventory, procurement, machinery, harvest, dairy, processing, R&D, expenses, and inspections already
exists (see `erd.md`) and is unused by any controller yet. The nav (`page-map.md`) surfaces every one of
those screens today with an honest "Phase 2/3" placeholder rather than a 404, so the information
architecture is complete even though the modules aren't built.
