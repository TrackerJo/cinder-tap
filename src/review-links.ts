export type ReviewPlatform = 'google' | 'yelp'
export type ReviewLinks = Partial<Record<ReviewPlatform, string>>
export function reviewUrl(value: unknown, platform: ReviewPlatform): string | undefined {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) return undefined
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return undefined
    const host = url.hostname.toLowerCase()
    const valid = platform === 'google'
      ? host === 'google.com' || host.endsWith('.google.com') || ['g.page','maps.app.goo.gl','goo.gl'].includes(host)
      : host === 'yelp.com' || host.endsWith('.yelp.com')
    return valid ? url.href : undefined
  } catch { return undefined }
}
export function parseReviewLinks(values: { google?: unknown; yelp?: unknown }): ReviewLinks {
  const links: ReviewLinks = {}
  for (const platform of ['google','yelp'] as const) {
    const value = values[platform]
    if (value === undefined || value === '') continue
    if (typeof value === 'string' && !value.trim()) continue
    const url = reviewUrl(value,platform)
    if (!url) throw new Error(`Enter a valid HTTPS ${platform === 'google' ? 'Google (google.com, g.page, or maps.app.goo.gl)' : 'Yelp (yelp.com)'} review link, or leave it blank.`)
    links[platform] = url
  }
  return links
}
