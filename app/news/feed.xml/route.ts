import { buildRssResponse } from "@/lib/rss"
import { getPublishedNewsList } from "@/lib/public/news"
import { siteConfig } from "@/lib/site-config"

export const revalidate = 3600

export async function GET() {
  const items = await getPublishedNewsList()
  const siteUrl = siteConfig.siteUrl

  return buildRssResponse({
    channelTitle: `${siteConfig.name} — News`,
    channelLink: `${siteUrl}/news`,
    channelDescription: siteConfig.tagline,
    selfHref: `${siteUrl}/news/feed.xml`,
    items: items.map((item) => ({
      title: item.title,
      link: `${siteUrl}/news/${item.slug}`,
      pubDate: item.updatedAt,
      description: item.description,
    })),
  })
}
