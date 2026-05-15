import {
  ContentListGrid,
  type ContentListGridItem,
} from "@/components/portfolio/content-list-grid"

type RelatedContentSectionProps = {
  title: string
  items: ContentListGridItem[]
}

export function RelatedContentSection({ title, items }: RelatedContentSectionProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="mt-16 space-y-6 border-t border-border pt-12">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <ContentListGrid items={items} className="sm:grid-cols-1 lg:grid-cols-3" />
    </section>
  )
}
