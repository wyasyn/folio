import { Suspense } from "react"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"
import { ContentTableSkeleton } from "@/components/dashboard/content/content-table-skeleton"
import { PostsList } from "@/components/dashboard/posts/posts-list"
import { Button } from "@/components/ui/button"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"

type PostsPageProps = {
  searchParams: Promise<{ page?: string }>
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams
  const rawPage = Number.parseInt(params.page ?? "1", 10)
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
  const section = getDashboardSectionById("posts")

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl lg:text-4xl font-semibold text-foreground">
          {section.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          Draft, publish, and feature long-form writing for your portfolio.
        </p>
      </div>
      <div className="flex items-center justify-end">
        <Button asChild>
          <Link href="/dashboard/posts/new">
            <IconPlus data-icon="inline-start" />
            New Post
          </Link>
        </Button>
      </div>
      <Suspense key={page} fallback={<ContentTableSkeleton />}>
        <PostsList page={page} />
      </Suspense>
    </section>
  )
}
