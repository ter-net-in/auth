import { createHash } from 'node:crypto'
import sharp from 'sharp'

export const maxPictureBytes = 1_048_576
export type ProfilePicture = { data: Uint8Array; etag: string }
export class PictureError extends Error {
  constructor(
    readonly status: 413 | 415 | 422,
    message: string
  ) {
    super(message)
  }
}

export async function prepareProfilePicture(input: Uint8Array): Promise<ProfilePicture> {
  const bytes = Buffer.from(input)
  if (bytes.length > maxPictureBytes) throw new PictureError(413, 'The cropped picture must be under 1 MiB.')
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
  if (!jpeg && !png && !webp) throw new PictureError(415, 'Choose a JPEG, PNG, or WebP image.')
  try {
    const image = sharp(bytes, { limitInputPixels: 4_194_304, failOn: 'warning' })
    const metadata = await image.metadata()
    if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1) > 1) {
      throw new PictureError(415, 'Choose a still JPEG, PNG, or WebP image.')
    }
    // Sharp strips metadata by default. Re-encoding also discards uploaded containers and extra payloads.
    const data = await image.autoOrient().resize(256, 256, { fit: 'cover' }).webp({ quality: 85 }).toBuffer()
    return { data, etag: `"${createHash('sha256').update(data).digest('hex')}"` }
  } catch (error) {
    if (error instanceof PictureError) throw error
    throw new PictureError(422, 'This image could not be read. Choose another JPEG, PNG, or WebP image.')
  }
}
