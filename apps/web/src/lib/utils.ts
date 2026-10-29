import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Fixed inner corner for an item inside a padded popup. */
export const NESTED_RADIUS = 'rounded-[calc(var(--surface-radius)-0.25rem)]'
