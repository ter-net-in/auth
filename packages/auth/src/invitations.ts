import { randomBytes, randomUUID } from 'node:crypto'
import { env } from '@ternetin/config'
import { db, schema } from '@ternetin/db'
import { and, desc, eq, gt, isNull } from 'drizzle-orm'

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export type Invitation = typeof schema.invitation.$inferSelect

export function isBootstrapAdmin(email: string): boolean {
  return env.ADMIN_EMAILS.includes(email.toLowerCase())
}

/** A pending, unexpired invite for this email, if any. */
export async function findPendingInvite(email: string): Promise<Invitation | undefined> {
  const rows = await db
    .select()
    .from(schema.invitation)
    .where(
      and(
        eq(schema.invitation.email, email.toLowerCase()),
        isNull(schema.invitation.acceptedAt),
        gt(schema.invitation.expiresAt, new Date())
      )
    )
    .limit(1)
  return rows[0]
}

export async function getInvitationByToken(token: string): Promise<Invitation | undefined> {
  const rows = await db.select().from(schema.invitation).where(eq(schema.invitation.token, token)).limit(1)
  return rows[0]
}

/** Mark every pending invite for this email as accepted. Called after a user is created. */
export async function consumeInvite(email: string, userId: string): Promise<void> {
  await db
    .update(schema.invitation)
    .set({ acceptedAt: new Date(), acceptedBy: userId })
    .where(and(eq(schema.invitation.email, email.toLowerCase()), isNull(schema.invitation.acceptedAt)))
}

export async function createInvitation(input: {
  email: string
  role?: string
  invitedBy?: string
}): Promise<Invitation> {
  const token = randomBytes(24).toString('base64url')
  const [row] = await db
    .insert(schema.invitation)
    .values({
      id: randomUUID(),
      email: input.email.toLowerCase(),
      token,
      role: input.role ?? 'member',
      invitedBy: input.invitedBy,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS)
    })
    .returning()
  return row
}

export async function listInvitations(): Promise<Invitation[]> {
  return db.select().from(schema.invitation).orderBy(desc(schema.invitation.createdAt)).limit(100)
}

export function inviteAcceptUrl(token: string): string {
  return `${env.BETTER_AUTH_URL.replace(/\/$/, '')}/accept-invite?token=${encodeURIComponent(token)}`
}
