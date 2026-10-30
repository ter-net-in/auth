import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { createDb, schema } from '@ternetin/db'
import { eq } from 'drizzle-orm'
import { createPictureStore } from '../src/profile-picture-store.js'

const alice = `profile-test-${crypto.randomUUID()}`
const bob = `profile-test-${crypto.randomUUID()}`
const first = { data: new Uint8Array([1, 2, 3]), etag: '"first"' }
const second = { data: new Uint8Array([4, 5, 6]), etag: '"second"' }
const { db, sql } = createDb(process.env.DATABASE_URL ?? '')

beforeAll(async () => {
  await db.insert(schema.user).values([alice, bob].map((id) => ({ id, name: id, email: `${id}@example.invalid` })))
})
afterAll(async () => {
  await db.delete(schema.user).where(eq(schema.user.id, alice))
  await db.delete(schema.user).where(eq(schema.user.id, bob))
  await sql.end()
})

describe('durable profile pictures', () => {
  it('reads a saved picture through a fresh store and replaces only that user', async () => {
    const store = createPictureStore(db)
    await store.write(alice, first)
    await store.write(bob, second)
    expect(await createPictureStore(db).read(alice)).toEqual(first)
    await store.write(alice, second)
    expect(await store.read(alice)).toEqual(second)
    expect(await store.read(bob)).toEqual(second)
  })

  it('removes only the selected user and cascades account deletion', async () => {
    const store = createPictureStore(db)
    await store.remove(alice)
    expect(await store.read(alice)).toBeNull()
    expect(await store.read(bob)).toEqual(second)
    await db.delete(schema.user).where(eq(schema.user.id, bob))
    expect(await store.read(bob)).toBeNull()
  })
})
