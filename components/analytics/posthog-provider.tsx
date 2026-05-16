"use client"

import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect, useRef } from "react"
import { isTrackablePath, resolveRouteMeta } from "@/lib/analytics/route-meta"

let posthogInitialized = false

function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"

  if (!key || posthogInitialized) return false

  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
  })

  posthogInitialized = true
  return true
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastCaptured = useRef<string | null>(null)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
    if (!pathname || !isTrackablePath(pathname)) return

    const search = searchParams?.toString()
    const url = search ? `${pathname}?${search}` : pathname
    if (lastCaptured.current === url) return
    lastCaptured.current = url

    const meta = resolveRouteMeta(pathname)
    posthog.capture("$pageview", {
      $current_url: url,
      resource_type: meta.resourceType,
      slug: meta.slug ?? null,
    })
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = initPostHog()
  }, [])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
    </PHProvider>
  )
}
