import Link from "next/link"
import { Suspense } from "react"
import { PostsListContent } from "@/components/portfolio/blog/posts-list-content"
import { ContentListGridSkeleton } from "@/components/portfolio/skeletons/content-list-grid-skeleton"
import { siteConfig } from "@/lib/site-config"
import { createPageMetadata } from "@/lib/seo/metadata"

export const revalidate = 3600

export const metadata = createPageMetadata({
  title: "Blog",
  description: "Articles on web development, design, and building products.",
  path: "/blog",
  alternates: {
    types: {
      "application/rss+xml": `${siteConfig.siteUrl}/feed.xml`,
    },
  },
})

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-24">
      <header className="mb-10 space-y-2">
       
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl md:text-7xl italic tracking-tight">Blog</h1>
          <Link
            href="/feed.xml"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            RSS feed
          </Link>
        </div>
        <p>
          Here you can find all of my blog posts.
        </p>
      </header>
      <Suspense fallback={<ContentListGridSkeleton count={6} />}>
        <PostsListContent />
      </Suspense>
    </main>
  )
}
