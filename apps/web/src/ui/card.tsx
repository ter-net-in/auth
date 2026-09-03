'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { type ContainerRadiusProps, cn, containerRadiusVariants } from '@/lib/utils';

const cardVariants = cva('flex flex-col gap-4 text-card-foreground', {
  variants: {
    variant: {
      default: 'border border-border bg-card',
      outline: 'border border-border bg-transparent',
      muted: 'border border-transparent bg-secondary',
      ghost: 'border border-transparent bg-transparent'
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6'
    },
    corners: {
      none: '',
      diagonal: 'relative',
      all: 'relative'
    }
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
    corners: 'none'
  }
});

/**
 * Decorative corner brackets — L-shaped arms tracing a corner of the card.
 *
 * Each bracket sits 1px outside the card so its arm covers the border it traces.
 * They are drawn for a sharp card: with `radius` set they cut across the curve.
 *
 * Tunable per instance through CSS variables, so a card can restyle its brackets
 * without reaching into these classes:
 *   --card-corner-size    arm length             (default 1.125rem)
 *   --card-corner-width   arm thickness          (default 3px)
 *   --card-corner-color   trailing bracket color (default foreground)
 *   --card-corner-accent  leading bracket color  (default primary)
 */
const CORNER_BASE = 'pointer-events-none absolute size-[var(--card-corner-size,1.125rem)]';

const CORNER_ARMS = {
  'top-left':
    '-top-px -left-px border-t-[length:var(--card-corner-width,3px)] border-l-[length:var(--card-corner-width,3px)]',
  'top-right':
    '-top-px -right-px border-t-[length:var(--card-corner-width,3px)] border-r-[length:var(--card-corner-width,3px)]',
  'bottom-left':
    '-bottom-px -left-px border-b-[length:var(--card-corner-width,3px)] border-l-[length:var(--card-corner-width,3px)]',
  'bottom-right':
    '-bottom-px -right-px border-b-[length:var(--card-corner-width,3px)] border-r-[length:var(--card-corner-width,3px)]'
} as const;

type Corner = keyof typeof CORNER_ARMS;

/** Which brackets each `corners` value draws. */
const CORNER_LAYOUT: Record<'none' | 'diagonal' | 'all', readonly Corner[]> = {
  none: [],
  diagonal: ['top-left', 'bottom-right'],
  all: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
};

const ACCENT_TINT = 'border-[color:var(--card-corner-accent,var(--color-primary))]';
const PLAIN_TINT = 'border-[color:var(--card-corner-color,var(--color-foreground))]';

/** `split` accents the leading (top-left) bracket only; the rest stay foreground. */
function cornerTint(corner: Corner, tone: CornerTone) {
  if (tone === 'primary') return ACCENT_TINT;
  if (tone === 'foreground') return PLAIN_TINT;
  return corner === 'top-left' ? ACCENT_TINT : PLAIN_TINT;
}

export type CornerTone = 'split' | 'primary' | 'foreground';

export interface CardProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof cardVariants>,
    ContainerRadiusProps {
  /** Colour of the brackets drawn by `corners`. Ignored when `corners="none"`. */
  cornerTone?: CornerTone;
}

export function Card({
  className,
  variant,
  radius,
  padding,
  corners,
  cornerTone = 'split',
  children,
  ...props
}: CardProps) {
  const placement = corners ?? 'none';

  return (
    <div
      className={cn(
        cardVariants({ variant, padding, corners: placement }),
        containerRadiusVariants({ radius }),
        className
      )}
      {...props}
    >
      {CORNER_LAYOUT[placement].map((corner) => (
        <span
          key={corner}
          aria-hidden="true"
          className={cn(CORNER_BASE, CORNER_ARMS[corner], cornerTint(corner, cornerTone))}
        />
      ))}
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-lg font-semibold leading-none tracking-[-0.02em]', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-sm', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-2', className)} {...props} />;
}

export { cardVariants };
