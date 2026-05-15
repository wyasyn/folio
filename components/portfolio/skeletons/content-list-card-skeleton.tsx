import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type ContentListCardSkeletonProps = {
  className?: string
}

export function ContentListCardSkeleton({ className }: ContentListCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[22rem] flex-col overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <Skeleton className="aspect-[16/10] w-full shrink-0 rounded-none" />
      <div className="flex min-h-[8.5rem] flex-1 flex-col gap-2 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
