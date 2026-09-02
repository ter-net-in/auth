'use client'

import { oauthProviderClient } from '@better-auth/oauth-provider/client'
import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  // Same-origin on auth.ter.net.in (login page). Other subdomains set
  // NEXT_PUBLIC_AUTH_URL=https://auth.ter.net.in to point their client here.
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || undefined,
  plugins: [adminClient(), oauthProviderClient()]
})

export const { signIn, signUp, signOut, useSession } = authClient
