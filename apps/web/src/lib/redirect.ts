/** The parent domain every subdomain (auth., app., ...) hangs off of. */
export const ROOT_DOMAIN = 'ter.net.in'

/**
 * Only allow post-login redirects back to our own domain (any subdomain) or
 * localhost. Anything else falls back to the dashboard — this is the open-redirect
 * guard for the `?redirect=` param that ter.net.in hands us.
 */
export function safeRedirect(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw) return fallback

  // Relative path (but not protocol-relative "//evil.com").
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw

  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase()
    const okProtocol = url.protocol === 'https:' || url.protocol === 'http:'
    const okHost = host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`) || host === 'localhost'
    return okProtocol && okHost ? url.toString() : fallback
  } catch {
    return fallback
  }
}
