'use client'

import { signUp } from '@ternetin/auth/client'
import { useState } from 'react'
import { safeRedirect } from '@/lib/redirect'
import { Button } from '@/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldLabel } from '@/ui/field'
import { Form } from '@/ui/form'
import { Input } from '@/ui/input'

export function AcceptInviteForm({ email, redirectTo }: { email: string; redirectTo?: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const { error } = await signUp.email({
      email,
      name: String(form.get('name') ?? ''),
      password: String(form.get('password') ?? '')
    })
    if (error) {
      setError(error.message ?? 'Could not accept invite.')
      setPending(false)
      return
    }
    window.location.assign(safeRedirect(redirectTo))
  }

  return (
    <Card corners="diagonal" className="w-full max-w-sm" padding="lg">
      <CardHeader>
        <CardTitle>Accept invite</CardTitle>
        <CardDescription>Create your ter.net.in account</CardDescription>
      </CardHeader>
      <Form onSubmit={onSubmit}>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input value={email} readOnly disabled />
        </Field>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input name="name" required autoComplete="name" />
        </Field>
        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Creating…' : 'Create account'}
        </Button>
      </Form>
    </Card>
  )
}
