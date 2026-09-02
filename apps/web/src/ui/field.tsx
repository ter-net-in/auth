'use client'

import { Field as BaseField } from '@base-ui/react/field'
import type * as React from 'react'

import { cn, type RadiusProps, radiusVariants } from '@/lib/utils'

export function Field({ className, ...props }: React.ComponentProps<typeof BaseField.Root>) {
  return <BaseField.Root className={cn('flex flex-col gap-1.5', className)} {...props} />
}

export function FieldLabel({ className, ...props }: React.ComponentProps<typeof BaseField.Label>) {
  return (
    <BaseField.Label
      className={cn('text-xs font-semibold uppercase tracking-[0.1em] text-foreground', className)}
      {...props}
    />
  )
}

export function FieldControl({
  className,
  radius,
  ...props
}: React.ComponentProps<typeof BaseField.Control> & RadiusProps) {
  return (
    <BaseField.Control
      className={cn(
        'flex h-10 w-full border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
        radiusVariants({ radius }),
        className
      )}
      {...props}
    />
  )
}

export function FieldDescription({ className, ...props }: React.ComponentProps<typeof BaseField.Description>) {
  return <BaseField.Description className={cn('text-xs text-muted-foreground', className)} {...props} />
}

export function FieldError({ className, ...props }: React.ComponentProps<typeof BaseField.Error>) {
  return <BaseField.Error className={cn('text-xs text-destructive', className)} {...props} />
}
