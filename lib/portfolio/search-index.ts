import { unstable_cache } from "next/cache"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import { normalizeStoredContentToMarkdown } from "@/lib/content-markdown"
import db from "@/lib/db"
import { portfolioNavItems } from "@/lib/portfolio-nav"
import { getSiteProfile } from "@/lib/public/site-profile"
import { stripMarkdownForSearch } from "@/lib/portfolio/strip-markdown"
import type { PortfolioSearchItem } from "@/lib/portfolio/search-types"
import { usesCategories } from "@/lib/uses-data"

async function buildSearchIndex(): Promise<PortfolioSearchItem[]> {
  const [profile, posts, news, projects] = await Promise.all([
    getSiteProfile(),
    db.post.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        content: true,
        Tag: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.news.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        content: true,
        tags: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.project.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        content: true,
        TechStack: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  const items: PortfolioSearchItem[] = []

  for (const nav of portfolioNavItems) {
    items.push({
      id: `page:${nav.href}`,
      type: "page",
      title: nav.label,
      href: nav.href,
      keywords: [nav.label, ...(nav.keywords ?? []), nav.href].join(" "),
    })
  }

  items.push({
    id: "site:profile",
    type: "site",
    title: profile.name,
    subtitle: profile.title,
    href: "/",
    keywords: [
      profile.name,
      profile.title,
      profile.tagline,
      profile.bio ?? "",
      "about",
      "profile",
      "portfolio",
    ].join(" "),
  })

  if (profile.bio) {
    items.push({
      id: "site:bio",
      type: "site",
      title: `About ${profile.name}`,
      subtitle: "Bio",
      href: "/",
      keywords: [profile.bio, profile.name, "bio", "about"].join(" "),
    })
  }

  for (const post of posts) {
    const body = stripMarkdownForSearch(
      normalizeStoredContentToMarkdown(post.content),
    )
    const tags = post.Tag.map((t) => t.name).join(" ")
    items.push({
      id: `post:${post.id}`,
      type: "post",
      title: post.title,
      subtitle: post.description ?? undefined,
      href: `/blog/${post.slug}`,
      keywords: [
        post.title,
        post.description ?? "",
        body,
        tags,
        "blog",
        "post",
        "article",
      ].join(" "),
    })
  }

  for (const item of news) {
    const body = stripMarkdownForSearch(
      normalizeStoredContentToMarkdown(item.content),
    )
    const tags = item.tags.map((t) => t.name).join(" ")
    items.push({
      id: `news:${item.id}`,
      type: "news",
      title: item.title,
      subtitle: item.description ?? undefined,
      href: `/news/${item.slug}`,
      keywords: [
        item.title,
        item.description ?? "",
        body,
        tags,
        "news",
        "update",
      ].join(" "),
    })
  }

  for (const project of projects) {
    const body = stripMarkdownForSearch(
      normalizeStoredContentToMarkdown(project.content),
    )
    const stacks = project.TechStack.map((s) => s.name).join(" ")
    items.push({
      id: `project:${project.id}`,
      type: "project",
      title: project.title,
      subtitle: project.description,
      href: `/projects/${project.slug}`,
      keywords: [
        project.title,
        project.description,
        body,
        stacks,
        "project",
        "work",
      ].join(" "),
    })
  }

  for (const category of usesCategories) {
    for (const useItem of category.items) {
      items.push({
        id: `uses:${category.title}:${useItem.name}`,
        type: "uses",
        title: useItem.name,
        subtitle: category.title,
        href: "/uses",
        keywords: [
          useItem.name,
          useItem.description ?? "",
          category.title,
          "uses",
          "tools",
          "setup",
        ].join(" "),
      })
    }
  }

  return items
}

export const getPortfolioSearchIndex = unstable_cache(
  buildSearchIndex,
  ["portfolio-search-index"],
  {
    tags: [
      CACHE_TAGS.searchIndex,
      CACHE_TAGS.posts,
      CACHE_TAGS.news,
      CACHE_TAGS.projects,
      CACHE_TAGS.siteProfile,
    ],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  },
)
