import { oauthProvider } from '@better-auth/oauth-provider'
import { env } from '@ternetin/config'
import { db, schema } from '@ternetin/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { admin, jwt } from 'better-auth/plugins'
import { consumeInvite, findPendingInvite, isBootstrapAdmin } from './invitations.js'

// First-party ter.net.in apps registered as OAuth clients get consent auto-skipped.
const trustedClientIds = new Set(env.TRUSTED_OAUTH_CLIENT_IDS)

export const auth = betterAuth({
  appName: 'ter.net.in',
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  // Origins allowed to initiate/return from auth. Wildcard covers every subdomain.
  trustedOrigins: [env.BETTER_AUTH_URL, ...env.TRUSTED_ORIGINS],
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    // Public sign-up stays on so invited users can self-serve, but the
    // databaseHook below rejects anyone without a valid invitation.
    disableSignUp: false,
    minPasswordLength: 8,
    autoSignIn: true
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 }
  },
  advanced: {
    // One session cookie shared across every *.ter.net.in subdomain.
    crossSubDomainCookies: env.COOKIE_DOMAIN ? { enabled: true, domain: env.COOKIE_DOMAIN } : { enabled: false }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const email = newUser.email.toLowerCase()
          const bootstrap = isBootstrapAdmin(email)
          const invite = bootstrap ? undefined : await findPendingInvite(email)

          if (!bootstrap && !invite) {
            throw new APIError('FORBIDDEN', {
              message: 'auth.ter.net.in is invite only — no valid invitation for this email.'
            })
          }

          return { data: { ...newUser, role: bootstrap ? 'admin' : (invite?.role ?? 'member') } }
        },
        after: async (createdUser) => {
          await consumeInvite(createdUser.email, createdUser.id)
        }
      }
    }
  },
  plugins: [
    admin(),
    // Asymmetric signing keys (JWKS) for the OIDC provider's ID tokens. Must be
    // registered before oauthProvider, which looks it up.
    jwt(),
    // auth.ter.net.in as an OAuth 2.1 / OIDC provider for other Better Auth apps.
    // Discovery: {BETTER_AUTH_URL}/api/auth/.well-known/openid-configuration
    oauthProvider({
      loginPage: '/login',
      consentPage: '/oauth/consent',
      cachedTrustedClients: trustedClientIds
    }),
    nextCookies() // nextCookies must stay last
  ]
})

export type Session = typeof auth.$Infer.Session
export {
  createInvitation,
  getInvitationByToken,
  type Invitation,
  inviteAcceptUrl,
  listInvitations
} from './invitations.js'
