# authkit — auth.ter.net.in

Better Auth AuthKit for the ter.net.in network. One account, shared across every
`*.ter.net.in` subdomain. **Invite only.**

Generated with `create-internet-app`, then wired as a central identity gateway.

## What it is

- **`apps/web`** (Next.js) — the public page at `auth.ter.net.in`: sign-in, invite
  acceptance, and an admin dashboard. Hosts the Better Auth handler at
  `/api/auth/*`. UI built from [`@ternetin/ui`](https://ui.ter.net.in) (Base UI +
  Tailwind v4).
- **`packages/auth`** — the Better Auth server (`auth`), the browser client
  (`@ternetin/auth/client`), and the invitation logic.
- **`packages/db`** — Postgres + Drizzle. Better Auth core tables + an
  `invitation` table.
- **`packages/config`** — env loader (walks up to the repo-root `.env`).

## How the redirect / SSO works

Everything is a subdomain of `ter.net.in`, so a single session cookie scoped to
`.ter.net.in` is shared by all of them (`advanced.crossSubDomainCookies`).

1. On `ter.net.in`, the "log in" button links to:
   `https://auth.ter.net.in/login?redirect=https://ter.net.in/dashboard`
2. The user signs in on `auth.ter.net.in` (this project's public page).
3. Better Auth sets the session cookie on `.ter.net.in`.
4. We redirect back to the `redirect` target (validated against `.ter.net.in` —
   see `apps/web/src/lib/redirect.ts`, an open-redirect guard).
5. `ter.net.in` now reads the shared cookie — the user is signed in everywhere.

Other subdomain apps point their Better Auth client here with
`NEXT_PUBLIC_AUTH_URL=https://auth.ter.net.in`.

## Invite only

Public sign-up is open at the API level but gated by a database hook
(`packages/auth/src/index.ts`): a user can only be created if a **pending,
unexpired invitation** exists for their email — otherwise `403`.

- Admins create invites from `/dashboard` → get a one-time `/accept-invite?token=…`
  link (share it however you send links).
- **Bootstrap:** set `ADMIN_EMAILS=you@ter.net.in` in `.env`. Those emails may
  sign up without an invite and are made `role=admin`. Sign up once, then invite
  everyone else from the dashboard.

## OAuth / OIDC provider

`auth.ter.net.in` is also a full **OAuth 2.1 / OIDC provider** (via
`@better-auth/oauth-provider` + the `jwt` plugin), so other Better Auth apps can
sign in *through* it. Discovery is live at:

```
https://auth.ter.net.in/api/auth/.well-known/openid-configuration
```

Endpoints: `/oauth2/authorize`, `/oauth2/token`, `/oauth2/userinfo`, `/jwks`
(EdDSA), `/oauth2/introspect`, `/oauth2/revoke`. Consent screen at `/oauth/consent`;
login at `/login`.

### Register a client

```bash
bun packages/auth/src/register-client.ts "App name" https://app.ter.net.in/api/auth/oauth2/callback/ternetin
```

Prints `client_id` / `client_secret` once. First-party clients are created with
`skipConsent`; add their `client_id` to `TRUSTED_OAUTH_CLIENT_IDS` in `.env`.

### Consume it from another Better Auth app

**Plug-and-play:** use the `@ternetin/oauth` package (in `packages/oauth`) — it presets
the discovery URL, provider id, scopes and PKCE:

```ts
import { betterAuth } from 'better-auth'
import { ternetin } from '@ternetin/oauth'

export const auth = betterAuth({
  plugins: [ternetin({ clientId: process.env.TERNETIN_CLIENT_ID!, clientSecret: process.env.TERNETIN_CLIENT_SECRET! })]
})
// client: import { ternetinClient, signInWithTernetin } from '@ternetin/oauth/client'
```

Or wire `genericOAuth` by hand:

```ts
import { betterAuth } from 'better-auth'
import { genericOAuth } from 'better-auth/plugins'

export const auth = betterAuth({
  plugins: [
    genericOAuth({
      config: [{
        providerId: 'ternetin',
        clientId: process.env.TERNETIN_CLIENT_ID!,
        clientSecret: process.env.TERNETIN_CLIENT_SECRET!,
        discoveryUrl: 'https://auth.ter.net.in/api/auth/.well-known/openid-configuration',
        scopes: ['openid', 'profile', 'email']
      }]
    })
  ]
})
// client:  authClient.signIn.oauth2({ providerId: 'ternetin', callbackURL: '/dashboard' })
```

Note: for plain `*.ter.net.in` subdomains you usually don't need OAuth at all —
the shared cookie already signs them in. Use this OIDC flow for apps that want
their own sessions/tokens, off-domain apps, or third parties.

## Run it

```bash
bun install
docker compose up -d            # Postgres
bun run db:migrate              # apply the generated migration
# set ADMIN_EMAILS in .env to your email
bun run dev:web                 # http://localhost:3000
```

Then open `http://localhost:3000`, sign up as the bootstrap admin, and invite from
`/dashboard`.

### Production env (`.env.example`)

| var                | value                                        |
| ------------------ | -------------------------------------------- |
| `BETTER_AUTH_URL`  | `https://auth.ter.net.in`                    |
| `COOKIE_DOMAIN`    | `.ter.net.in`                                |
| `TRUSTED_ORIGINS`  | `https://ter.net.in,https://*.ter.net.in`    |
| `ADMIN_EMAILS`     | comma-separated bootstrap admin emails       |
