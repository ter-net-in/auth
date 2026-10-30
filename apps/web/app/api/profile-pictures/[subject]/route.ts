import { pictureHandlers } from '@/lib/profile-picture-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(request: Request, { params }: { params: Promise<{ subject: string }> }) {
  return pictureHandlers.read(request, (await params).subject)
}
