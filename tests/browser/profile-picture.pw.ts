import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { expect, type Page, test } from 'playwright/test'

const run = promisify(execFile)
let email = ''
let userId = ''
test.beforeEach(async ({ request, context }) => {
  email = `profile-browser-${crypto.randomUUID()}@example.invalid`
  await run('bun', ['packages/auth/test/browser-account-fixture.ts', 'invite', email])
  const response = await request.post('/api/auth/sign-up/email', {
    headers: { origin: 'http://127.0.0.1:3515' },
    data: {
      name: 'Example Member',
      email,
      password: `fixture-${crypto.randomUUID()}`
    }
  })
  expect(response.status()).toBe(200)
  const body = await response.json()
  expect(typeof body.user?.id).toBe('string')
  userId = body.user.id
  await context.addCookies((await request.storageState()).cookies)
})
test.afterEach(async () => {
  if (email) await run('bun', ['packages/auth/test/browser-account-fixture.ts', 'remove', email])
})

async function selectPicture(page: Page) {
  const content = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 320
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas unavailable')
    context.fillStyle = '#1b62ce'
    context.fillRect(0, 0, 320, 320)
    context.fillStyle = '#f4b83f'
    context.fillRect(320, 0, 320, 320)
    return canvas.toDataURL('image/png').split(',')[1]
  })
  await page
    .getByLabel('Choose picture file')
    .setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: Buffer.from(content, 'base64') })
}

test('upload, crop, refresh, member-only reading, and removal use the real Auth API', async ({
  page,
  request,
  playwright
}) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/dashboard')
  const profile = page.getByRole('region', { name: 'Profile picture' })
  await expect(profile).toContainText('Your initials appear')
  await selectPicture(page)
  await expect(page.getByRole('img', { name: 'Crop preview' })).toBeVisible()
  await page.getByRole('slider', { name: /Zoom/ }).press('End')
  await page.getByRole('slider', { name: /Horizontal position/ }).press('End')
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await profile.scrollIntoViewIfNeeded()
    await page.screenshot({
      animations: 'disabled',
      path: `/tmp/ternet-shared-profiles-20261030/auth-crop-${width}.png`
    })
  }
  await page.setViewportSize({ width: 390, height: 1000 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Save picture', exact: true }).click()
  await expect(profile.getByRole('status')).toContainText('Profile picture updated')
  await expect(profile.locator('img')).toBeVisible()
  await page.screenshot({ animations: 'disabled', path: '/tmp/ternet-shared-profiles-20261030/auth-picture-390.png' })
  const image = await request.get(`/api/profile-pictures/${userId}`)
  expect(image.status()).toBe(200)
  expect(image.headers()['content-type']).toBe('image/webp')
  expect(image.headers()['cache-control']).toBe('private, no-cache')
  const anonymous = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:3515' })
  expect((await anonymous.get(`/api/profile-pictures/${userId}`)).status()).toBe(401)
  await anonymous.dispose()
  await page.reload()
  await expect(profile.getByRole('button', { name: 'Remove picture' })).toBeVisible()
  await expect(profile.locator('img')).toBeVisible()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ animations: 'disabled', path: '/tmp/ternet-shared-profiles-20261030/auth-picture-1440.png' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await profile.getByRole('button', { name: 'Remove picture' }).click()
  await expect(profile.getByRole('status')).toContainText('Profile picture removed')
  expect((await request.get(`/api/profile-pictures/${userId}`)).status()).toBe(404)
  await expect(profile.getByText('EM', { exact: true })).toBeVisible()
})

test('invalid files and failed saves retain the crop and permit a safe retry', async ({ page }) => {
  await page.goto('/dashboard')
  const profile = page.getByRole('region', { name: 'Profile picture' })
  await page
    .getByLabel('Choose picture file')
    .setInputFiles({ name: 'fixture.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') })
  await expect(profile.getByRole('alert')).toContainText('JPG, PNG, or WebP')
  await selectPicture(page)
  await page.route('**/api/profile-picture', (route) =>
    route.fulfill({ status: 503, json: { error: { message: 'Fixture storage failure' } } })
  )
  await profile.getByRole('button', { name: 'Save picture', exact: true }).click()
  await expect(profile.getByRole('alert')).toContainText('Fixture storage failure')
  await expect(page.getByRole('img', { name: 'Crop preview' })).toBeVisible()
  await page.unroute('**/api/profile-picture')
  await profile.getByRole('button', { name: 'Save picture', exact: true }).click()
  await expect(profile.getByRole('status')).toContainText('Profile picture updated')
})
