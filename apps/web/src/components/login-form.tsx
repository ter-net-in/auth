'use client'

import { signIn } from '@ternetin/auth/client'
import { useState } from 'react'
import { safeRedirect } from '@/lib/redirect'
import { Button } from '@/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldLabel } from '@/ui/field'
import { Form } from '@/ui/form'
import { Input } from '@/ui/input'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const { error } = await signIn.email({
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? '')
    })
    if (error) {
      setError(error.message ?? 'Sign in failed.')
      setPending(false)
      return
    }
    // Full navigation so the target subdomain reads the shared cookie.
    window.location.assign(safeRedirect(redirectTo))
  }

  return (
    <Card corners="diagonal" className="w-full max-w-sm" padding="lg">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>ter.net.in — invite only</CardDescription>
      </CardHeader>
      <Form onSubmit={onSubmit}>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input name="email" type="email" autoComplete="email" required placeholder="you@ter.net.in" />
        </Field>
        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </Form>
    </Card>
  )
}
