# Production image for the @ternetin/web (auth.ter.net.in) Next.js app.
FROM oven/bun:1.3.13 AS build
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

# Build the web app
COPY . .
RUN bun run --filter '@ternetin/web' build

FROM oven/bun:1.3.13 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000

# Serve (internal port 3000). Migrations run as a separate deploy step, not here,
# so a container restart never races the DB. DATABASE_URL etc. come from env_file.
CMD ["sh", "-c", "bun --filter '@ternetin/web' start"]
