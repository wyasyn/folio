import type { RouteMeta } from "@/lib/analytics/route-meta"

const SESSION_STORAGE_KEY = "folio_analytics_session"

export function getOrCreateClientSessionKey(): string {
  if (typeof window === "undefined") return ""
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (existing) return existing
    const key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem(SESSION_STORAGE_KEY, key)
    return key
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }
}

function coarseDeviceType(): string | null {
  if (typeof navigator === "undefined") return null
  const ua = navigator.userAgent
  if (/tablet|ipad/i.test(ua)) return "tablet"
  if (/mobile|iphone|android/i.test(ua)) return "mobile"
  return "desktop"
}

export function trackPageView(meta: RouteMeta): void {
  if (typeof window === "undefined") return

  const sessionKey = getOrCreateClientSessionKey()
  if (!sessionKey) return

  const payload = {
    path: meta.path,
    resourceType: meta.resourceType,
    slug: meta.slug ?? null,
    sessionKey,
    deviceType: coarseDeviceType(),
  }

  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" })
    const sent = navigator.sendBeacon("/api/analytics/page-view", blob)
    if (sent) return
  }

  void fetch("/api/analytics/page-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  })
}
