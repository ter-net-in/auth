'use client'
import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import type * as React from 'react'
import { cn } from '@/lib/utils'
export function Avatar({ className, ...props }: React.ComponentProps<typeof BaseAvatar.Root>) {
  return (
    <BaseAvatar.Root
      className={cn(
        'inline-flex size-10 shrink-0 select-none items-center justify-center overflow-hidden border border-border bg-muted align-middle text-sm font-medium uppercase',
        'rounded-full',
        className
      )}
      {...props}
    />
  )
}
export function AvatarImage({ className, ...props }: React.ComponentProps<typeof BaseAvatar.Image>) {
  return <BaseAvatar.Image className={cn('size-full object-cover', className)} {...props} />
}
export function AvatarFallback({ className, ...props }: React.ComponentProps<typeof BaseAvatar.Fallback>) {
  return (
    <BaseAvatar.Fallback
      className={cn('flex size-full items-center justify-center text-muted-foreground', className)}
      {...props}
    />
  )
}
