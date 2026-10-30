'use client'

import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar'

export function ProfileAvatar({ src, name, className }: { src?: string | null; name: string; className?: string }) {
  const [version, setVersion] = useState(0)
  const lastRefresh = useRef(0)
  useEffect(() => {
    const refresh = () => {
      const now = Date.now()
      if (document.visibilityState !== 'visible' || now - lastRefresh.current < 1000) return
      lastRefresh.current = now
      setVersion(now)
    }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => Array.from(word)[0])
      .join('')
      .toUpperCase() || '?'
  const url = src ? `${src}${src.includes('?') ? '&' : '?'}refresh=${version}` : undefined
  return (
    <Avatar key={url} className={className} aria-hidden="true">
      {url && <AvatarImage src={url} alt="" referrerPolicy="no-referrer" />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
