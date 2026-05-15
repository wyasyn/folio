import { buildRssResponse } from "@/lib/rss"
import { getPublishedPosts } from "@/lib/public/posts"
import { siteConfig } from "@/lib/site-config"

export const revalidate = 3600

export async function GET() {
  const posts = await getPublishedPosts()
  const siteUrl = siteConfig.siteUrl

  return buildRssResponse({
    channelTitle: `${siteConfig.name} — Blog`,
    channelLink: `${siteUrl}/blog`,
    channelDescription: siteConfig.tagline,
    selfHref: `${siteUrl}/feed.xml`,
    items: posts.map((post) => ({
      title: post.title,
      link: `${siteUrl}/blog/${post.slug}`,
      pubDate: post.updatedAt,
      description: post.description,
    })),
  })
}
