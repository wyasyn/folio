import { getDashboardSectionById } from "@/lib/dashboard-navigation"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export default function ProjectsPage() {
  const projectsSection = getDashboardSectionById("projects")

  return (
    <section className="space-y-4">
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
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-medium text-foreground">Project Queue</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No pending updates yet. Add a project to start building your showcase.
        </p>
      </div>
    </section>
  )
}
