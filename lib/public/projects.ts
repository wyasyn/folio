import { unstable_cache } from "next/cache"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import db from "@/lib/db"

export const getPublishedProjectSlugs = unstable_cache(
  async () =>
    db.project.findMany({
      where: { published: true },
      select: { slug: true },
      orderBy: { updatedAt: "desc" },
    }),
  ["published-project-slugs"],
  { tags: [CACHE_TAGS.projects], revalidate: PUBLIC_REVALIDATE_SECONDS }
)

export const getPublishedProjects = unstable_cache(
  async () =>
    db.project.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverImage: true,
        featured: true,
        liveUrl: true,
        githubUrl: true,
        updatedAt: true,
        createdAt: true,
        TechStack: { select: { name: true } },
      },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    }),
  ["published-projects-list"],
  { tags: [CACHE_TAGS.projects], revalidate: PUBLIC_REVALIDATE_SECONDS }
)

export function getPublishedProjectBySlug(slug: string) {
  return unstable_cache(
    async () =>
      db.project.findFirst({
        where: { slug, published: true },
        include: {
          TechStack: { select: { name: true } },
          screenshots: {
            select: { id: true, url: true },
            orderBy: { id: "asc" },
          },
          user: { select: { name: true, image: true } },
        },
      }),
    ["published-project", slug],
    {
      tags: [CACHE_TAGS.projects, CACHE_TAGS.project(slug)],
      revalidate: PUBLIC_REVALIDATE_SECONDS,
    }
  )()
}

const relatedProjectSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  coverImage: true,
  TechStack: { select: { name: true } },
} as const

export function getRelatedProjectsBySlug(slug: string, limit = 3) {
  return unstable_cache(
    async () => {
      const current = await db.project.findFirst({
        where: { slug, published: true },
        select: { TechStack: { select: { name: true } } },
      })

      if (!current) {
        return []
      }

      const stackNames = current.TechStack.map((stack) => stack.name)

      let related =
        stackNames.length > 0
          ? await db.project.findMany({
              where: {
                published: true,
                slug: { not: slug },
                TechStack: { some: { name: { in: stackNames } } },
              },
              select: relatedProjectSelect,
              orderBy: { updatedAt: "desc" },
              take: limit,
            })
          : []

      if (related.length < limit) {
        const existingSlugs = new Set([slug, ...related.map((project) => project.slug)])
        const fallback = await db.project.findMany({
          where: {
            published: true,
            slug: { notIn: [...existingSlugs] },
          },
          select: relatedProjectSelect,
          orderBy: { updatedAt: "desc" },
          take: limit - related.length,
        })
        related = [...related, ...fallback]
      }

      return related
    },
    ["related-projects", slug, String(limit)],
    {
      tags: [CACHE_TAGS.projects, CACHE_TAGS.project(slug)],
      revalidate: PUBLIC_REVALIDATE_SECONDS,
    }
  )()
}
