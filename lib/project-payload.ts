export const MAX_SCREENSHOTS = 20

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export const asRequiredString = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const asOptionalString = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const parseScreenshotUrls = (
  value: unknown,
):
  | { ok: true; urls: string[] }
  | { ok: false; error: string } => {
  if (value === undefined || value === null) {
    return { ok: true, urls: [] }
  }
  if (!Array.isArray(value)) {
    return {
      ok: false,
      error: "screenshots must be an array of URL strings.",
    }
  }

  const urls: string[] = []
  const seen = new Set<string>()

  for (const item of value) {
    if (typeof item !== "string") {
      return {
        ok: false,
        error: "Every screenshot must be a non-empty https URL string.",
      }
    }
    const trimmed = item.trim()
    if (!trimmed) continue
    if (!trimmed.startsWith("https://")) {
      return {
        ok: false,
        error: "Every screenshot URL must use https.",
      }
    }
    if (seen.has(trimmed)) continue
    seen.add(trimmed)
    urls.push(trimmed)
    if (urls.length > MAX_SCREENSHOTS) {
      return {
        ok: false,
        error: `At most ${MAX_SCREENSHOTS} screenshots are allowed.`,
      }
    }
  }

  return { ok: true, urls }
}

export const parseTechStackNames = (value: unknown): string[] | null => {
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === "string")
  ) {
    return null
  }
  return Array.from(
    new Set(
      value
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  )
}
