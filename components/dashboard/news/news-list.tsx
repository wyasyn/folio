import { ContentDataTable } from "@/components/dashboard/content/content-data-table"
import { getDashboardSession, isAdmin } from "@/lib/authz"
import { DEFAULT_PAGE_SIZE, getNewsPage } from "@/lib/news-queries"

type NewsListProps = {
  page: number
}

export async function NewsList({ page }: NewsListProps) {
  const session = await getDashboardSession()
  const admin = isAdmin(session.user)
  const {
    news,
    totalPages,
    total,
    page: resolvedPage,
  } = await getNewsPage(session.user.id, page, DEFAULT_PAGE_SIZE, {
    includeAll: admin,
  })

  return (
    <ContentDataTable
      kind="news"
      rows={news}
      page={resolvedPage}
      totalPages={totalPages}
      total={total}
      showOwner={admin}
    />
  )
}
