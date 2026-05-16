import type { NextRequest } from "next/server"

export function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    null
  )
}

export function getCountryFromRequest(request: NextRequest): string | null {
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("cloudfront-viewer-country")
  if (!country || country === "XX" || country.length !== 2) return null
  return country.toUpperCase()
}

export function normalizeReferrer(referrer: string | null): string | null {
  if (!referrer?.trim()) return null
  try {
    const url = new URL(referrer)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (siteUrl) {
      const siteHost = new URL(siteUrl).host
      if (url.host === siteHost) return null
    }
    return url.origin
  } catch {
    return null
  }
}

export function coarseDeviceType(userAgent: string | null): string | null {
  if (!userAgent) return null
  if (/tablet|ipad/i.test(userAgent)) return "tablet"
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile"
  return "desktop"
}
