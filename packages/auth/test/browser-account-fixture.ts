import { createDb, schema } from '@ternetin/db'
import { eq } from 'drizzle-orm'

const [action, email] = process.argv.slice(2)
const url = new URL(process.env.DATABASE_URL ?? '')
if (
  process.env.PROFILE_TEST_DATABASE !== '1' ||
  !['localhost', '127.0.0.1'].includes(url.hostname) ||
  !email?.startsWith('profile-browser-') ||
  !email.endsWith('@example.invalid')
) {
  throw new Error('Browser fixtures require an explicit isolated loopback database and fixture email.')
}
const { db, sql } = createDb(url.href)
try {
  if (action === 'invite') {
    await db.insert(schema.invitation).values({
      id: crypto.randomUUID(),
      email,
      token: crypto.randomUUID(),
      role: 'member',
      expiresAt: new Date(Date.now() + 3_600_000)
    })
  } else if (action === 'remove') {
    await db.delete(schema.user).where(eq(schema.user.email, email))
    await db.delete(schema.invitation).where(eq(schema.invitation.email, email))
  } else throw new Error('Unknown fixture operation')
} finally {
  await sql.end()
}
