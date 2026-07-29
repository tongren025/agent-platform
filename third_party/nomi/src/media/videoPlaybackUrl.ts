function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function buildVideoPlaybackUrl(rawVideoUrl: string): string {
  const trimmed = rawVideoUrl.trim()
  if (!trimmed || !isHttpUrl(trimmed)) return trimmed
  return trimmed
}
