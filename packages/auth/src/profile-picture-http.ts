import { maxPictureBytes, PictureError, prepareProfilePicture } from './profile-picture-image.js'
import type { PictureStore } from './profile-picture-store.js'
import { profilePictureUrl } from './profile-picture-url.js'

type Dependencies = {
  origin: string
  store: PictureStore
  getUserId(headers: Headers): Promise<string | null>
}
function error(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status, headers: { 'cache-control': 'no-store' } })
}
async function safely(action: () => Promise<Response>) {
  try {
    return await action()
  } catch (failure) {
    if (failure instanceof PictureError) return error(failure.status, 'INVALID_PICTURE', failure.message)
    return error(500, 'PICTURE_UNAVAILABLE', 'The profile picture request could not be confirmed. Try again.')
  }
}
async function readUpload(request: Request) {
  if (Number(request.headers.get('content-length')) > maxPictureBytes) {
    throw new PictureError(413, 'The cropped picture must be under 1 MiB.')
  }
  const type = request.headers.get('content-type')?.split(';')[0]?.toLowerCase()
  if (!type || !['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
    throw new PictureError(415, 'Choose a JPEG, PNG, or WebP image.')
  }
  if (!request.body) throw new PictureError(422, 'Choose a picture before saving.')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxPictureBytes) {
      await reader.cancel()
      throw new PictureError(413, 'The cropped picture must be under 1 MiB.')
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks)
}

export function createPictureHandlers({ origin, store, getUserId }: Dependencies) {
  const ownOrigin = new URL(origin).origin
  const attempts = new Map<string, { start: number; count: number }>()
  const activeUsers = new Set<string>()
  let processing = 0
  async function owner(request: Request): Promise<string | Response> {
    const userId = await getUserId(request.headers)
    if (!userId) return error(401, 'UNAUTHENTICATED', 'Sign in to manage your profile picture.')
    if (request.headers.get('origin') !== ownOrigin)
      return error(403, 'INVALID_ORIGIN', 'Request origin is not allowed.')
    if (request.headers.get('x-profile-user') !== userId)
      return error(
        409,
        'ACCOUNT_CHANGED',
        'Your signed-in account changed. Reload this page before editing your picture.'
      )
    const now = Date.now()
    for (const [id, attempt] of attempts) if (now - attempt.start >= 60_000) attempts.delete(id)
    const attempt = attempts.get(userId) ?? { start: now, count: 0 }
    if (attempt.count >= 10)
      return error(429, 'RATE_LIMITED', 'Please wait a minute before changing your picture again.')
    attempts.set(userId, { ...attempt, count: attempt.count + 1 })
    return userId
  }
  return {
    put: (request: Request) =>
      safely(async () => {
        const userId = await owner(request)
        if (userId instanceof Response) return userId
        const bytes = await readUpload(request)
        if (processing >= 2 || activeUsers.has(userId))
          return error(429, 'PICTURE_BUSY', 'Another picture is being saved. Try again shortly.')
        processing++
        activeUsers.add(userId)
        try {
          const picture = await prepareProfilePicture(bytes)
          await store.write(userId, picture)
          return Response.json(
            { imageUrl: profilePictureUrl(userId, ownOrigin) },
            { headers: { 'cache-control': 'no-store' } }
          )
        } finally {
          processing--
          activeUsers.delete(userId)
        }
      }),
    remove: (request: Request) =>
      safely(async () => {
        const userId = await owner(request)
        if (userId instanceof Response) return userId
        if (activeUsers.has(userId))
          return error(409, 'PICTURE_BUSY', 'Wait for the picture to finish saving before removing it.')
        await store.remove(userId)
        return Response.json({ imageUrl: null }, { headers: { 'cache-control': 'no-store' } })
      }),
    read: (request: Request, subject: string) =>
      safely(async () => {
        if (!(await getUserId(request.headers)))
          return error(401, 'UNAUTHENTICATED', 'Sign in to view member pictures.')
        if (!subject || subject.length > 512) return error(404, 'PICTURE_NOT_FOUND', 'No profile picture.')
        const picture = await store.read(subject)
        if (!picture) return error(404, 'PICTURE_NOT_FOUND', 'No profile picture.')
        const headers = {
          'content-type': 'image/webp',
          'cache-control': 'private, no-cache',
          'cross-origin-resource-policy': 'same-site',
          'x-content-type-options': 'nosniff',
          'referrer-policy': 'no-referrer',
          'content-disposition': 'inline; filename="profile-picture.webp"',
          vary: 'Cookie',
          etag: picture.etag
        }
        if (request.headers.get('if-none-match') === picture.etag) return new Response(null, { status: 304, headers })
        return new Response(new Uint8Array(picture.data), { headers })
      })
  }
}
