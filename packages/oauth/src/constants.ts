/** Default provider id used on both the config and the client. */
export const TERNETIN_PROVIDER_ID = 'ternetin'

/** Default auth host. Override via the `authUrl` option for staging/self-host. */
export const TERNETIN_AUTH_URL = 'https://auth.ter.net.in'

export const DEFAULT_SCOPES = ['openid', 'profile', 'email'] as const

/** OIDC discovery document URL for a given auth host. */
export function discoveryUrl(authUrl: string = TERNETIN_AUTH_URL): string {
  return `${authUrl.replace(/\/+$/, '')}/api/auth/.well-known/openid-configuration`
}
