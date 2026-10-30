'use client'

import { useId } from 'react'
import { squareCrop } from '@/lib/profile-picture-crop'

export type CropPosition = { zoom: number; horizontal: number; vertical: number }
export const centeredCrop: CropPosition = { zoom: 1, horizontal: 0.5, vertical: 0.5 }
export function PictureCrop({
  image,
  position,
  onChange,
  disabled
}: {
  image: { url: string; width: number; height: number }
  position: CropPosition
  onChange: (position: CropPosition) => void
  disabled: boolean
}) {
  const id = useId()
  const crop = squareCrop(image.width, image.height, position.zoom, position.horizontal, position.vertical)
  const controls = [
    {
      key: 'zoom',
      label: 'Zoom',
      min: 1,
      max: 3,
      step: 0.05,
      value: position.zoom,
      display: `${Math.round(position.zoom * 100)}%`
    },
    {
      key: 'horizontal',
      label: 'Horizontal position',
      min: 0,
      max: 1,
      step: 0.01,
      value: position.horizontal,
      display: `${Math.round(position.horizontal * 100)}%`
    },
    {
      key: 'vertical',
      label: 'Vertical position',
      min: 0,
      max: 1,
      step: 0.01,
      value: position.vertical,
      display: `${Math.round(position.vertical * 100)}%`
    }
  ] as const
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <div className="relative mx-auto size-40 overflow-hidden rounded-full bg-muted">
        <img
          src={image.url}
          alt="Crop preview"
          className="absolute left-0 top-0"
          style={{
            width: `${(image.width / crop.size) * 100}%`,
            height: `${(image.height / crop.size) * 100}%`,
            maxWidth: 'none',
            transform: `translate(${(-crop.x / image.width) * 100}%, ${(-crop.y / image.height) * 100}%)`
          }}
        />
      </div>
      <div className="grid gap-3">
        {controls.map((control) => (
          <div key={control.key}>
            <label htmlFor={`${id}-${control.key}`} className="flex justify-between gap-3 text-sm font-medium">
              {control.label}
              <span className="tabular-nums text-muted-foreground">{control.display}</span>
            </label>
            <input
              id={`${id}-${control.key}`}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={control.value}
              disabled={disabled}
              onChange={(event) => onChange({ ...position, [control.key]: Number(event.target.value) })}
              className="h-11 w-full accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
