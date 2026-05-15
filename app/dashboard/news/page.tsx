import { Suspense } from "react"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"
import { ContentTableSkeleton } from "@/components/dashboard/content/content-table-skeleton"
import { NewsList } from "@/components/dashboard/news/news-list"
import { Button } from "@/components/ui/button"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"

type NewsPageProps = {
  searchParams: Promise<{ page?: string }>
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams
  const rawPage = Number.parseInt(params.page ?? "1", 10)
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
  const section = getDashboardSectionById("news")

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl lg:text-4xl font-semibold text-foreground">
          {section.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage announcements, updates, launches, and short news entries.
        </p>
      </div>
      <div className="flex items-center justify-end">
        <Button asChild>
          <Link href="/dashboard/news/new">
            <IconPlus data-icon="inline-start" />
            New News
          </Link>
        </Button>
      </div>
      <Suspense key={page} fallback={<ContentTableSkeleton />}>
        <NewsList page={page} />
      </Suspense>
    </section>
  )
}
