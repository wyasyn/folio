import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { getPublishedNewsList } from "@/lib/public/news"

type NewsListContentProps = {
  featuredOnly?: boolean
  emptyMessage?: string
}

export async function NewsListContent({
  featuredOnly = false,
  emptyMessage = "No news published yet.",
}: NewsListContentProps) {
  const items = await getPublishedNewsList()
  const filtered = featuredOnly
    ? items.filter((item) => item.featured).slice(0, 3)
    : items

  if (featuredOnly && filtered.length === 0) {
    return null
  }

  return (
    <ContentListGrid
      items={filtered.map((item) => ({
        id: item.id,
        href: `/news/${item.slug}`,
        title: item.title,
        description: item.description,
        coverImage: item.coverImage,
        meta: item.readTime > 0 ? `${item.readTime} min read` : undefined,
      }))}
      emptyMessage={emptyMessage}
    />
  )
}
