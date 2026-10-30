'use client'
import { Button as BaseButton } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import type * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'ui-control inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap border font-medium tracking-[-0.01em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border-[color:var(--color-action-border,#064aba)] [background-image:linear-gradient(var(--color-action,#216ce1),var(--color-action-end,#0854cc))] font-semibold text-[color:var(--color-action-foreground,#fff)] hover:brightness-95 active:brightness-90',
        outline:
          'border-border bg-background text-foreground hover:border-primary hover:bg-accent hover:text-accent-foreground',
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
        destructive: 'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90'
      },
      size: {
        default: 'h-9 px-3.5 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-5 text-sm',
        icon: 'size-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)
export interface ButtonProps extends React.ComponentProps<typeof BaseButton>, VariantProps<typeof buttonVariants> {}
export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <BaseButton className={cn(buttonVariants({ variant, size }), 'rounded-control', className)} {...props} />
}
export { buttonVariants }
