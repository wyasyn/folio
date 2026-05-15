import Link from "next/link"
import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { getPublishedPosts } from "@/lib/public/posts"

export async function FeaturedPostsSection() {
  const posts = await getPublishedPosts()
  const featured = posts.filter((post) => post.featured).slice(0, 3)

  if (featured.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Featured posts</h2>
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>
      <ContentListGrid
        items={featured.map((post) => ({
          id: post.id,
          href: `/blog/${post.slug}`,
          title: post.title,
          description: post.description,
          coverImage: post.coverImage,
        }))}
      />
    </section>
  )
}
