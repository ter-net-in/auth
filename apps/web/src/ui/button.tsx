'use client';

import { Button as BaseButton } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLMotionProps, motion } from 'motion/react';
import type * as React from 'react';

import { useTapMotion } from '@/lib/motion';
import { cn, type RadiusProps, radiusVariants } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap border font-medium tracking-[-0.01em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-primary-foreground hover:bg-background hover:text-primary',
        outline:
          'border-border bg-background text-foreground hover:border-primary hover:bg-accent hover:text-accent-foreground',
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
        destructive:
          'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/10 hover:text-destructive'
      },
      size: {
        default: 'h-10 px-4 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ComponentProps<typeof BaseButton>,
    VariantProps<typeof buttonVariants>,
    RadiusProps {}

export function Button({ className, variant, size, radius, ...props }: ButtonProps) {
  const tap = useTapMotion();

  return (
    <BaseButton
      className={cn(buttonVariants({ variant, size }), radiusVariants({ radius }), className)}
      render={(buttonProps) => <motion.button {...(buttonProps as HTMLMotionProps<'button'>)} {...tap} />}
      {...props}
    />
  );
}

export { buttonVariants };
