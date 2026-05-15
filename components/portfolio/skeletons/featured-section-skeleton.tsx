import { Skeleton } from "@/components/ui/skeleton"
import { ContentListGridSkeleton } from "@/components/portfolio/skeletons/content-list-grid-skeleton"

type FeaturedSectionSkeletonProps = {
  title: string
}

export function FeaturedSectionSkeleton({ title }: FeaturedSectionSkeletonProps) {
  return (
    <section className="space-y-6" aria-busy="true" aria-label={`Loading ${title}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-16" />
      </div>
      <ContentListGridSkeleton count={3} />
    </section>
  )
}
