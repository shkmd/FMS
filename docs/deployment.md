# Deployment

## Local development

```bash
corepack enable
pnpm install
cp .env.example .env         # adjust DATABASE_URL if you don't use the bundled Postgres port (55432)
pnpm db:up                   # docker compose: postgres, redis, minio
pnpm --filter @fms/api prisma:generate
pnpm --filter @fms/api prisma:migrate     # applies migrations to $DATABASE_URL
pnpm --filter @fms/api prisma:seed
pnpm dev                     # turbo: api on :4000, web on :3000
```

API docs: `http://localhost:4000/api/docs`. Demo login: any seeded email (see `prisma/seed.ts` output),
password `Demo@1234`.

> This machine already runs a native Postgres service on the default port 5432, so the dev compose file
> publishes the containerized Postgres on **55432** instead — `.env.example` reflects that. If you're on
> a clean machine you can safely change it back to `5432:5432` in `infra/docker-compose.yml`.

## Running tests

```bash
pnpm --filter @fms/api test               # unit tests (state machine, overlap guard, etc.)

# e2e tests run against a dedicated fms_test database (created automatically by infra/init-test-db.sql)
DATABASE_URL=$TEST_DATABASE_URL pnpm --filter @fms/api exec prisma migrate deploy
pnpm --filter @fms/api test:e2e
```

## Production

`apps/api/Dockerfile` and `apps/web/Dockerfile` are multi-stage builds producing minimal runtime images.
`infra/docker-compose.prod.yml` + `infra/nginx.conf` show a reference single-host composition (API,
web, nginx reverse proxy) — point it at managed Postgres/Redis/S3 rather than the dev containers.

1. Provision managed Postgres (with a read replica once traffic justifies it), Redis, and S3-compatible
   storage (AWS/DigitalOcean/etc., per spec §11).
2. Set real secrets for `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, and the S3/DB/Redis URLs, in your
   platform's secret manager — never commit them.
3. `docker build -f apps/api/Dockerfile .` / `docker build -f apps/web/Dockerfile .`, push to your
   registry, deploy via `infra/docker-compose.prod.yml` or your platform's equivalent (ECS, DO App
   Platform, etc.).
4. Run `prisma migrate deploy` (not `migrate dev`) against the production database as a release step.
5. Point DNS/nginx TLS termination at the stack; set `API_CORS_ORIGIN` and `NEXT_PUBLIC_API_URL` to the
   real domains.
6. Wire automated Postgres backups (point-in-time recovery) and an error/log aggregator (Sentry +
   hosted logs, or your platform's built-in equivalent) — not included here since they're
   account/vendor-specific.

## CI

`.github/workflows/ci.yml` runs lint, typecheck, unit tests, and a Postgres-backed e2e job on every push
once this repo has a GitHub remote — it does nothing until you `git push` to one.
