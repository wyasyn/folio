import { ContentDataTable } from "@/components/dashboard/content/content-data-table"
import { getDashboardSession, isAdmin } from "@/lib/authz"
import { DEFAULT_PAGE_SIZE, getPostsPage } from "@/lib/posts-queries"

type PostsListProps = {
  page: number
}

export async function PostsList({ page }: PostsListProps) {
  const session = await getDashboardSession()
  const admin = isAdmin(session.user)
  const {
    posts,
    totalPages,
    total,
    page: resolvedPage,
  } = await getPostsPage(session.user.id, page, DEFAULT_PAGE_SIZE, {
    includeAll: admin,
  })

  return (
    <ContentDataTable
      kind="posts"
      rows={posts}
      page={resolvedPage}
      totalPages={totalPages}
      total={total}
      showOwner={admin}
    />
  )
}
