'use client'

import { useActionState, useTransition } from 'react'
import { Button } from '@/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldLabel } from '@/ui/field'
import { Input } from '@/ui/input'
import { createOAuthClientAction, disableOAuthClientAction } from '../../app/actions'

type Client = {
  clientId: string
  name: string | null
  redirectUris: string[] | null
  disabled: boolean | null
  createdAt: Date | null
}

export function OAuthClientManager({ clients }: { clients: Client[] }) {
  const [state, action, pending] = useActionState(createOAuthClientAction, null)
  const [isPending, startTransition] = useTransition()

  return (
    <Card corners="diagonal" cornerTone="split" padding="lg" className="w-full">
      <CardHeader>
        <CardTitle>Register an app</CardTitle>
        <CardDescription>An OAuth client so another site can sign in through ter.net.in.</CardDescription>
      </CardHeader>

      <form action={action} className="flex flex-col gap-4">
        <Field>
          <FieldLabel>App name</FieldLabel>
          <Input name="name" required placeholder="My Site" />
        </Field>
        <Field>
          <FieldLabel>Redirect URIs</FieldLabel>
          <textarea
            name="redirectUris"
            required
            rows={3}
            placeholder="https://mysite.com/api/auth/oauth2/callback/ternetin"
            className="flex w-full rounded-[0.5rem] border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-xs text-muted-foreground">
            One per line — usually <code>{'<origin>'}/api/auth/oauth2/callback/ternetin</code>.
          </span>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="skipConsent" defaultChecked className="size-4 accent-primary" />
          Trusted (skip the consent screen)
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create client'}
        </Button>
      </form>

      {state?.ok ? (
        <div className="flex flex-col gap-1 border border-border bg-muted p-3 text-xs">
          <span className="font-semibold uppercase tracking-wide">
            {state.name} — copy the secret now, it is not shown again
          </span>
          <code className="break-all">client_id: {state.clientId}</code>
          <code className="break-all">client_secret: {state.clientSecret}</code>
        </div>
      ) : null}
      {state && !state.ok ? <p className="text-xs text-destructive">{state.error}</p> : null}

      {clients.length ? (
        <ul className="flex flex-col gap-2 text-sm">
          {clients.map((c) => (
            <li key={c.clientId} className="flex items-center justify-between gap-2 border-b border-border py-1">
              <span className="flex min-w-0 flex-col">
                <span>{c.name ?? c.clientId}</span>
                <code className="truncate text-[10px] text-muted-foreground">{c.clientId}</code>
              </span>
              {c.disabled ? (
                <span className="text-xs uppercase tracking-wide text-muted-foreground">disabled</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => startTransition(() => disableOAuthClientAction(c.clientId))}
                >
                  Disable
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}
