import { auth, listInvitations } from '@ternetin/auth'
import { listOAuthClients } from '@ternetin/auth/oauth-clients'
import { countUsers } from '@ternetin/db'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { InviteManager } from '@/components/invite-manager'
import { OAuthClientManager } from '@/components/oauth-client-manager'
import { Button } from '@/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { signOutAction } from '../actions'

function StatTile({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <Card corners="diagonal" cornerTone="split" padding="md" className="gap-1">
      <span className={`text-4xl font-bold tabular-nums leading-none ${accent ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
    </Card>
  )
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login?redirect=/dashboard')

  const role = (session.user as { role?: string }).role ?? 'member'
  const isAdmin = role === 'admin'

  const [invites, oauthClients, memberCount] = isAdmin
    ? await Promise.all([listInvitations(), listOAuthClients(), countUsers()])
    : [[], [], 0]

  const now = Date.now()
  const pending = invites.filter((i) => !i.acceptedAt && i.expiresAt.getTime() >= now).length
  const activeClients = oauthClients.filter((c) => !c.disabled).length

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-10 p-6 md:p-10">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold uppercase tracking-tighter md:text-4xl">auth.ter.net.in</h1>
          <p className="text-sm text-muted-foreground">Admin console</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.email}</span>
          <span className="border border-border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            {role}
          </span>
          <form
            action={async () => {
              'use server'
              await signOutAction()
              redirect('/login')
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      {/* Accent rule */}
      <div className="h-1 w-full bg-primary" />

      {isAdmin ? (
        <>
          {/* Stats */}
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatTile label="Members" value={memberCount} accent />
            <StatTile label="Pending invites" value={pending} />
            <StatTile label="OAuth apps" value={activeClients} />
          </section>

          {/* Two-column workspace */}
          <section className="grid items-start gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <InviteManager />
              <Card corners="diagonal" cornerTone="split" padding="lg" className={`w-full`}>
                <CardHeader>
                  <CardTitle>Invitations</CardTitle>
                  <CardDescription>
                    {invites.length} total · {pending} pending
                  </CardDescription>
                </CardHeader>
                <ul className="flex flex-col text-sm">
                  {invites.map((i) => {
                    const status = i.acceptedAt ? 'accepted' : i.expiresAt.getTime() < now ? 'expired' : 'pending'
                    return (
                      <li
                        key={i.id}
                        className="flex items-center justify-between gap-2 border-b border-border py-2 last:border-0"
                      >
                        <span className="truncate">{i.email}</span>
                        <span
                          className={`shrink-0 text-xs font-semibold uppercase tracking-[0.12em] ${
                            status === 'accepted'
                              ? 'text-primary'
                              : status === 'expired'
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {status}
                        </span>
                      </li>
                    )
                  })}
                  {invites.length === 0 ? <li className="py-2 text-muted-foreground">No invitations yet.</li> : null}
                </ul>
              </Card>
            </div>

            <OAuthClientManager clients={oauthClients} />
          </section>
        </>
      ) : (
        <Card corners="all" cornerTone="split" padding="lg" className={`mx-auto w-full max-w-md`}>
          <CardHeader>
            <CardTitle>You're in</CardTitle>
            <CardDescription>Your ter.net.in session is active across every subdomain.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  )
}
