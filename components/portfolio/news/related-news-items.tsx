import { RelatedContentSection } from "@/components/portfolio/related-content-section"
import { getRelatedNewsBySlug } from "@/lib/public/news"

type RelatedNewsItemsProps = {
  slug: string
}

export async function RelatedNewsItems({ slug }: RelatedNewsItemsProps) {
  const items = await getRelatedNewsBySlug(slug)

  return (
    <RelatedContentSection
      title="Related news"
      items={items.map((item) => ({
        id: item.id,
        href: `/news/${item.slug}`,
        title: item.title,
        description: item.description,
        coverImage: item.coverImage,
        meta: item.readTime > 0 ? `${item.readTime} min read` : undefined,
      }))}
    />
  )
}
