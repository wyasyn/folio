import Link from "next/link"
import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { getPublishedNewsList } from "@/lib/public/news"

export async function FeaturedNewsSection() {
  const items = await getPublishedNewsList()
  const featured = items.filter((item) => item.featured).slice(0, 3)

  if (featured.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Featured news</h2>
        <Link href="/news" className="text-sm text-muted-foreground hover:text-foreground">
          View all
        </Link>
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
    </section>
  )
}
