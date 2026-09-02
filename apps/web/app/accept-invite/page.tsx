import { getInvitationByToken } from '@ternetin/auth'
import Link from 'next/link'
import { AcceptInviteForm } from '@/components/accept-invite-form'
import { Button } from '@/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'

export default async function AcceptInvitePage({
  searchParams
}: {
  searchParams: Promise<{ token?: string; redirect?: string }>
}) {
  const { token, redirect: redirectTo } = await searchParams
  const invite = token ? await getInvitationByToken(token) : undefined

  const invalid = !invite || invite.acceptedAt !== null || invite.expiresAt.getTime() < Date.now()

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      {invalid ? (
        <Card corners="diagonal" className="w-full max-w-sm" padding="lg">
          <CardHeader>
            <CardTitle>Invite unavailable</CardTitle>
            <CardDescription>
              This invitation is invalid, already used, or expired. Ask an admin for a new one.
            </CardDescription>
          </CardHeader>
          <Button render={<Link href="/login" />} variant="outline" className="w-full">
            Back to sign in
          </Button>
        </Card>
      ) : (
        <AcceptInviteForm email={invite.email} redirectTo={redirectTo} />
      )}
    </main>
  )
}
