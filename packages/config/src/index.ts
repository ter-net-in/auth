import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { config as loadEnv } from 'dotenv'

// Monorepo: walk up from the current cwd to load the nearest .env (repo root),
// so every app/package sees the same environment regardless of where it runs.
let dir = process.cwd()
for (;;) {
  const candidate = join(dir, '.env')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
  const up = dirname(dir)
  if (up === dir) break
  dir = up
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined
}

function list(name: string): string[] {
  return (process.env[name] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
  BETTER_AUTH_URL: required('BETTER_AUTH_URL'),
  /** Parent domain for the shared session cookie, e.g. `.ter.net.in`. Empty = host-only cookie (dev). */
  COOKIE_DOMAIN: optional('COOKIE_DOMAIN'),
  /** Extra origins allowed to call the auth server, e.g. `https://*.ter.net.in`. */
  TRUSTED_ORIGINS: list('TRUSTED_ORIGINS'),
  /** Emails that may sign up without an invite (bootstrap admins); also elevated to `admin`. */
  ADMIN_EMAILS: list('ADMIN_EMAILS').map((e) => e.toLowerCase()),
  /** OAuth client IDs (first-party ter.net.in apps) that skip the consent screen. */
  TRUSTED_OAUTH_CLIENT_IDS: list('TRUSTED_OAUTH_CLIENT_IDS')
} as const
