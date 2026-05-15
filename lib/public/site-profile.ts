import { unstable_cache } from "next/cache"
import db from "@/lib/db"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import { siteConfig } from "@/lib/site-config"

export type SiteSocialLink = {
  kind: "website" | "github" | "linkedin" | "twitter" | "email"
  href: string
  label: string
}

export type SiteProfile = {
  name: string
  title: string
  tagline: string
  image: string | null
  bio: string | null
  socialLinks: SiteSocialLink[]
}

const userSelect = {
  name: true,
  jobTitle: true,
  tagline: true,
  image: true,
  bio: true,
  website: true,
  github: true,
  linkedin: true,
  twitter: true,
  publicEmail: true,
} as const

function buildSocialLinks(user: {
  website: string | null
  github: string | null
  linkedin: string | null
  twitter: string | null
  publicEmail: string | null
} | null): SiteSocialLink[] {
  if (!user) return []

  const links: SiteSocialLink[] = []

  const website = user.website?.trim()
  if (website) {
    links.push({ kind: "website", href: website, label: "Website" })
  }

  const github = user.github?.trim()
  if (github) {
    links.push({ kind: "github", href: github, label: "GitHub" })
  }

  const linkedin = user.linkedin?.trim()
  if (linkedin) {
    links.push({ kind: "linkedin", href: linkedin, label: "LinkedIn" })
  }

  const twitter = user.twitter?.trim()
  if (twitter) {
    links.push({ kind: "twitter", href: twitter, label: "X" })
  }

  const publicEmail = user.publicEmail?.trim()
  if (publicEmail) {
    links.push({
      kind: "email",
      href: `mailto:${publicEmail}`,
      label: "Email",
    })
  }

  return links
}

export const getSiteProfile = unstable_cache(
  async (): Promise<SiteProfile> => {
    const user = siteConfig.ownerUserId
      ? await db.user.findUnique({
          where: { id: siteConfig.ownerUserId },
          select: userSelect,
        })
      : await db.user.findFirst({
          orderBy: { createdAt: "asc" },
          select: userSelect,
        })

    return {
      name: user?.name?.trim() || siteConfig.name,
      title: user?.jobTitle?.trim() || siteConfig.title,
      tagline: user?.tagline?.trim() || siteConfig.tagline,
      image: user?.image ?? null,
      bio: user?.bio ?? null,
      socialLinks: buildSocialLinks(user),
    }
  },
  ["site-profile"],
  {
    tags: [CACHE_TAGS.siteProfile],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  },
)
