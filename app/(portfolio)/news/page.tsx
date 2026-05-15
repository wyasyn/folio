import Link from "next/link"
import { Suspense } from "react"
import { NewsListContent } from "@/components/portfolio/news/news-list-content"
import { ContentListGridSkeleton } from "@/components/portfolio/skeletons/content-list-grid-skeleton"
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

export default function NewsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 space-y-2">
        
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">News</h1>
          <Link
            href="/news/feed.xml"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            RSS feed
          </Link>
        </div>
        <p>
          Here you can find all of my news.
        </p>
      </header>
      <Suspense fallback={<ContentListGridSkeleton count={6} />}>
        <NewsListContent />
      </Suspense>
    </main>
  )
}
