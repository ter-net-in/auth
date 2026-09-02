# @ternetin/oauth

Plug-and-play [Better Auth](https://better-auth.com) plugin to sign in through
**auth.ter.net.in** (OIDC). Wraps `genericOAuth` with the discovery URL, provider
id, scopes and PKCE preset.

```bash
npm i @ternetin/oauth better-auth
```

## 1. Register a client (once, on the auth host)

```bash
bun packages/auth/src/register-client.ts "My App" https://myapp.com/api/auth/oauth2/callback/ternetin
```

Copy the printed `client_id` / `client_secret` into the consumer's env.

## 2. Server

```ts
import { betterAuth } from 'better-auth'
import { ternetin } from '@ternetin/oauth'

export const auth = betterAuth({
  plugins: [
    ternetin({
      clientId: process.env.TERNETIN_CLIENT_ID!,
      clientSecret: process.env.TERNETIN_CLIENT_SECRET!
      // authUrl, scopes, providerId all optional
    })
  ]
})
```

## 3. Client

```ts
import { createAuthClient } from 'better-auth/react'
import { ternetinClient, signInWithTernetin } from '@ternetin/oauth/client'

export const authClient = createAuthClient({ plugins: [ternetinClient()] })

// a "Sign in with ter.net.in" button:
signInWithTernetin(authClient, { callbackURL: '/dashboard' })
```

That's it — the callback route `/api/auth/oauth2/callback/ternetin` is handled by
Better Auth's generic OAuth. Users must be invited on the auth host (invite-only).

## Options

| option         | default                     | note                                   |
| -------------- | --------------------------- | -------------------------------------- |
| `clientId`     | —                           | required                               |
| `clientSecret` | —                           | required, server-side                  |
| `authUrl`      | `https://auth.ter.net.in`   | override for staging / self-host       |
| `scopes`       | `openid profile email`      |                                        |
| `providerId`   | `ternetin`                    | id used by `signIn.oauth2`             |
