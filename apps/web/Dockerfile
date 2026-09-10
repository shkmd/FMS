FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @fms/web...

FROM base AS build
COPY --from=deps /repo/pnpm-workspace.yaml /repo/package.json ./
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY packages/shared packages/shared
COPY apps/web apps/web
# @fms/shared's package.json points at ./dist, which only exists after this — apps/web imports
# the package by name, not by source path, so skipping it breaks module resolution at build time.
RUN pnpm --filter @fms/shared build
WORKDIR /repo/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so they must arrive as a
# build arg (Railway forwards configured service variables as build args automatically).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# pnpm's node_modules is a symlink farm into this root store — apps/web/node_modules alone is a
# tree of dangling symlinks without it.
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/web/node_modules ./apps/web/node_modules
COPY --from=build /repo/apps/web/public ./apps/web/public
COPY --from=build /repo/apps/web/.next ./apps/web/.next
COPY --from=build /repo/apps/web/package.json ./apps/web/package.json
WORKDIR /repo/apps/web
EXPOSE 3000
# Runs `next start` directly (no pnpm) — the runner has no pnpm-workspace.yaml, and everything
# `pnpm start` would do (resolve the script, invoke the local `next` binary) is already resolved.
CMD ./node_modules/.bin/next start -p ${PORT:-3000}
