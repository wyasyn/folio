import { unstable_cache } from "next/cache"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import db from "@/lib/db"

export const getPublishedPostSlugs = unstable_cache(
  async () =>
    db.post.findMany({
      where: { published: true },
      select: { slug: true },
      orderBy: { updatedAt: "desc" },
    }),
  ["published-post-slugs"],
  { tags: [CACHE_TAGS.posts], revalidate: PUBLIC_REVALIDATE_SECONDS }
)

export const getPublishedPosts = unstable_cache(
  async () =>
    db.post.findMany({
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
  ["published-posts-list"],
  { tags: [CACHE_TAGS.posts], revalidate: PUBLIC_REVALIDATE_SECONDS }
)

export function getPublishedPostBySlug(slug: string) {
  return unstable_cache(
    async () =>
      db.post.findFirst({
        where: { slug, published: true },
        include: {
          Tag: { select: { name: true } },
          user: { select: { name: true, image: true } },
        },
      }),
    ["published-post", slug],
    {
      tags: [CACHE_TAGS.posts, CACHE_TAGS.post(slug)],
      revalidate: PUBLIC_REVALIDATE_SECONDS,
    }
  )()
}

const relatedPostSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  coverImage: true,
  readTime: true,
} as const

export function getRelatedPostsBySlug(slug: string, limit = 3) {
  return unstable_cache(
    async () => {
      const current = await db.post.findFirst({
        where: { slug, published: true },
        select: { Tag: { select: { name: true } } },
      })

      if (!current) {
        return []
      }

      const tagNames = current.Tag.map((tag) => tag.name)
      const excludeSlug = { not: slug }

      let related =
        tagNames.length > 0
          ? await db.post.findMany({
              where: {
                published: true,
                slug: excludeSlug,
                Tag: { some: { name: { in: tagNames } } },
              },
              select: relatedPostSelect,
              orderBy: { updatedAt: "desc" },
              take: limit,
            })
          : []

      if (related.length < limit) {
        const existingSlugs = new Set([slug, ...related.map((post) => post.slug)])
        const fallback = await db.post.findMany({
          where: {
            published: true,
            slug: { notIn: [...existingSlugs] },
          },
          select: relatedPostSelect,
          orderBy: { updatedAt: "desc" },
          take: limit - related.length,
        })
        related = [...related, ...fallback]
      }

      return related
    },
    ["related-posts", slug, String(limit)],
    {
      tags: [CACHE_TAGS.posts, CACHE_TAGS.post(slug)],
      revalidate: PUBLIC_REVALIDATE_SECONDS,
    }
  )()
}
