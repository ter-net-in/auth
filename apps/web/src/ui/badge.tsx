import type * as React from 'react'
import { cn } from '@/lib/utils'

const tones = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-info-muted text-info'
}
export function Badge({
  tone = 'neutral',
  className,
  ...props
}: React.ComponentProps<'span'> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-control px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
      {...props}
    />
  )
}
