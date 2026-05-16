import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { PortfolioLink } from "@/components/portfolio/portfolio-link"
import { getPublishedPosts } from "@/lib/public/posts"

export async function FeaturedPostsSection() {
  const posts = await getPublishedPosts()
  const featured = posts.filter((post) => post.featured).slice(0, 3)

  if (featured.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl md:text-4xl ">Featured posts</h2>
        <PortfolioLink
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </PortfolioLink>
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
    </div>
  )
}
