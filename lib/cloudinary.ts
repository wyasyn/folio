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
