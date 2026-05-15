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
