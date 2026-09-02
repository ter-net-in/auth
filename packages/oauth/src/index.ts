import type { BetterAuthPlugin } from 'better-auth'
import { genericOAuth } from 'better-auth/plugins'
import { DEFAULT_SCOPES, discoveryUrl, TERNETIN_PROVIDER_ID } from './constants.js'

export { DEFAULT_SCOPES, discoveryUrl, TERNETIN_AUTH_URL, TERNETIN_PROVIDER_ID } from './constants.js'

export interface TernetinOptions {
  /** OAuth client id issued by auth.ter.net.in (register-client script). */
  clientId: string
  /** OAuth client secret. Keep server-side. */
  clientSecret: string
  /** Override the auth host. Default: https://auth.ter.net.in */
  authUrl?: string
  /** OAuth scopes. Default: openid, profile, email */
  scopes?: string[]
  /** Provider id used to reference this connection. Default: "ternetin" */
  providerId?: string
}

/**
 * Better Auth server plugin that connects an app to auth.ter.net.in as an OIDC
 * provider — plug-and-play. Drop it into `plugins` and you get a `ternetin` OAuth2
 * provider wired to the discovery document, PKCE on.
 *
 * ```ts
 * import { betterAuth } from 'better-auth'
 * import { ternetin } from '@ternetin/oauth'
 *
 * export const auth = betterAuth({
 *   plugins: [ternetin({ clientId: process.env.TERNETIN_CLIENT_ID!, clientSecret: process.env.TERNETIN_CLIENT_SECRET! })]
 * })
 * ```
 */
export function ternetin(options: TernetinOptions): BetterAuthPlugin {
  return genericOAuth({
    config: [
      {
        providerId: options.providerId ?? TERNETIN_PROVIDER_ID,
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        discoveryUrl: discoveryUrl(options.authUrl),
        scopes: options.scopes ?? [...DEFAULT_SCOPES],
        pkce: true
      }
    ]
  })
}
