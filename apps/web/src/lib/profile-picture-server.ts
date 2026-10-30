import { auth } from '@ternetin/auth'
import { createPictureHandlers, createPictureStore } from '@ternetin/auth/profile-pictures'
import { env } from '@ternetin/config'
import { db } from '@ternetin/db'

export const pictureStore = createPictureStore(db)
export const pictureHandlers = createPictureHandlers({
  origin: env.BETTER_AUTH_URL,
  store: pictureStore,
  getUserId: async (headers) => (await auth.api.getSession({ headers }))?.user.id ?? null
})
