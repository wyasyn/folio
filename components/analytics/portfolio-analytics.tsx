"use client"

import dynamic from "next/dynamic"
import { PageViewTracker } from "@/components/analytics/page-view-tracker"

const PostHogProvider = dynamic(
  () =>
    import("@/components/analytics/posthog-provider").then(
      (mod) => mod.PostHogProvider
    ),
  { ssr: false }
)

export function PortfolioAnalytics() {
  return (
    <>
      <PageViewTracker />
      <PostHogProvider />
    </>
  )
}
