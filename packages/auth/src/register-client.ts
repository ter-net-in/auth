/**
 * Register a first-party OAuth client from the CLI.
 *
 *   bun packages/auth/src/register-client.ts "App name" https://app.ter.net.in/api/auth/oauth2/callback/ternet [more redirect uris...]
 *
 * Prints the client_id / client_secret once. Put them in the consuming app's env.
 */
import { registerFirstPartyClient } from './oauth-clients.js'

const [, , name, ...redirectUris] = process.argv

if (!name || redirectUris.length === 0) {
  console.error('Usage: bun register-client.ts "<name>" <redirectUri> [redirectUri...]')
  process.exit(1)
}

const { clientId, clientSecret } = await registerFirstPartyClient({ name, redirectUris })

console.log('\nRegistered OAuth client (store the secret now — it is not shown again):\n')
console.log(`  client_id:     ${clientId}`)
console.log(`  client_secret: ${clientSecret}`)
console.log(`  redirect_uris: ${redirectUris.join(', ')}\n`)
console.log('Add the client_id to TRUSTED_OAUTH_CLIENT_IDS in .env to skip consent for it.\n')
process.exit(0)
