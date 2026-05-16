import type { MetadataRoute } from "next"
import { unstable_cache } from "next/cache"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import db from "@/lib/db"
import { type DateLike, toDate } from "@/lib/seo/dates"
import { absoluteUrl } from "@/lib/seo/urls"

type SitemapRow = {
  slug: string
  updatedAt: DateLike
  coverImage: string | null
}

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: absoluteUrl("/projects"), changeFrequency: "weekly", priority: 0.8 },
  { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.8 },
  { url: absoluteUrl("/news"), changeFrequency: "weekly", priority: 0.8 },
  { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
  { url: absoluteUrl("/uses"), changeFrequency: "monthly", priority: 0.5 },
]

function toContentEntries(
  rows: SitemapRow[],
  pathPrefix: "/blog" | "/projects" | "/news",
): MetadataRoute.Sitemap {
  return rows.map((row) => ({
    url: absoluteUrl(`${pathPrefix}/${row.slug}`),
    lastModified: toDate(row.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    ...(row.coverImage ? { images: [row.coverImage] } : {}),
  }))
}

const getSitemapRows = unstable_cache(
  async () => {
    const [posts, projects, news] = await Promise.all([
      db.post.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, coverImage: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.project.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, coverImage: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.news.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, coverImage: true },
        orderBy: { updatedAt: "desc" },
      }),
    ])

    return {
      posts,
      projects,
      news,
    }
  },
  ["sitemap-entries"],
  {
    tags: [
      CACHE_TAGS.sitemap,
      CACHE_TAGS.posts,
      CACHE_TAGS.projects,
      CACHE_TAGS.news,
    ],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  },
)

export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const { posts, projects, news } = await getSitemapRows()

  return [
    ...STATIC_ROUTES,
    ...toContentEntries(posts, "/blog"),
    ...toContentEntries(projects, "/projects"),
    ...toContentEntries(news, "/news"),
  ]
}
