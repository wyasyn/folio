import { type DateLike, toIsoDateString } from "@/lib/seo/dates"
import { siteConfig } from "@/lib/site-config"
import { absoluteUrl } from "@/lib/seo/urls"

export function createWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
  }
}

type ContentJsonLdInput = {
  type: "article" | "project" | "news"
  title: string
  description: string
  path: string
  coverImage?: string | null
  publishedAt: DateLike
  modifiedAt: DateLike
  authorName?: string | null
}

export function createContentJsonLd(input: ContentJsonLdInput) {
  const url = absoluteUrl(input.path)
  const image = input.coverImage ?? undefined

  const base = {
    headline: input.title,
    description: input.description,
    url,
    image,
    datePublished: toIsoDateString(input.publishedAt),
    dateModified: toIsoDateString(input.modifiedAt),
    author: input.authorName
      ? { "@type": "Person" as const, name: input.authorName }
      : { "@type": "Person" as const, name: siteConfig.name },
    publisher: {
      "@type": "Organization" as const,
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  }

  if (input.type === "article") {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      ...base,
    }
  }

  if (input.type === "news") {
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      ...base,
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    ...base,
  }
}
