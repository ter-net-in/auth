import { describe, expect, it } from 'bun:test'
import sharp from 'sharp'
import { prepareProfilePicture } from '../src/profile-picture-image.js'

describe('profile picture processing', () => {
  it.each(['jpeg', 'png', 'webp'] as const)('converts %s to a small square WebP without metadata', async (format) => {
    const input = await sharp({ create: { width: 800, height: 400, channels: 3, background: '#123456' } })
      .withMetadata({ exif: { IFD0: { ImageDescription: 'private fixture metadata' } } })
      .toFormat(format)
      .toBuffer()
    const result = await prepareProfilePicture(input)
    const metadata = await sharp(result.data).metadata()
    expect(metadata.format).toBe('webp')
    expect([metadata.width, metadata.height]).toEqual([256, 256])
    expect(metadata.exif).toBeUndefined()
    expect(metadata.icc).toBeUndefined()
    expect(metadata.xmp).toBeUndefined()
    expect(result.data.length).toBeLessThan(256_000)
    expect(result.etag).toMatch(/^"[a-f0-9]{64}"$/)
  })

  it('honors EXIF orientation before the square crop', async () => {
    const blue = await sharp({ create: { width: 600, height: 150, channels: 3, background: '#0000ff' } })
      .png()
      .toBuffer()
    const input = await sharp({ create: { width: 600, height: 300, channels: 3, background: '#ff0000' } })
      .composite([{ input: blue, left: 0, top: 150 }])
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer()
    const result = await prepareProfilePicture(input)
    const { data, info } = await sharp(result.data).raw().toBuffer({ resolveWithObject: true })
    const left = (128 * info.width + 64) * info.channels
    const right = (128 * info.width + 192) * info.channels
    expect(data[left + 2]).toBeGreaterThan(200)
    expect(data[left]).toBeLessThan(40)
    expect(data[right]).toBeGreaterThan(200)
    expect(data[right + 2]).toBeLessThan(40)
  })

  it.each([
    Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>'),
    Buffer.from('<html>not an image</html>'),
    Buffer.from('GIF89a'),
    Buffer.alloc(0),
    Buffer.from([0xff, 0xd8, 0xff, 0x00])
  ])('rejects unsupported, empty, and corrupt image data', async (input) => {
    await expect(prepareProfilePicture(input)).rejects.toThrow()
  })

  it('rejects excessive decoded dimensions even when compressed bytes are small', async () => {
    const input = await sharp({ create: { width: 5000, height: 5000, channels: 3, background: '#123456' } })
      .png()
      .toBuffer()
    expect(input.length).toBeLessThan(1_048_576)
    await expect(prepareProfilePicture(input)).rejects.toThrow()
  })
})
