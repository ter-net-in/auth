# Next.js runs on Node in CI and production; Bun retains its package/service roles.
# Production image for the @ternetin/web (auth.ter.net.in) Next.js app.
FROM oven/bun:1.3.13 AS bun
FROM node:24-bookworm-slim AS base
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun

FROM base AS build
WORKDIR /app

# Install dependencies (layer cached on lockfile + manifests)
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/oauth/package.json packages/oauth/package.json
COPY packages/protocol/package.json packages/protocol/package.json
RUN bun install --frozen-lockfile

# Build the web app.
# next build imports the config/db packages, which validate these at load time.
# Build-only placeholders — no DB connection happens at build, and the runtime
# stage below gets the real values from the env_file. Not secrets.
ENV DATABASE_URL=postgres://build:build@localhost:5432/build \
    BETTER_AUTH_SECRET=build-time-placeholder-not-used-at-runtime \
    BETTER_AUTH_URL=http://localhost:3000
COPY . .
RUN node apps/web/node_modules/next/dist/bin/next build apps/web

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000

# Serve (internal port 3000). Migrations run as a separate deploy step, not here,
# so a container restart never races the DB. DATABASE_URL etc. come from env_file.
CMD ["node", "apps/web/node_modules/next/dist/bin/next", "start", "apps/web", "-p", "3000"]
