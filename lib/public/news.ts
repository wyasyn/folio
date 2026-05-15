import { unstable_cache } from "next/cache"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import db from "@/lib/db"

export const getPublishedNewsSlugs = unstable_cache(
  async () =>
    db.news.findMany({
      where: { published: true },
      select: { slug: true },
      orderBy: { updatedAt: "desc" },
    }),
  ["published-news-slugs"],
  { tags: [CACHE_TAGS.news], revalidate: PUBLIC_REVALIDATE_SECONDS }
)

export const getPublishedNewsList = unstable_cache(
  async () =>
    db.news.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverImage: true,
        featured: true,
        readTime: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    }),
  ["published-news-list"],
  { tags: [CACHE_TAGS.news], revalidate: PUBLIC_REVALIDATE_SECONDS }
)

export function getPublishedNewsBySlug(slug: string) {
  return unstable_cache(
    async () =>
      db.news.findFirst({
        where: { slug, published: true },
        include: {
          tags: { select: { name: true } },
          author: { select: { name: true, image: true } },
        },
      }),
    ["published-news-item", slug],
    {
      tags: [CACHE_TAGS.news, CACHE_TAGS.newsItem(slug)],
      revalidate: PUBLIC_REVALIDATE_SECONDS,
    }
  )()
}

const relatedNewsSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  coverImage: true,
  readTime: true,
} as const

export function getRelatedNewsBySlug(slug: string, limit = 3) {
  return unstable_cache(
    async () => {
      const current = await db.news.findFirst({
        where: { slug, published: true },
        select: { tags: { select: { name: true } } },
      })

      if (!current) {
        return []
      }

      const tagNames = current.tags.map((tag) => tag.name)
      const excludeSlug = { not: slug }

      let related =
        tagNames.length > 0
          ? await db.news.findMany({
              where: {
                published: true,
                slug: excludeSlug,
                tags: { some: { name: { in: tagNames } } },
              },
              select: relatedNewsSelect,
              orderBy: { updatedAt: "desc" },
              take: limit,
            })
          : []

      if (related.length < limit) {
        const existingSlugs = new Set([slug, ...related.map((item) => item.slug)])
        const fallback = await db.news.findMany({
          where: {
            published: true,
            slug: { notIn: [...existingSlugs] },
          },
          select: relatedNewsSelect,
          orderBy: { updatedAt: "desc" },
          take: limit - related.length,
        })
        related = [...related, ...fallback]
      }

      return related
    },
    ["related-news", slug, String(limit)],
    {
      tags: [CACHE_TAGS.news, CACHE_TAGS.newsItem(slug)],
      revalidate: PUBLIC_REVALIDATE_SECONDS,
    }
  )()
}
