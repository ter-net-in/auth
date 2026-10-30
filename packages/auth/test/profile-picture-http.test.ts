import { describe, expect, it } from 'bun:test'
import sharp from 'sharp'
import { createPictureHandlers } from '../src/profile-picture-http.js'
import type { ProfilePicture } from '../src/profile-picture-image.js'
import type { PictureStore } from '../src/profile-picture-store.js'

const origin = 'https://auth.ter.net.in'
const first: ProfilePicture = { data: new Uint8Array([1, 2, 3]), etag: '"first"' }
const upload = () =>
  sharp({ create: { width: 256, height: 256, channels: 3, background: '#123456' } })
    .png()
    .toBuffer()
function fixture(userId: string | null = 'alice') {
  const images = new Map<string, ProfilePicture>([
    ['alice', first],
    ['bob', first]
  ])
  const store: PictureStore = {
    read: async (id) => images.get(id) ?? null,
    write: async (id, image) => {
      images.set(id, image)
    },
    remove: async (id) => {
      images.delete(id)
    },
    has: async (id) => images.has(id)
  }
  const handlers = createPictureHandlers({ origin, store, getUserId: async () => userId })
  return { images, store, handlers }
}
function request(method: string, body?: Uint8Array, requestOrigin: string | null = origin) {
  return new Request(`${origin}/api/profile-picture?userId=bob`, {
    method,
    headers: {
      ...(requestOrigin ? { origin: requestOrigin } : {}),
      'content-type': 'image/png',
      'x-profile-user': 'alice'
    },
    body: body ? new Uint8Array(body) : undefined
  })
}

describe('profile picture boundaries', () => {
  it('requires a session for read, upload, and removal', async () => {
    const { handlers, images } = fixture(null)
    expect((await handlers.read(request('GET'), 'alice')).status).toBe(401)
    expect((await handlers.put(request('PUT', await upload()))).status).toBe(401)
    expect((await handlers.remove(request('DELETE'))).status).toBe(401)
    expect(images.size).toBe(2)
  })

  it.each([null, 'https://mail.ter.net.in', 'https://evil.invalid'])('rejects mutation Origin %s', async (value) => {
    const { handlers, images } = fixture()
    expect((await handlers.put(request('PUT', await upload(), value))).status).toBe(403)
    expect((await handlers.remove(request('DELETE', undefined, value))).status).toBe(403)
    expect(images.get('alice')).toEqual(first)
  })

  it('derives the owner from the session and normalizes a real image', async () => {
    const { handlers, images } = fixture()
    const response = await handlers.put(request('PUT', await upload()))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ imageUrl: `${origin}/api/profile-pictures/alice` })
    expect((await sharp(images.get('alice')?.data).metadata()).format).toBe('webp')
    expect(images.get('bob')).toEqual(first)
    expect((await handlers.remove(request('DELETE'))).status).toBe(200)
    expect(images.has('alice')).toBe(false)
    expect(images.has('bob')).toBe(true)
  })

  it('rejects corrupt and oversized bodies without replacing the previous picture', async () => {
    const { handlers, images } = fixture()
    expect((await handlers.put(request('PUT', new Uint8Array([0xff, 0xd8, 0xff, 0x00])))).status).toBe(422)
    const oversized = request('PUT', new Uint8Array(1_048_577))
    oversized.headers.set('content-length', '1')
    expect((await handlers.put(oversized)).status).toBe(413)
    expect(images.get('alice')).toEqual(first)
  })

  it('rejects an editor belonging to a different or missing signed-in account', async () => {
    const { handlers, images } = fixture()
    const stale = request('PUT', await upload())
    stale.headers.set('x-profile-user', 'bob')
    expect((await handlers.put(stale)).status).toBe(409)
    const missing = request('DELETE')
    missing.headers.delete('x-profile-user')
    expect((await handlers.remove(missing)).status).toBe(409)
    expect(images.get('alice')).toEqual(first)
    expect(images.get('bob')).toEqual(first)
  })

  it('limits rapid mutations and keeps storage errors out of responses', async () => {
    const { handlers, store } = fixture()
    store.write = async () => {
      throw new Error('private database details')
    }
    const bytes = await upload()
    for (let attempt = 0; attempt < 10; attempt++) {
      const response = await handlers.put(request('PUT', bytes))
      expect(response.status).toBe(500)
      expect(await response.text()).not.toContain('private database details')
    }
    expect((await handlers.put(request('PUT', bytes))).status).toBe(429)
  })

  it('serves another member picture privately and supports conditional reads', async () => {
    const { handlers } = fixture('bob')
    const response = await handlers.read(request('GET'), 'alice')
    expect(response.status).toBe(200)
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(first.data)
    expect(response.headers.get('content-type')).toBe('image/webp')
    expect(response.headers.get('cache-control')).toBe('private, no-cache')
    expect(response.headers.get('cross-origin-resource-policy')).toBe('same-site')
    expect(response.headers.get('vary')).toBe('Cookie')
    const conditional = request('GET')
    conditional.headers.set('if-none-match', first.etag)
    expect((await handlers.read(conditional, 'alice')).status).toBe(304)
    const missing = await handlers.read(request('GET'), 'missing')
    expect(missing.status).toBe(404)
    expect(missing.headers.get('cache-control')).toBe('no-store')
  })
})
