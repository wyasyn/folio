import Link from "next/link"
import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { getPublishedNewsList } from "@/lib/public/news"
import { siteConfig } from "@/lib/site-config"

export const revalidate = 3600

export const metadata = {
  title: "News",
  alternates: {
    types: {
      "application/rss+xml": `${siteConfig.siteUrl}/news/feed.xml`,
    },
  },
}

export default async function NewsPage() {
  const items = await getPublishedNewsList()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 space-y-2">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Home
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">News</h1>
          <Link
            href="/news/feed.xml"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            RSS feed
          </Link>
        </div>
      </header>
      <ContentListGrid
        items={items.map((item) => ({
          id: item.id,
          href: `/news/${item.slug}`,
          title: item.title,
          description: item.description,
          coverImage: item.coverImage,
          meta: item.readTime > 0 ? `${item.readTime} min read` : undefined,
        }))}
        emptyMessage="No news published yet."
      />
    </main>
  )
}
