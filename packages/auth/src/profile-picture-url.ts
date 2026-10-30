export function profilePictureUrl(subject: string, origin: string): string {
  return new URL(`/api/profile-pictures/${encodeURIComponent(subject)}`, origin).href
}

export function profilePictureClaims(subject: string, scopes: readonly string[], origin: string) {
  return scopes.includes('profile') ? { picture: profilePictureUrl(subject, origin) } : {}
}
