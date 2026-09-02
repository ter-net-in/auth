'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/** Brightness ramps, dark → light. */
export const ASCII_RAMPS = {
  standard: ' .:-=+*#%@',
  dense: ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  minimal: ' .oO@',
  blocks: ' ░▒▓█',
  binary: '01',
  dots: ' ·•●'
} as const

export interface AsciiSvgProps extends Omit<React.ComponentProps<'pre'>, 'children'> {
  /** The SVG (or any node containing one) to ASCII-fy. Rendered off-screen and sampled. */
  children: React.ReactNode
  /** Number of character columns. Higher = more detail. */
  cols?: number
  /** Brightness ramp, dark → light. Pass a string or a key of {@link ASCII_RAMPS}. */
  chars?: string
  /** CSS selector for the element to sample inside `children`. Defaults to the first `<svg>`. */
  select?: string
  /** Re-sample every frame — turn on for animated SVGs so the ASCII animates with them. */
  live?: boolean
  /** Max samples per second when `live`. */
  fps?: number
  /** Invert the ramp (light shapes on a dark ground). */
  invert?: boolean
}

/**
 * Globs an SVG out of its children, rasterizes it to an offscreen canvas and maps
 * per-cell brightness onto an ASCII ramp — the classic image-to-ASCII trick, applied
 * live to vector art. The source SVG is rendered off-screen (so the browser lays it
 * out and animates it) and sampled; only the ASCII is shown.
 *
 * CSS-context paint (`currentColor`, `var(--…)`) can't resolve inside an isolated
 * `<img>`, so it's flattened to solid white-on-black before sampling — background/card
 * tokens become the knockout, everything else becomes the shape.
 */
export function AsciiSvg({
  children,
  cols = 44,
  chars = ASCII_RAMPS.standard,
  select = 'svg',
  live = false,
  fps = 24,
  invert = false,
  className,
  ...props
}: AsciiSvgProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [art, setArt] = React.useState('')

  // Reserve the box before first paint with a same-size blank grid, so the ASCII
  // filling in on the first (async) sample doesn't resize the layout and jump.
  const useIsoLayout = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect
  useIsoLayout(() => {
    if (art) return
    const svg = hostRef.current?.querySelector(select) as SVGSVGElement | null
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const w = rect.width || svg.viewBox?.baseVal?.width || 100
    const h = rect.height || svg.viewBox?.baseVal?.height || 100
    const rows = Math.max(1, Math.round(cols * (h / w) * 0.5))
    setArt(Array.from({ length: rows }, () => ' '.repeat(cols)).join('\n'))
    // Placeholder only — run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: children is listed so the loop restarts when the source SVG changes.
  React.useEffect(() => {
    const host = hostRef.current
    if (!host || typeof window === 'undefined') return

    let stopped = false
    let timer = 0
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const sample = () =>
      new Promise<void>((resolve) => {
        const svg = host.querySelector(select) as SVGSVGElement | null
        if (!svg) return resolve()

        const rect = svg.getBoundingClientRect()
        const w = rect.width || svg.viewBox?.baseVal?.width || 100
        const h = rect.height || svg.viewBox?.baseVal?.height || 100
        const rows = Math.max(1, Math.round(cols * (h / w) * 0.5)) // 0.5 ≈ char aspect

        let markup = new XMLSerializer().serializeToString(svg)
        markup = markup
          // Theme surfaces read as the knockout (black), so holes stay holes.
          .replace(/var\(\s*--[a-z0-9-]*(?:background|card|popover|muted)[a-z0-9-]*[^)]*\)/gi, '#000000')
          .replace(/currentColor/gi, '#ffffff')
          .replace(/var\([^)]*\)/gi, '#ffffff')
        if (!/<svg[^>]*\swidth=/i.test(markup)) markup = markup.replace('<svg', `<svg width="${w}"`)
        if (!/<svg[^>]*\sheight=/i.test(markup)) markup = markup.replace('<svg', `<svg height="${h}"`)

        const img = new Image()
        const blob = new Blob([markup], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)

        img.onload = () => {
          const m = 4 // super-sample each cell
          canvas.width = cols * m
          canvas.height = rows * m
          ctx.fillStyle = '#000000'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

          let out = ''
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              let sum = 0
              for (let sy = 0; sy < m; sy++) {
                for (let sx = 0; sx < m; sx++) {
                  const idx = ((y * m + sy) * canvas.width + (x * m + sx)) * 4
                  sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3 / 255
                }
              }
              let b = sum / (m * m)
              if (invert) b = 1 - b
              out += chars[Math.min(chars.length - 1, Math.floor(b * (chars.length - 1)))]
            }
            out += '\n'
          }

          URL.revokeObjectURL(url)
          if (!stopped) setArt(out)
          resolve()
        }
        img.onerror = () => {
          URL.revokeObjectURL(url)
          resolve()
        }
        img.src = url
      })

    const loop = async () => {
      if (stopped) return
      await sample()
      if (!stopped && live) timer = window.setTimeout(loop, 1000 / fps)
    }
    loop()

    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [children, cols, chars, select, live, fps, invert])

  return (
    <>
      {/* Off-screen source: laid out & animated by the browser, sampled each frame. */}
      <div
        ref={hostRef}
        aria-hidden="true"
        style={{ position: 'fixed', left: '-99999px', top: 0, opacity: 0, pointerEvents: 'none' }}
      >
        {children}
      </div>
      <pre
        aria-hidden="true"
        className={cn(
          'whitespace-pre select-none font-mono leading-[0.8] tracking-[0.15em] text-foreground',
          className
        )}
        {...props}
      >
        {art}
      </pre>
    </>
  )
}
