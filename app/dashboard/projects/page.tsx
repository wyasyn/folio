import { Suspense } from "react"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"
import { ProjectsList } from "@/components/dashboard/projects/projects-list"
import { ProjectsTableSkeleton } from "@/components/dashboard/projects/projects-table-skeleton"

type ProjectsPageProps = {
  searchParams: Promise<{ page?: string }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams
  const rawPage = Number.parseInt(params.page ?? "1", 10)
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1

  const projectsSection = getDashboardSectionById("projects")

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {projectsSection.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your portfolio projects, update case studies, and control what
          gets featured on your public site.
        </p>
      </div>
      <div className="flex items-center justify-end">
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <IconPlus data-icon="inline-start" />
            New Project
          </Link>
        </Button>
      </div>
      <Suspense key={page} fallback={<ProjectsTableSkeleton />}>
        <ProjectsList page={page} />
      </Suspense>
    </section>
  )
}
