import { expect, it } from 'bun:test'
import { squareCrop } from './profile-picture-crop'

it('centers a square within landscape and portrait images without stretching', () => {
  expect(squareCrop(1200, 800, 1, 0.5, 0.5)).toEqual({ x: 200, y: 0, size: 800 })
  expect(squareCrop(800, 1200, 1, 0.5, 0.5)).toEqual({ x: 0, y: 200, size: 800 })
})
it('positions a zoomed crop at image edges without selecting outside the picture', () => {
  expect(squareCrop(1200, 800, 2, 1, 1)).toEqual({ x: 800, y: 400, size: 400 })
  expect(squareCrop(1200, 800, 2, 0, 0)).toEqual({ x: 0, y: 0, size: 400 })
})
