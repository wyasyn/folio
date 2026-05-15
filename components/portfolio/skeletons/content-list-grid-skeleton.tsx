import { cn } from "@/lib/utils"
import { ContentListCardSkeleton } from "@/components/portfolio/skeletons/content-list-card-skeleton"

type ContentListGridSkeletonProps = {
  count?: number
  className?: string
}

export function ContentListGridSkeleton({
  count = 3,
  className,
}: ContentListGridSkeletonProps) {
  return (
    <ul
      className={cn(
        "grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      aria-busy="true"
      aria-label="Loading content"
    >
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="min-h-0">
          <ContentListCardSkeleton />
        </li>
      ))}
    </ul>
  )
}
