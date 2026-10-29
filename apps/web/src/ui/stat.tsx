import type * as React from 'react'
import { cn } from '@/lib/utils'

export function Stat({
  label,
  value,
  hint,
  className,
  ...props
}: React.ComponentProps<'dl'> & { label: React.ReactNode; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <dl className={cn('min-w-0 rounded-surface border border-border bg-card p-4', className)} {...props}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</dd>
      {hint && <dd className="mt-1 text-xs text-muted-foreground">{hint}</dd>}
    </dl>
  )
}
