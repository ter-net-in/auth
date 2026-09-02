import { auth } from '@ternetin/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/login-form'
import { safeRedirect } from '@/lib/redirect'

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams

  // Better Auth's OIDC provider hands off to /login carrying the whole authorize
  // request (client_id, response_type, sig, ...). After login we must resume the
  // authorize endpoint so it can mint the code — not drop the user on the dashboard.
  const isOAuthHandoff = typeof sp.client_id === 'string' && typeof sp.response_type === 'string'

  let target: string
  if (isOAuthHandoff) {
    const qs = new URLSearchParams()
    for (const [key, value] of Object.entries(sp)) {
      if (Array.isArray(value)) for (const v of value) qs.append(key, v)
      else if (typeof value === 'string') qs.append(key, value)
    }
    target = `/api/auth/oauth2/authorize?${qs.toString()}`
  } else {
    target = safeRedirect(typeof sp.redirect === 'string' ? sp.redirect : undefined)
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect(target)

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <LoginForm redirectTo={target} />
    </main>
  )
}
