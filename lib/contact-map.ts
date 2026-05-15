export function isAllowedMapEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    if (url.protocol !== "https:") return false

    const host = url.hostname.toLowerCase()
    const isGoogleHost =
      host === "www.google.com" ||
      host === "google.com" ||
      host === "maps.google.com" ||
      host.endsWith(".google.com")

    if (!isGoogleHost) return false

    return url.pathname.includes("/maps/embed")
  } catch {
    return false
  }
}

export function sanitizeMapEmbedUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed || !isAllowedMapEmbedUrl(trimmed)) return null
  return trimmed
}
