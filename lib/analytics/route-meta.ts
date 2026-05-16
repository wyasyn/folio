import type { AnalyticsResourceType } from "@/lib/analytics/types"

export type RouteMeta = {
  path: string
  resourceType: AnalyticsResourceType
  slug?: string
}

export function resolveRouteMeta(pathname: string): RouteMeta {
  const path = pathname.split("?")[0]?.replace(/\/+$/, "") || "/"
  const normalized = path === "" ? "/" : path

  if (normalized === "/") {
    return { path: normalized, resourceType: "home" }
  }

  if (normalized === "/blog") {
    return { path: normalized, resourceType: "blog" }
  }

  if (normalized.startsWith("/blog/")) {
    const slug = normalized.slice("/blog/".length)
    if (slug) {
      return { path: normalized, resourceType: "blog_post", slug }
    }
  }

  if (normalized === "/projects") {
    return { path: normalized, resourceType: "project" }
  }

  if (normalized.startsWith("/projects/")) {
    const rest = normalized.slice("/projects/".length)
    const slug = rest.split("/")[0]
    if (slug) {
      return { path: normalized, resourceType: "project", slug }
    }
  }

  if (normalized === "/news") {
    return { path: normalized, resourceType: "news" }
  }

  if (normalized.startsWith("/news/")) {
    const slug = normalized.slice("/news/".length)
    if (slug) {
      return { path: normalized, resourceType: "news_item", slug }
    }
  }

  if (normalized === "/contact") {
    return { path: normalized, resourceType: "contact" }
  }

  if (normalized === "/uses") {
    return { path: normalized, resourceType: "uses" }
  }

  return { path: normalized, resourceType: "other" }
}

export function isTrackablePath(pathname: string): boolean {
  const path = pathname.split("?")[0] || "/"
  if (path.startsWith("/dashboard")) return false
  if (path.startsWith("/api")) return false
  if (path.startsWith("/_next")) return false
  return true
}
