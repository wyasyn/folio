import { ContentListCard } from "@/components/portfolio/content-list-card"
import { cn } from "@/lib/utils"

export type ContentListGridItem = {
  id: number
  href: string
  title: string
  description?: string | null
  coverImage?: string | null
  meta?: string
}

type ContentListGridProps = {
  items: ContentListGridItem[]
  emptyMessage?: string
  className?: string
}

export function ContentListGrid({
  items,
  emptyMessage = "Nothing published yet.",
  className,
}: ContentListGridProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <ul
      className={cn(
        "grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.id} className="min-h-0">
          <ContentListCard
            href={item.href}
            title={item.title}
            description={item.description}
            coverImage={item.coverImage}
            meta={item.meta}
          />
        </li>
      ))}
    </ul>
  )
}
