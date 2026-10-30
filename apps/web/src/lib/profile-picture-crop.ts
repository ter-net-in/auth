export function squareCrop(width: number, height: number, zoom: number, horizontal: number, vertical: number) {
  const size = Math.min(width, height) / zoom
  return { x: (width - size) * horizontal, y: (height - size) * vertical, size }
}
