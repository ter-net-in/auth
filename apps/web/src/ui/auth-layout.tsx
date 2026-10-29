import type * as React from 'react'
import { cn } from '@/lib/utils'

export function AuthLayout({ className, children, ...props }: React.ComponentProps<'main'>) {
  return (
    <main className={cn('grid min-h-dvh place-items-center bg-background px-4 py-10 sm:px-6', className)} {...props}>
      <div className="w-full max-w-md space-y-6">{children}</div>
    </main>
  )
}
