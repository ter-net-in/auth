'use client'
import { Field as BaseField } from '@base-ui/react/field'
import type * as React from 'react'
import { cn } from '@/lib/utils'
export function Field({ className, ...props }: React.ComponentProps<typeof BaseField.Root>) {
  return <BaseField.Root className={cn('flex flex-col gap-1.5', className)} {...props} />
}
export function FieldLabel({ className, ...props }: React.ComponentProps<typeof BaseField.Label>) {
  return <BaseField.Label className={cn('cursor-pointer text-sm font-medium text-foreground', className)} {...props} />
}
export function FieldControl({ className, ...props }: React.ComponentProps<typeof BaseField.Control>) {
  return (
    <BaseField.Control
      className={cn(
        'flex h-9 w-full border border-input bg-background px-3 py-2 text-sm leading-5 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring data-[invalid]:border-destructive data-[invalid]:bg-destructive/5',
        'rounded-control',
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
  return <BaseField.Error className={cn('text-xs font-medium text-destructive', className)} {...props} />
}
