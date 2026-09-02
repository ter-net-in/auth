import { auth } from '@ternetin/auth'
import { headers } from 'next/headers'
import Link from 'next/link'
import { AnimatedLock } from '@/components/animated-lock'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6">
      <AnimatedLock />

      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-bold uppercase tracking-tighter">auth.ter.net.in</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          One key for the whole network. Sign in once and you're through every door on{' '}
          <span className="text-foreground">ter.net.in</span> — no second password, no second login.
          By&nbsp;invitation&nbsp;only.
        </p>
      </div>

      <Card corners="diagonal" cornerTone="split" className="w-full max-w-md" padding="lg">
        {session ? (
          <>
            <CardHeader>
              <CardTitle>You're in</CardTitle>
              <CardDescription>Signed in as {session.user.email}</CardDescription>
            </CardHeader>
            <Button render={<Link href="/dashboard" />} className="w-full">
              Enter dashboard
            </Button>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Members only</CardTitle>
              <CardDescription>Sign in to continue, or open your invite link to join.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button render={<Link href="/login" />} className="w-full">
                Sign in
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Been invited? The link in your invite gets you set up.
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  )
}
