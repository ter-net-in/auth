'use client'

import { authClient } from '@ternetin/auth/client'
import { useState } from 'react'
import { Alert } from '@/ui/alert'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

const SCOPE_LABELS: Record<string, string> = {
  openid: 'Verify your identity',
  profile: 'See your name and profile',
  email: 'See your email address',
  offline_access: 'Stay signed in'
}

export function ConsentForm({ clientName, scopes }: { clientName: string; scopes: string[] }) {
  const [pending, setPending] = useState<null | 'accept' | 'deny'>(null)
  const [error, setError] = useState<string | null>(null)

  async function decide(accept: boolean) {
    setPending(accept ? 'accept' : 'deny')
    setError(null)
    const { data, error } = await authClient.oauth2.consent({ accept })
    if (error) {
      setError(error.message ?? 'Consent failed.')
      setPending(null)
      return
    }
    const url =
      (data as { redirectURI?: string; url?: string } | null)?.redirectURI ??
      (data as { redirectURI?: string; url?: string } | null)?.url
    window.location.assign(url ?? '/dashboard')
  }

  return (
    <Card className="w-full max-w-md" padding="lg">
      <CardHeader>
        <CardTitle role="heading" aria-level={1}>
          Authorize {clientName}
        </CardTitle>
        <CardDescription>{clientName} wants to access your ter.net.in account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1 text-sm">
          {scopes.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <svg
                viewBox="0 0 16 16"
                className="size-4 shrink-0 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="m4 8 3 3 5-6" />
              </svg>
              {SCOPE_LABELS[s] ?? s}
            </li>
          ))}
        </ul>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={pending !== null} onClick={() => decide(false)}>
            {pending === 'deny' ? 'Denying…' : 'Deny'}
          </Button>
          <Button className="flex-1" disabled={pending !== null} onClick={() => decide(true)}>
            {pending === 'accept' ? 'Authorizing…' : 'Allow'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
