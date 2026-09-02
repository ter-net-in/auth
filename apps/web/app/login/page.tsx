import { auth } from '@ternetin/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/login-form'
import { safeRedirect } from '@/lib/redirect'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect: redirectTo } = await searchParams
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect(safeRedirect(redirectTo))

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <LoginForm redirectTo={redirectTo} />
    </main>
  )
}
