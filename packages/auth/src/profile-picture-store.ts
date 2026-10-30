import type { db } from '@ternetin/db'
import { profilePicture } from '@ternetin/db/schema'
import { eq } from 'drizzle-orm'
import type { ProfilePicture } from './profile-picture-image.js'

export type PictureStore = {
  read(userId: string): Promise<ProfilePicture | null>
  write(userId: string, picture: ProfilePicture): Promise<void>
  remove(userId: string): Promise<void>
  has(userId: string): Promise<boolean>
}

export function createPictureStore(database: typeof db): PictureStore {
  return {
    async read(userId) {
      const [picture] = await database.select().from(profilePicture).where(eq(profilePicture.userId, userId)).limit(1)
      return picture ? { data: new Uint8Array(Buffer.from(picture.content, 'base64')), etag: picture.etag } : null
    },
    async write(userId, picture) {
      const values = {
        content: Buffer.from(picture.data).toString('base64'),
        etag: picture.etag,
        updatedAt: new Date()
      }
      await database
        .insert(profilePicture)
        .values({ userId, ...values })
        .onConflictDoUpdate({ target: profilePicture.userId, set: values })
    },
    async remove(userId) {
      await database.delete(profilePicture).where(eq(profilePicture.userId, userId))
    },
    async has(userId) {
      const rows = await database
        .select({ userId: profilePicture.userId })
        .from(profilePicture)
        .where(eq(profilePicture.userId, userId))
        .limit(1)
      return rows.length > 0
    }
  }
}
