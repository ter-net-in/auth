import { auth, listInvitations } from '@ternetin/auth'
import { listOAuthClients } from '@ternetin/auth/oauth-clients'
import { countUsers } from '@ternetin/db'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { InviteManager } from '@/components/invite-manager'
import { OAuthClientManager } from '@/components/oauth-client-manager'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageActions, PageContainer, PageDescription, PageHeader, PageTitle } from '@/ui/page-layout'
import { Stat } from '@/ui/stat'
import { signOutAction } from '../actions'

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
    <main>
      <PageContainer>
        {/* Header */}
        <PageHeader>
          <div className="flex flex-col gap-1">
            <PageTitle>auth.ter.net.in</PageTitle>
            <PageDescription>Admin console</PageDescription>
          </div>
          <PageActions>
            <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.email}</span>
            <Badge tone={isAdmin ? 'info' : 'neutral'}>{role}</Badge>
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
          </PageActions>
        </PageHeader>

        {isAdmin ? (
          <>
            {/* Stats */}
            <section className="grid gap-4 sm:grid-cols-3">
              <Stat label="Members" value={memberCount} />
              <Stat label="Pending invites" value={pending} />
              <Stat label="OAuth apps" value={activeClients} />
            </section>

            {/* Two-column workspace */}
            <section className="grid items-start gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-6">
                <InviteManager />
                <Card padding="lg" className={`w-full`}>
                  <CardHeader>
                    <CardTitle role="heading" aria-level={2}>
                      Invitations
                    </CardTitle>
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
                          <Badge tone={status === 'accepted' ? 'success' : status === 'expired' ? 'danger' : 'warning'}>
                            {status}
                          </Badge>
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
          <Card padding="lg" className={`mx-auto w-full max-w-md`}>
            <CardHeader>
              <CardTitle role="heading" aria-level={2}>
                You're in
              </CardTitle>
              <CardDescription>Your ter.net.in session is active across every subdomain.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </PageContainer>
    </main>
  )
}
