'use client'

import { Form as BaseForm } from '@base-ui/react/form'
import type * as React from 'react'

import { cn } from '@/lib/utils'

export function Form({ className, ...props }: React.ComponentProps<typeof BaseForm>) {
  return <BaseForm className={cn('flex flex-col gap-4', className)} {...props} />
}
