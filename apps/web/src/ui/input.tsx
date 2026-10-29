'use client'
import { Input as BaseInput } from '@base-ui/react/input'
import type * as React from 'react'
import { cn } from '@/lib/utils'
export type InputProps = React.ComponentProps<typeof BaseInput>
export function Input({ className, ...props }: InputProps) {
  return (
    <BaseInput
      className={cn(
        'ui-control flex h-9 w-full border border-input bg-background px-3 py-2 text-sm leading-5 text-foreground outline-none transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'data-[invalid]:border-destructive data-[invalid]:bg-destructive/5',
        'rounded-control',
        className
      )}
      {...props}
    />
  )
}
