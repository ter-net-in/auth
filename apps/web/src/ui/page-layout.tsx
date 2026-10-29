import type * as React from 'react'
import { cn } from '@/lib/utils'

export function PageContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8', className)} {...props} />
  )
}
export function PageHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return <header className={cn('flex flex-wrap items-start justify-between gap-4', className)} {...props} />
}
export function PageTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return <h1 className={cn('text-2xl font-semibold tracking-tight sm:text-3xl', className)} {...props} />
}
export function PageDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('mt-2 max-w-prose text-sm leading-6 text-muted-foreground', className)} {...props} />
}
export function PageActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...props} />
}
export function PageSection({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('space-y-4', className)} {...props} />
}
