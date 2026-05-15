import { unstable_cache } from "next/cache"
import db from "@/lib/db"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import { sanitizeMapEmbedUrl } from "@/lib/contact-map"
import { formatPhoneDisplay, formatPhoneTel } from "@/lib/phone"
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

export type ContactInfo = {
  phone: string | null
  phoneTel: string | null
  email: string | null
  address: string | null
  hours: string | null
  mapEmbedUrl: string | null
}

const contactInfoSelect = {
  publicEmail: true,
  publicPhone: true,
  location: true,
  contactHours: true,
  mapEmbedUrl: true,
} as const

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

function buildContactInfo(user: {
  publicEmail: string | null
  publicPhone: string | null
  location: string | null
  contactHours: string | null
  mapEmbedUrl: string | null
} | null): ContactInfo {
  if (!user) {
    return {
      phone: null,
      phoneTel: null,
      email: null,
      address: null,
      hours: null,
      mapEmbedUrl: null,
    }
  }

  const rawPhone = user.publicPhone?.trim() || null

  return {
    phone: formatPhoneDisplay(rawPhone),
    phoneTel: formatPhoneTel(rawPhone),
    email: user.publicEmail?.trim() || null,
    address: user.location?.trim() || null,
    hours: user.contactHours?.trim() || null,
    mapEmbedUrl: sanitizeMapEmbedUrl(user.mapEmbedUrl),
  }
}

async function fetchOwnerContactUser() {
  return siteConfig.ownerUserId
    ? db.user.findUnique({
        where: { id: siteConfig.ownerUserId },
        select: contactInfoSelect,
      })
    : db.user.findFirst({
        orderBy: { createdAt: "asc" },
        select: contactInfoSelect,
      })
}

export const getContactInfo = unstable_cache(
  async (): Promise<ContactInfo> => {
    const user = await fetchOwnerContactUser()
    return buildContactInfo(user)
  },
  ["contact-info"],
  {
    tags: [CACHE_TAGS.siteProfile],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  },
)

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
