'use client'

import { Separator as BaseSeparator } from '@base-ui/react/separator'
import type * as React from 'react'

import { cn } from '@/lib/utils'

export type SeparatorProps = React.ComponentProps<typeof BaseSeparator>

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <BaseSeparator
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className
      )}
      {...props}
    />
  )
}
