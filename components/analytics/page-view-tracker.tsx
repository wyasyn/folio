"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { isTrackablePath, resolveRouteMeta } from "@/lib/analytics/route-meta"
import { trackPageView } from "@/lib/analytics/track-page-view"

export function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || !isTrackablePath(pathname)) return
    if (lastTracked.current === pathname) return
    lastTracked.current = pathname

    const meta = resolveRouteMeta(pathname)
    trackPageView(meta)
  }, [pathname])

  return null
}
