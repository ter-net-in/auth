import { randomBytes, randomUUID } from 'node:crypto'
import { db, schema } from '@ternetin/db'
import { desc, eq } from 'drizzle-orm'

export type RegisteredClient = { clientId: string; clientSecret: string }

/**
 * Register a first-party ter.net.in app as an OAuth client. First-party clients
 * skip the consent screen (`skipConsent`). The secret is returned once — store it
 * in the consuming app's env; it is not shown again.
 */
export async function registerFirstPartyClient(input: {
  name: string
  redirectUris: string[]
  scopes?: string[]
  skipConsent?: boolean
}): Promise<RegisteredClient> {
  const clientId = randomUUID()
  const clientSecret = randomBytes(32).toString('base64url')
  const now = new Date()

  await db.insert(schema.oauthClient).values({
    id: randomUUID(),
    clientId,
    clientSecret,
    name: input.name,
    redirectUris: input.redirectUris,
    postLogoutRedirectUris: input.redirectUris,
    scopes: input.scopes ?? ['openid', 'profile', 'email'],
    grantTypes: ['authorization_code', 'refresh_token'],
    responseTypes: ['code'],
    // Better Auth's genericOAuth consumer sends the secret in the body.
    tokenEndpointAuthMethod: 'client_secret_post',
    requirePKCE: true,
    skipConsent: input.skipConsent ?? true,
    disabled: false,
    createdAt: now,
    updatedAt: now
  })

  return { clientId, clientSecret }
}

/** Display name for a client id, for the consent screen. */
export async function getOAuthClientName(clientId: string): Promise<string | null> {
  const [row] = await db
    .select({ name: schema.oauthClient.name })
    .from(schema.oauthClient)
    .where(eq(schema.oauthClient.clientId, clientId))
    .limit(1)
  return row?.name ?? null
}

export async function listOAuthClients() {
  return db
    .select({
      clientId: schema.oauthClient.clientId,
      name: schema.oauthClient.name,
      redirectUris: schema.oauthClient.redirectUris,
      disabled: schema.oauthClient.disabled,
      createdAt: schema.oauthClient.createdAt
    })
    .from(schema.oauthClient)
    .orderBy(desc(schema.oauthClient.createdAt))
    .limit(100)
}

export async function disableOAuthClient(clientId: string) {
  await db.update(schema.oauthClient).set({ disabled: true }).where(eq(schema.oauthClient.clientId, clientId))
}
