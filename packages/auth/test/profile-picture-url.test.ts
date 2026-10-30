import { expect, it } from 'bun:test'
import { profilePictureClaims } from '../src/profile-picture-url.js'

it('shares only a first-party picture URL under the profile scope', () => {
  const origin = 'https://auth.ter.net.in'
  expect(profilePictureClaims('member-123', ['openid', 'email'], origin)).toEqual({})
  expect(profilePictureClaims('member-123', ['openid', 'profile'], origin)).toEqual({
    picture: `${origin}/api/profile-pictures/member-123`
  })
})
