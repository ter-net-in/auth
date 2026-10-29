import type * as React from 'react'
import { cn } from '@/lib/utils'

export function SettingsSection({
  title,
  description,
  actions,
  children,
  headingLevel = 2,
  className,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title'> & {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  headingLevel?: 2 | 3
}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2'
  return (
    <section className={cn('space-y-4 border-b border-border py-6 last:border-b-0', className)} {...props}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading className="text-sm font-semibold">{title}</Heading>
          {description && <p className="mt-1 max-w-prose text-sm leading-6 text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}
