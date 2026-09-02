import { auth } from '@ternetin/auth'
import { getOAuthClientName } from '@ternetin/auth/oauth-clients'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ConsentForm } from '@/components/consent-form'

export default async function ConsentPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const session = await auth.api.getSession({ headers: await headers() })

  // Preserve the OAuth params across the login round-trip.
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) if (typeof v === 'string') qs.set(k, v)
  if (!session) redirect(`/login?redirect=${encodeURIComponent(`/oauth/consent?${qs.toString()}`)}`)

  const clientId = typeof sp.client_id === 'string' ? sp.client_id : ''
  const scopes = (typeof sp.scope === 'string' ? sp.scope : '').split(' ').filter(Boolean)
  const clientName = (clientId ? await getOAuthClientName(clientId) : null) ?? 'An application'

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <ConsentForm clientName={clientName} scopes={scopes} />
    </main>
  )
}
