import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { PortfolioLink } from "@/components/portfolio/portfolio-link"
import { getPublishedNewsList } from "@/lib/public/news"

export async function FeaturedNewsSection() {
  const items = await getPublishedNewsList()
  const featured = items.filter((item) => item.featured).slice(0, 3)

  if (featured.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl md:text-4xl">Featured news</h2>
        <PortfolioLink
          href="/news"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </PortfolioLink>
      </div>
      <ContentListGrid
        items={featured.map((item) => ({
          id: item.id,
          href: `/news/${item.slug}`,
          title: item.title,
          description: item.description,
          coverImage: item.coverImage,
        }))}
      />
    </div>
  )
}
