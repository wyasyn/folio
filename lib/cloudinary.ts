export type CloudinaryImagePreset =
  | "cover"
  | "screenshot"
  | "avatar"
  | "markdown"
  | "full"

const PRESET_TRANSFORMS: Record<CloudinaryImagePreset, string> = {
  cover: "f_webp,q_auto:good,c_limit,w_1600",
  screenshot: "f_webp,q_auto:good,c_limit,w_1200",
  avatar: "f_webp,q_auto:good,c_fill,w_256,h_256",
  markdown: "f_webp,q_auto:good,c_limit,w_960",
  full: "f_webp,q_auto:good",
}

const BLUR_TRANSFORM = "f_webp,q_20,w_16,e_blur:1000"

const CLOUDINARY_HOST = "res.cloudinary.com"

const UNSPLASH_HOST = "images.unsplash.com"

/** Shown instantly while a real blur is fetched (Next.js requires a data URL). */
export const DEFAULT_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDAQ4OD08NGxQUFjM3ODdwWFtYWFtYWFtYWFtYWFtYWFtYWFtYWFtYWFtYWFtYWFtYWFtYWFtYWFtYWFtYWFtYWFp//wgARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGvAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"

export function isCloudinaryUrl(url: string): boolean {
  try {
    return new URL(url).hostname === CLOUDINARY_HOST
  } catch {
    return false
  }
}

/** Insert transformation segment after `/image/upload/` (or `/video/upload/`). */
function withCloudinaryTransform(url: string, transform: string): string {
  const uploadMarker = "/upload/"
  const index = url.indexOf(uploadMarker)
  if (index === -1) return url

  const prefix = url.slice(0, index + uploadMarker.length)
  const rest = url.slice(index + uploadMarker.length)

  // Skip if transform already applied at start of rest
  if (rest.startsWith(transform)) return url

  return `${prefix}${transform}/${rest}`
}

export function cloudinaryUrl(
  url: string | null | undefined,
  preset: CloudinaryImagePreset = "full"
): string {
  if (!url?.trim()) return ""
  if (!isCloudinaryUrl(url)) return url

  return withCloudinaryTransform(url, PRESET_TRANSFORMS[preset])
}

export function cloudinaryBlurUrl(url: string | null | undefined): string {
  if (!url?.trim()) return ""
  if (!isCloudinaryUrl(url)) return ""

  return withCloudinaryTransform(url, BLUR_TRANSFORM)
}

export function isOptimizableImageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === CLOUDINARY_HOST || host === UNSPLASH_HOST
  } catch {
    return false
  }
}

/** Low-resolution URL used to build a `blurDataURL` data URI. */
export function tinyImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return ""
  if (isCloudinaryUrl(url)) return cloudinaryBlurUrl(url)

  try {
    const parsed = new URL(url)
    if (parsed.hostname !== UNSPLASH_HOST) return ""
    parsed.searchParams.set("w", "16")
    parsed.searchParams.set("q", "20")
    parsed.searchParams.set("auto", "format")
    return parsed.toString()
  } catch {
    return ""
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64")
  }
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

/** Fetches a tiny preview and returns a base64 data URL for `next/image` blur placeholders. */
export async function fetchBlurDataUrl(
  url: string | null | undefined,
): Promise<string> {
  const tiny = tinyImageUrl(url)
  if (!tiny) return DEFAULT_BLUR_DATA_URL

  try {
    const res = await fetch(tiny, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    })
    if (!res.ok) return DEFAULT_BLUR_DATA_URL
    const contentType =
      res.headers.get("content-type")?.split(";")[0]?.trim() || "image/webp"
    const base64 = arrayBufferToBase64(await res.arrayBuffer())
    return `data:${contentType};base64,${base64}`
  } catch {
    return DEFAULT_BLUR_DATA_URL
  }
}

/** Eager transformation applied at upload time (signed with upload params). */
export const CLOUDINARY_UPLOAD_EAGER = "c_limit,w_2000/q_auto:good/f_webp"

export const PRESET_DIMENSIONS: Record<
  CloudinaryImagePreset,
  { width: number; height: number }
> = {
  cover: { width: 1600, height: 900 },
  screenshot: { width: 1200, height: 800 },
  avatar: { width: 256, height: 256 },
  markdown: { width: 960, height: 540 },
  full: { width: 2000, height: 1200 },
}
