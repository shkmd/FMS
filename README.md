# Athachi Farms — Farm Management System

Centralized, role-based operations system for Athachi Farms (~20 acres, organic), replacing WhatsApp +
paper registers + scattered Excel files as the farm's system of record.

Full context, architecture, and phasing:

- [docs/architecture.md](docs/architecture.md) — system design, layering, stack rationale
- [docs/erd.md](docs/erd.md) — full database schema (all ~65 entities, grouped by module)
- [docs/permission-matrix.md](docs/permission-matrix.md) — role → permission matrix
- [docs/page-map.md](docs/page-map.md) — navigation, screen-by-screen build status
- [docs/mvp-plan.md](docs/mvp-plan.md) — MVP/Phase 2/Phase 3 scope and acceptance criteria
- [docs/deployment.md](docs/deployment.md) — local dev setup, testing, production deployment

## What's built (Milestone 1)

Authentication & RBAC, farm/plot/sub-plot structure with a live map, daily task planning with a full
approval → assignment → progress → verification lifecycle, priority-based labour allocation with a
server-enforced no-double-booking guard, authorized worker reassignment (pause/transfer + full audit
trail), attendance, lightweight crop-cycle tracking with an out-of-season sowing guard, photo/video
evidence linked to tasks, role-scoped dashboards, and an audit log viewer. See
[docs/mvp-plan.md](docs/mvp-plan.md) for the full acceptance-criteria mapping.

## Quick start

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm db:up
pnpm --filter @fms/api prisma:generate
pnpm --filter @fms/api prisma:migrate
pnpm --filter @fms/api prisma:seed
pnpm dev
```

- Web: http://localhost:3000
- API + Swagger: http://localhost:4000/api/docs
- Demo login: any seeded email (printed by the seed script), password `Demo@1234`

See [docs/deployment.md](docs/deployment.md) for tests and production deployment.

## Monorepo layout

```
apps/api       NestJS REST API (Prisma/PostgreSQL, business logic, scheduled jobs)
apps/web       Next.js 14 frontend (PWA, Tailwind, TanStack Query, Leaflet)
packages/shared  Shared enums, permission codes, Zod schemas
infra          Docker Compose (dev + prod reference), nginx config
docs           Architecture, ERD, permission matrix, page map, MVP plan, deployment guide
```
