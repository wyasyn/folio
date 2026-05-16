import type { Metadata } from "next"
import { type DateLike, toIsoDateString } from "@/lib/seo/dates"
import { siteConfig } from "@/lib/site-config"
import { canonicalUrl } from "@/lib/seo/urls"

const DEFAULT_OG_IMAGE = "/opengraph-image.png"

function normalizeTwitterHandle(handle: string | undefined) {
  if (!handle) return undefined
  return handle.startsWith("@") ? handle : `@${handle}`
}

function buildOgImages(coverImage?: string | null) {
  if (coverImage) {
    return [{ url: coverImage, width: 1200, height: 630, alt: "" }]
  }
  return [{ url: DEFAULT_OG_IMAGE }]
}

export function createSiteMetadata(): Metadata {
  const siteName = `${siteConfig.name} — ${siteConfig.title}`
  const twitterHandle = normalizeTwitterHandle(siteConfig.twitterHandle)

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.siteUrl }],
    creator: siteConfig.name,
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteConfig.siteUrl,
      siteName: siteConfig.name,
      title: siteName,
      description: siteConfig.description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteConfig.description,
      images: [DEFAULT_OG_IMAGE],
      ...(twitterHandle ? { creator: twitterHandle } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: siteConfig.siteUrl,
      types: {
        "application/rss+xml": `${siteConfig.siteUrl}/feed.xml`,
      },
    },
    icons: {
      icon: "/icon.png",
      apple: "/apple-icon.png",
    },
  }
}

type PageMetadataInput = {
  title: string
  description?: string
  path: string
  noIndex?: boolean
  alternates?: Metadata["alternates"]
}

export function createHomeMetadata(): Metadata {
  const siteName = `${siteConfig.name} — ${siteConfig.title}`
  return {
    ...createPageMetadata({
      title: "Home",
      description: siteConfig.description,
      path: "/",
    }),
    title: { absolute: siteName },
  }
}

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const description = input.description ?? siteConfig.description
  const url = canonicalUrl(input.path)

  return {
    title: input.title,
    description,
    alternates: {
      canonical: url,
      ...input.alternates,
    },
    openGraph: {
      type: "website",
      url,
      title: input.title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: buildOgImages(),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: buildOgImages().map((img) =>
        typeof img === "object" && "url" in img ? img.url : img,
      ),
    },
    ...(input.noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
  }
}

export type ContentMetadataInput = {
  type: "article" | "project" | "news"
  title: string
  description: string
  path: string
  coverImage?: string | null
  publishedAt: DateLike
  modifiedAt: DateLike
}

export function createContentMetadata(input: ContentMetadataInput): Metadata {
  const url = canonicalUrl(input.path)
  const ogType = input.type === "article" || input.type === "news" ? "article" : "website"
  const images = buildOgImages(input.coverImage)

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: ogType,
      url,
      title: input.title,
      description: input.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      publishedTime: toIsoDateString(input.publishedAt),
      modifiedTime: toIsoDateString(input.modifiedAt),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: images.map((img) => img.url),
    },
  }
}

export function createNoIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  }
}

export const portfolioOpenGraphDefaults = {
  siteName: siteConfig.name,
  locale: siteConfig.locale,
  type: "website" as const,
  description: siteConfig.description,
}

export const manifestThemeColor = "#3b82f6"
export const manifestBackgroundColor = "#ffffff"
