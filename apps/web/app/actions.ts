'use server'

import { auth, createInvitation, inviteAcceptUrl } from '@ternetin/auth'
import { disableOAuthClient, registerFirstPartyClient } from '@ternetin/auth/oauth-clients'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session || role !== 'admin') throw new Error('Not authorized')
  return session
}

export async function createInviteAction(
  _prev: unknown,
  formData: FormData
): Promise<{ ok: true; email: string; url: string } | { ok: false; error: string }> {
  try {
    const session = await requireAdmin()
    const email = String(formData.get('email') ?? '').trim()
    const role = String(formData.get('role') ?? 'member')
    if (!email) return { ok: false, error: 'Email required' }
    const invite = await createInvitation({ email, role, invitedBy: session.user.id })
    return { ok: true, email: invite.email, url: inviteAcceptUrl(invite.token) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' }
  }
}

export async function createOAuthClientAction(
  _prev: unknown,
  formData: FormData
): Promise<{ ok: true; name: string; clientId: string; clientSecret: string } | { ok: false; error: string }> {
  try {
    await requireAdmin()
    const name = String(formData.get('name') ?? '').trim()
    const redirectUris = String(formData.get('redirectUris') ?? '')
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    const skipConsent = formData.get('skipConsent') === 'on'
    if (!name) return { ok: false, error: 'Name required' }
    if (redirectUris.length === 0) return { ok: false, error: 'At least one redirect URI required' }
    const { clientId, clientSecret } = await registerFirstPartyClient({ name, redirectUris, skipConsent })
    revalidatePath('/dashboard')
    return { ok: true, name, clientId, clientSecret }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' }
  }
}

export async function disableOAuthClientAction(clientId: string) {
  await requireAdmin()
  await disableOAuthClient(clientId)
  revalidatePath('/dashboard')
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() })
}
