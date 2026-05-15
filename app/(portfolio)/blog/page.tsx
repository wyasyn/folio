import Link from "next/link"
import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { getPublishedPosts } from "@/lib/public/posts"
import { siteConfig } from "@/lib/site-config"

export const revalidate = 3600

export const metadata = {
  title: "Blog",
  alternates: {
    types: {
      "application/rss+xml": `${siteConfig.siteUrl}/feed.xml`,
    },
  },
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 space-y-2">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Home
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <Link
            href="/feed.xml"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            RSS feed
          </Link>
        </div>
      </header>
      <ContentListGrid
        items={posts.map((post) => ({
          id: post.id,
          href: `/blog/${post.slug}`,
          title: post.title,
          description: post.description,
          coverImage: post.coverImage,
          meta: post.readTime > 0 ? `${post.readTime} min read` : undefined,
        }))}
        emptyMessage="No posts published yet."
      />
    </main>
  )
}
