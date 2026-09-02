'use client'

import { useActionState } from 'react'
import { Button } from '@/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldLabel } from '@/ui/field'
import { Input } from '@/ui/input'
import { createInviteAction } from '../../app/actions'

export function InviteManager() {
  const [state, action, pending] = useActionState(createInviteAction, null)

  return (
    <Card corners="diagonal" cornerTone="split" padding="lg" className="w-full">
      <CardHeader>
        <CardTitle>Invite a member</CardTitle>
        <CardDescription>Only invited emails can create an account.</CardDescription>
      </CardHeader>
      <form action={action} className="flex flex-col gap-4">
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input name="email" type="email" required placeholder="new.member@example.com" />
        </Field>
        <Field>
          <FieldLabel>Role</FieldLabel>
          <Input name="role" defaultValue="member" />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create invite'}
        </Button>
      </form>
      {state?.ok ? (
        <div className="flex flex-col gap-1 border border-border bg-muted p-3 text-xs">
          <span className="font-semibold uppercase tracking-wide">Invite link for {state.email}</span>
          <code className="break-all">{state.url}</code>
        </div>
      ) : null}
      {state && !state.ok ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </Card>
  )
}
