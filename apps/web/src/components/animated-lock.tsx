'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import { AsciiSvg } from '@/ui/ascii-svg'

/** The padlock itself — monochrome, black. Shape in foreground, keyhole knocked out
 *  in the background token so AsciiSvg reads it as a hole. */
function LockSvg({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 48 48"
      fill="none"
      animate={{ y: open ? 0 : [0, -2, 0] }}
      transition={{ duration: 3, repeat: open ? 0 : Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
    >
      {/* Shackle — draws in on mount; swings open about the seated right leg. */}
      <motion.path
        d="M15 22 v-5 a9 9 0 0 1 18 0 v5"
        stroke="var(--color-foreground)"
        strokeWidth={3}
        strokeLinecap="square"
        style={{ transformOrigin: '33px 22px', transformBox: 'view-box' }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1, rotate: open ? -34 : 0 }}
        transition={{
          pathLength: { duration: 0.8, ease: 'easeInOut' },
          rotate: { type: 'spring', stiffness: 260, damping: 20 }
        }}
      />
      {/* Body. */}
      <motion.rect
        x={11}
        y={22}
        width={26}
        height={19}
        rx={3}
        fill="var(--color-foreground)"
        stroke="var(--color-foreground)"
        strokeWidth={3}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        style={{ transformOrigin: '24px 41px' }}
        transition={{ duration: 0.35, delay: 0.5, ease: 'easeOut' }}
      />
      {/* Keyhole — knocked out in the background token. */}
      <motion.g
        fill="var(--color-background)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ transformOrigin: '24px 30px' }}
        transition={{ duration: 0.3, delay: 1.05, ease: 'backOut' }}
      >
        <circle cx={24} cy={30} r={2.6} />
        <rect x={22.9} y={30} width={2.2} height={6} />
      </motion.g>
    </motion.svg>
  )
}

/**
 * The padlock rendered as live ASCII (via AsciiSvg). Click / Enter / Space unlocks —
 * the shackle swings open and the ASCII re-samples in real time.
 */
export function AnimatedLock() {
  const [open, setOpen] = useState(false)

  return (
    <motion.button
      type="button"
      aria-pressed={open}
      aria-label={open ? 'Padlock open — click to close' : 'Padlock — click to open'}
      onClick={() => setOpen((o) => !o)}
      className="cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.4 }}
    >
      <AsciiSvg live cols={40} fps={24} className="text-[11px] leading-[1.1]">
        <LockSvg open={open} />
      </AsciiSvg>
    </motion.button>
  )
}
