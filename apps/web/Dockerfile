FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @fms/web...

FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY packages/shared packages/shared
COPY apps/web apps/web
WORKDIR /repo/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /repo/apps/web
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /repo/apps/web/public ./public
COPY --from=build /repo/apps/web/.next ./.next
COPY --from=build /repo/apps/web/node_modules ./node_modules
COPY --from=build /repo/apps/web/package.json ./package.json
EXPOSE 3000
CMD ["pnpm", "start"]
