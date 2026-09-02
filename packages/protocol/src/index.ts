import { z } from 'zod'

export const healthResponseSchema = z.object({ ok: z.boolean() })

export const checkoutRequestSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
})

export const signedUrlRequestSchema = z.object({
  key: z.string().min(1),
  contentType: z.string().min(1).optional()
})

export const exampleJobSchema = z.object({
  message: z.string().min(1)
})

export type ExampleJob = z.infer<typeof exampleJobSchema>
