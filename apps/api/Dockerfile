FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter @fms/api...

FROM base AS build
COPY --from=deps /repo/pnpm-workspace.yaml /repo/package.json ./
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY packages/shared packages/shared
COPY apps/api apps/api
WORKDIR /repo/apps/api
# `prisma generate` only reads the schema (no DB connection), but Prisma still requires
# DATABASE_URL to resolve to a non-empty string — the placeholder is never actually connected to.
ARG DATABASE_URL="postgresql://user:password@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm prisma generate
RUN pnpm build

FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
WORKDIR /repo/apps/api
EXPOSE 4000
CMD ["node", "dist/src/main.js"]
