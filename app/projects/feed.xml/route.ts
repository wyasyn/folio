import { buildRssResponse } from "@/lib/rss"
import { getPublishedProjects } from "@/lib/public/projects"
import { siteConfig } from "@/lib/site-config"

export const revalidate = 3600

export async function GET() {
  const projects = await getPublishedProjects()
  const siteUrl = siteConfig.siteUrl

  return buildRssResponse({
    channelTitle: `${siteConfig.name} — Projects`,
    channelLink: `${siteUrl}/projects`,
    channelDescription: siteConfig.tagline,
    selfHref: `${siteUrl}/projects/feed.xml`,
    items: projects.map((project) => ({
      title: project.title,
      link: `${siteUrl}/projects/${project.slug}`,
      pubDate: project.updatedAt,
      description: project.description,
    })),
  })
}
