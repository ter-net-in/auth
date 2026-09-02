import { cva, type VariantProps } from 'class-variance-authority'
import { type ClassValue, clsx } from 'clsx'
import type * as React from 'react'
import { twMerge } from 'tailwind-merge'

import { UI_DEFAULTS } from '@/lib/ui-defaults'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shared radius scale for every component's `radius` prop.
 *
 * NOTE: the theme zeroes --radius-sm/md/lg/xl, so Tailwind's rounded-sm/md/lg all
 * render flat. These literal radii let a component opt out of the sharp default.
 */
export const radiusVariants = cva('ui-radius', {
  variants: {
    radius: {
      none: 'rounded-none',
      sm: 'rounded-[0.25rem]',
      md: 'rounded-[0.5rem]',
      lg: 'rounded-[1rem]',
      full: 'rounded-full'
    }
  },
  defaultVariants: {
    radius: UI_DEFAULTS.radius
  }
})

export type RadiusProps = VariantProps<typeof radiusVariants>
export type Radius = NonNullable<RadiusProps['radius']>

/**
 * Capped radius scale for large container surfaces (dialogs, menus, cards, panels).
 * Excludes `full` — a 9999px radius turns a rectangle into a lozenge. Max is `lg`.
 * Use this for boxy surfaces; use radiusVariants for pill/circle-friendly controls.
 */
export const containerRadiusVariants = cva('ui-container-radius', {
  variants: {
    radius: {
      none: 'rounded-none',
      sm: 'rounded-[0.25rem]',
      md: 'rounded-[0.5rem]',
      lg: 'rounded-[1rem]'
    }
  },
  defaultVariants: {
    radius: UI_DEFAULTS.containerRadius
  }
})

export type ContainerRadiusProps = VariantProps<typeof containerRadiusVariants>
export type ContainerRadius = NonNullable<ContainerRadiusProps['radius']>

/**
 * Shared shadow scale for raised surfaces (dialogs, popovers, toasts).
 *
 * The house shadow is a hard offset block, not a blur — it reads as a second
 * printed layer rather than depth. Sizes are the offset in px.
 */
export const shadowVariants = cva('ui-shadow', {
  variants: {
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-[4px_4px_0_0_var(--color-foreground)]',
      md: 'shadow-[6px_6px_0_0_var(--color-foreground)]',
      lg: 'shadow-[8px_8px_0_0_var(--color-foreground)]',
      xl: 'shadow-[12px_12px_0_0_var(--color-foreground)]'
    }
  },
  defaultVariants: {
    shadow: UI_DEFAULTS.shadow
  }
})

export type ShadowProps = VariantProps<typeof shadowVariants>
export type Shadow = NonNullable<ShadowProps['shadow']>

/**
 * Radius for an item sitting inside a padded container, so that the item's corner
 * stays concentric with the container's: inner radius = outer radius − padding.
 *
 * The container publishes its radius as `--content-radius` and the item subtracts
 * its own inset, clamped at 0 so a square container can't produce a negative
 * radius. Menus, selects and comboboxes all pad their popup by `0.25rem`.
 */
export const NESTED_RADIUS = 'rounded-[max(0px,calc(var(--content-radius,0px)-0.25rem))]'

/** Inline style that publishes a container's radius for {@link NESTED_RADIUS}. */
export function contentRadiusStyle(radius: ContainerRadius | null | undefined): React.CSSProperties {
  return {
    '--content-radius': { none: '0px', sm: '0.25rem', md: '0.5rem', lg: '1rem' }[radius ?? 'none']
  } as React.CSSProperties
}
