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
