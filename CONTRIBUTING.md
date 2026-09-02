# Contributing

## Workflow

- `main` is protected and always deployable. **No direct pushes** — open a PR.
- Branch per change: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
- CI (lint · typecheck · migrate · build) must be green before merge.
- Merging to `main` triggers the deploy workflow.

## Commits — [Conventional Commits](https://www.conventionalcommits.org)

```
<type>(<scope>): <summary>

<body>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `build`.
Scopes: `auth`, `db`, `web`, `oauth`, `config`, `ci`, … Example:

```
feat(oauth): add @ternetin/oauth plug-and-play client
fix(db): add missing account.issuer column
```

## Local checks (run before pushing)

```bash
bun install
bun run lint        # biome — or `bun run lint:fix`
bun run typecheck
bun run build
```

## Database changes

1. Edit the Drizzle schema (`packages/db/src/*.ts`). Better-Auth tables live in
   `auth-schema.ts` — regenerate with `bunx @better-auth/cli generate` after
   changing the auth config; keep hand-owned tables (e.g. `invitation`) in
   `schema.ts`.
2. `bun run db:generate` to create a migration, and **commit** the new
   `packages/db/drizzle/*.sql` file.
3. CI applies migrations against a fresh Postgres to verify them.
