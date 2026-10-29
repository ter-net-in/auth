import { expect, test } from 'bun:test'
import { sql } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import { checkoutRequestSchema, healthResponseSchema, signedUrlRequestSchema } from '../../protocol/src'

test('Postgres identifiers keep embedded delimiters inside a quoted identifier', () => {
  const query = new PgDialect().sqlToQuery(sql`select ${sql.identifier('name"; drop table users; --')}`)
  expect(query.sql).toBe('select "name""; drop table users; --"')
})

test('protocol schemas preserve accepted requests and reject malformed input after the validator update', () => {
  expect(healthResponseSchema.parse({ ok: true })).toEqual({ ok: true })
  const checkout = {
    priceId: 'example',
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel'
  }
  expect(checkoutRequestSchema.parse(checkout)).toEqual(checkout)
  expect(checkoutRequestSchema.safeParse({ ...checkout, successUrl: 'not a URL' }).success).toBe(false)
  expect(signedUrlRequestSchema.safeParse({ key: '' }).success).toBe(false)
})
