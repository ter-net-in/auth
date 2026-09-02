import { env } from '@ternetin/config'
import { count } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

export const sql = postgres(env.DATABASE_URL)
export const db = drizzle(sql, { schema })
export { schema }

/** Total registered users (members). */
export async function countUsers(): Promise<number> {
  const [row] = await db.select({ value: count() }).from(schema.user)
  return row?.value ?? 0
}
