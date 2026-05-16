import type { AnalyticsResourceType } from "@/generated/prisma/client"

export type { AnalyticsResourceType }

export type PageViewPayload = {
  path: string
  resourceType: AnalyticsResourceType
  resourceId?: string | null
  slug?: string | null
  sessionKey: string
  deviceType?: string | null
}

export const ANALYTICS_RESOURCE_TYPES = [
  "home",
  "profile",
  "blog",
  "blog_post",
  "project",
  "news",
  "news_item",
  "contact",
  "uses",
  "other",
] as const satisfies readonly AnalyticsResourceType[]

export function isAnalyticsResourceType(
  value: unknown
): value is AnalyticsResourceType {
  return (
    typeof value === "string" &&
    (ANALYTICS_RESOURCE_TYPES as readonly string[]).includes(value)
  )
}
