import type * as React from 'react'
import { cn } from '@/lib/utils'

const tones = {
  info: 'border-info/30 bg-info-muted text-info',
  success: 'border-success/30 bg-success-muted text-success',
  warning: 'border-warning/30 bg-warning-muted text-warning',
  danger: 'border-destructive/30 bg-destructive/5 text-destructive'
}
export function Alert({
  tone = 'info',
  className,
  role,
  ...props
}: React.ComponentProps<'div'> & { tone?: keyof typeof tones }) {
  return (
    <div
      role={role ?? (tone === 'danger' ? 'alert' : undefined)}
      className={cn('rounded-surface border p-4 text-sm leading-6', tones[tone], className)}
      {...props}
    />
  )
}
