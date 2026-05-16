import type { AnalyticsResourceType } from "@/lib/analytics/types"
import db from "@/lib/db"

export async function resolveResourceId(
  resourceType: AnalyticsResourceType,
  slug: string | null | undefined
): Promise<string | null> {
  if (!slug?.trim()) return null

  switch (resourceType) {
    case "blog_post": {
      const post = await db.post.findUnique({
        where: { slug },
        select: { id: true },
      })
      return post ? String(post.id) : null
    }
    case "project": {
      const project = await db.project.findUnique({
        where: { slug },
        select: { id: true },
      })
      return project ? String(project.id) : null
    }
    case "news_item": {
      const item = await db.news.findUnique({
        where: { slug },
        select: { id: true },
      })
      return item ? String(item.id) : null
    }
    default:
      return null
  }
}
