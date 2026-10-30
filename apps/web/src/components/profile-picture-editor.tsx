'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { squareCrop } from '@/lib/profile-picture-crop'
import { Alert } from '@/ui/alert'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { type CropPosition, centeredCrop, PictureCrop } from './picture-crop'
import { ProfileAvatar } from './profile-avatar'

type Candidate = { url: string; bitmap: ImageBitmap; width: number; height: number }
function responseError(body: unknown): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const failure = body.error
    if (failure && typeof failure === 'object' && 'message' in failure && typeof failure.message === 'string')
      return failure.message
  }
  return 'The picture change could not be confirmed. Try again.'
}

export function ProfilePictureEditor({
  userId,
  name,
  imageUrl,
  hasPicture: initialHasPicture
}: {
  userId: string
  name: string
  imageUrl: string
  hasPicture: boolean
}) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const current = useRef<Candidate | null>(null)
  const generation = useRef(0)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [position, setPosition] = useState<CropPosition>(centeredCrop)
  const [hasPicture, setHasPicture] = useState(initialHasPicture)
  const [version, setVersion] = useState(0)
  const [busy, setBusy] = useState<'read' | 'save' | 'remove' | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  function clearCandidate() {
    generation.current++
    current.current?.bitmap.close()
    if (current.current) URL.revokeObjectURL(current.current.url)
    current.current = null
    setCandidate(null)
    if (input.current) input.current.value = ''
  }
  useEffect(
    () => () => {
      generation.current++
      current.current?.bitmap.close()
      if (current.current) URL.revokeObjectURL(current.current.url)
    },
    []
  )

  async function choose(file: File | undefined) {
    if (!file) return
    clearCandidate()
    const request = generation.current
    setError('')
    setNotice('')
    setBusy('read')
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        throw new Error('Choose a JPG, PNG, or WebP picture.')
      if (file.size > 10 * 1024 * 1024) throw new Error('Choose a picture smaller than 10 MB.')
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      if (request !== generation.current) {
        bitmap.close()
        return
      }
      if (bitmap.width * bitmap.height > 25_000_000) {
        bitmap.close()
        throw new Error('Choose a smaller picture, under 25 megapixels.')
      }
      const next = { url: URL.createObjectURL(file), bitmap, width: bitmap.width, height: bitmap.height }
      current.current = next
      setCandidate(next)
      setPosition(centeredCrop)
    } catch (failure) {
      if (request === generation.current)
        setError(failure instanceof Error ? failure.message : 'This picture could not be read.')
    } finally {
      if (request === generation.current) setBusy(null)
    }
  }
  async function change(method: 'PUT' | 'DELETE') {
    if (busy) return
    setBusy(method === 'PUT' ? 'save' : 'remove')
    setError('')
    setNotice('')
    try {
      let blob: Blob | undefined
      if (method === 'PUT') {
        if (!candidate) throw new Error('Choose a picture before saving.')
        const crop = squareCrop(
          candidate.width,
          candidate.height,
          position.zoom,
          position.horizontal,
          position.vertical
        )
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 256
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Your browser could not prepare this picture.')
        context.drawImage(candidate.bitmap, crop.x, crop.y, crop.size, crop.size, 0, 0, 256, 256)
        blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (value) => (value ? resolve(value) : reject(new Error('This picture could not be prepared.'))),
            'image/webp',
            0.9
          )
        )
      }
      const response = await fetch('/api/profile-picture', {
        method,
        credentials: 'same-origin',
        headers: {
          'x-profile-user': userId,
          ...(blob ? { 'content-type': blob.type } : {})
        },
        body: blob
      })
      const body: unknown = await response.json().catch(() => null)
      if (!response.ok) throw new Error(responseError(body))
      if (
        !body ||
        typeof body !== 'object' ||
        !('imageUrl' in body) ||
        body.imageUrl !== (method === 'PUT' ? imageUrl : null)
      )
        throw new Error('The picture change could not be confirmed. Refresh this page before trying again.')
      setHasPicture(method === 'PUT')
      setVersion(Date.now())
      clearCandidate()
      setNotice(
        method === 'PUT'
          ? 'Profile picture updated across ter.net.in.'
          : 'Profile picture removed. Your initials will be used.'
      )
      router.refresh()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The picture change could not be confirmed.')
    } finally {
      setBusy(null)
    }
  }
  return (
    <section id="profile" aria-labelledby="profile-title">
      <Card padding="lg">
        <CardHeader>
          <CardTitle id="profile-title" role="heading" aria-level={2}>
            Profile picture
          </CardTitle>
          <CardDescription>
            Used in Auth, Mail, and Rok, and beside your messages in Mail. Visible to signed-in ter.net.in members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidate ? (
            <PictureCrop image={candidate} position={position} onChange={setPosition} disabled={Boolean(busy)} />
          ) : (
            <div className="flex items-center gap-5">
              <ProfileAvatar src={`${imageUrl}?v=${version}`} name={name} className="size-24 text-2xl" />
              <div>
                <p className="text-base font-medium">{name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasPicture ? 'Your shared profile picture.' : 'Your initials appear until you choose a picture.'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">JPG, PNG, or WebP. Up to 10 MB.</p>
              </div>
            </div>
          )}
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Choose picture file"
            className="sr-only"
            tabIndex={-1}
            disabled={Boolean(busy)}
            onChange={(event) => void choose(event.target.files?.[0])}
          />
          {error && <Alert tone="danger">{error}</Alert>}
          {notice && (
            <Alert tone="success" role="status">
              {notice}
            </Alert>
          )}
          {busy === 'read' && (
            <p role="status" className="text-sm text-muted-foreground">
              Reading picture…
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-wrap [&_button]:min-h-11 sm:[&_button]:min-h-9">
          <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={() => input.current?.click()}>
            {hasPicture ? 'Replace picture' : 'Choose picture'}
          </Button>
          {candidate && (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={Boolean(busy)}
                onClick={() => {
                  clearCandidate()
                  setError('')
                }}
              >
                Cancel crop
              </Button>
              <Button type="button" disabled={Boolean(busy)} onClick={() => void change('PUT')}>
                {busy === 'save' ? 'Saving…' : 'Save picture'}
              </Button>
            </>
          )}
          {hasPicture && !candidate && (
            <Button type="button" variant="ghost" disabled={Boolean(busy)} onClick={() => void change('DELETE')}>
              {busy === 'remove' ? 'Removing…' : 'Remove picture'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </section>
  )
}
