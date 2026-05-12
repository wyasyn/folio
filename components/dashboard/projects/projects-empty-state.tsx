import Link from "next/link"
import { IconFolderPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <IconFolderPlus className="size-6 text-muted-foreground" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className="text-lg font-medium text-foreground">No projects yet</h2>
        <p className="text-sm text-muted-foreground">
          Add your first project to build your showcase. You can publish when you
          are ready.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard/projects/new">
          <IconFolderPlus data-icon="inline-start" />
          New project
        </Link>
      </Button>
    </div>
  )
}
