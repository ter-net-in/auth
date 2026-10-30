import { pictureHandlers } from '@/lib/profile-picture-server'

export const runtime = 'nodejs'
export const PUT = pictureHandlers.put
export const DELETE = pictureHandlers.remove
