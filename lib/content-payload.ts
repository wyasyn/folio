import {
  asOptionalString,
  asRequiredString,
  slugify,
} from "@/lib/project-payload"

export type ContentPayload = {
  title?: unknown
  description?: unknown
  content?: unknown
  coverImage?: unknown
  readTime?: unknown
  published?: unknown
  featured?: unknown
  tags?: unknown
}

export function parseTagNames(value: unknown): string[] | null {
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === "string")
  ) {
    return null
  }

  return Array.from(
    new Set(value.map((item) => item.trim()).filter((item) => item.length > 0))
  )
}

export function parseReadTime(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return 0
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 240) return null
  return Math.floor(parsed)
}

export function parseContentPayload(payload: ContentPayload) {
  if (typeof payload.title !== "string" || payload.title.trim().length === 0) {
    return {
      ok: false as const,
      error: "title is required and must be a non-empty string.",
    }
  }

  const title = payload.title.trim()
  const content = asRequiredString(payload.content)
  if (!content) {
    return {
      ok: false as const,
      error: "content is required and must be a non-empty string.",
    }
  }

  if (typeof payload.published !== "boolean") {
    return {
      ok: false as const,
      error: "published is required and must be a boolean.",
    }
  }

  if (typeof payload.featured !== "boolean") {
    return {
      ok: false as const,
      error: "featured is required and must be a boolean.",
    }
  }

  const slug = slugify(title)
  if (!slug) {
    return {
      ok: false as const,
      error: "slug cannot be empty after formatting title.",
    }
  }

  const readTime = parseReadTime(payload.readTime)
  if (readTime === null) {
    return {
      ok: false as const,
      error: "readTime must be a number between 0 and 240.",
    }
  }

  const tags = parseTagNames(payload.tags)
  if (!tags || tags.length === 0) {
    return {
      ok: false as const,
      error: "tags is required and must include at least one non-empty string.",
    }
  }

  return {
    ok: true as const,
    data: {
      title,
      slug,
      description: asOptionalString(payload.description),
      content,
      coverImage: asOptionalString(payload.coverImage),
      readTime,
      published: payload.published,
      featured: payload.featured,
      tags,
    },
  }
}
