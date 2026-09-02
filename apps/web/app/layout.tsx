import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'auth.ter.net.in — sign in',
  description: 'Invite-only access to ter.net.in'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}
