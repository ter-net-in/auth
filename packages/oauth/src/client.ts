import type { BetterAuthClientPlugin } from 'better-auth/client'
import type { genericOAuth } from 'better-auth/plugins'
import { TERNETIN_PROVIDER_ID } from './constants.js'

export { TERNETIN_PROVIDER_ID } from './constants.js'

/**
 * Better Auth client plugin — pair with {@link ternetin} on the server. It infers the
 * generic-oauth server actions (`signIn.oauth2`, ...) onto the client.
 *
 * ```ts
 * import { createAuthClient } from 'better-auth/react'
 * import { ternetinClient } from '@ternetin/oauth/client'
 *
 * export const authClient = createAuthClient({ plugins: [ternetinClient()] })
 * ```
 */
export function ternetinClient() {
  return {
    id: 'ternetin-oauth',
    $InferServerPlugin: {} as ReturnType<typeof genericOAuth>
  } satisfies BetterAuthClientPlugin
}

/** Minimal shape of the client's OAuth2 sign-in call. */
type OAuth2SignIn = {
  signIn: {
    oauth2: (opts: {
      providerId: string
      callbackURL?: string
      errorCallbackURL?: string
      newUserCallbackURL?: string
      disableRedirect?: boolean
    }) => Promise<unknown>
  }
}

/**
 * Start the sign-in flow through auth.ter.net.in.
 *
 * ```ts
 * signInWithTernetin(authClient, { callbackURL: '/dashboard' })
 * ```
 */
export function signInWithTernetin<T extends OAuth2SignIn>(
  authClient: T,
  opts: { callbackURL?: string; errorCallbackURL?: string; newUserCallbackURL?: string; providerId?: string } = {}
) {
  const { providerId, ...rest } = opts
  return authClient.signIn.oauth2({ providerId: providerId ?? TERNETIN_PROVIDER_ID, ...rest })
}
