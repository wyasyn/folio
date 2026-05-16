import { siteConfig } from "@/lib/site-config"

export function absoluteUrl(path = ""): string {
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : ""
  return `${siteConfig.siteUrl}${normalizedPath}`
}

export function canonicalUrl(path: string): string {
  return absoluteUrl(path)
}
