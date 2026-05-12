import { DEFAULT_PAGE_SIZE, getProjectsPage } from "@/lib/projects-queries"
import { ProjectsDataTable } from "@/components/dashboard/projects/projects-data-table"
import { getDashboardSession, isAdmin } from "@/lib/authz"

type ProjectsListProps = {
  page: number
}

export async function ProjectsList({ page }: ProjectsListProps) {
  const session = await getDashboardSession()
  const admin = isAdmin(session.user)

  const {
    projects,
    totalPages,
    total,
    page: resolvedPage,
  } = await getProjectsPage(session.user.id, page, DEFAULT_PAGE_SIZE, {
    includeAll: admin,
  })

  return (
    <ProjectsDataTable
      projects={projects}
      page={resolvedPage}
      totalPages={totalPages}
      total={total}
      showOwner={admin}
    />
  )
}
