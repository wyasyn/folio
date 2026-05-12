import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ProjectListRow } from "@/lib/projects-queries"
import { ProjectRowActions } from "@/components/dashboard/projects/project-row-actions"
import { ProjectsEmptyState } from "@/components/dashboard/projects/projects-empty-state"

type ProjectsDataTableProps = {
  projects: ProjectListRow[]
  page: number
  totalPages: number
  total: number
  showOwner?: boolean
}

function pageHref(p: number) {
  return p <= 1 ? "/dashboard/projects" : `/dashboard/projects?page=${p}`
}

export function ProjectsDataTable({
  projects,
  page,
  totalPages,
  total,
  showOwner = false,
}: ProjectsDataTableProps) {
  if (projects.length === 0) {
    return <ProjectsEmptyState />
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {total} project{total === 1 ? "" : "s"}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            {showOwner ? <TableHead>Owner</TableHead> : null}
            <TableHead>Slug</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Stacks</TableHead>
            <TableHead>Shots</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="max-w-[200px] truncate font-medium">
                {project.title}
              </TableCell>
              {showOwner ? (
                <TableCell className="max-w-[180px] truncate text-muted-foreground">
                  {project.ownerName ?? project.ownerEmail}
                </TableCell>
              ) : null}
              <TableCell className="max-w-[140px] truncate text-muted-foreground">
                {project.slug}
              </TableCell>
              <TableCell>
                <Badge variant={project.published ? "default" : "secondary"}>
                  {project.published ? "Live" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={project.featured ? "default" : "outline"}>
                  {project.featured ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {project._count.TechStack}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {project._count.screenshots}
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                {project.updatedAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                <ProjectRowActions
                  projectId={project.id}
                  title={project.title}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {page > 1 ? (
                <PaginationPrevious asChild>
                  <Link href={pageHref(page - 1)}>Previous</Link>
                </PaginationPrevious>
              ) : (
                <Button variant="ghost" size="sm" disabled>
                  Previous
                </Button>
              )}
            </PaginationItem>
            <PaginationItem>
              <span className="flex h-8 items-center px-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              {page < totalPages ? (
                <PaginationNext asChild>
                  <Link href={pageHref(page + 1)}>Next</Link>
                </PaginationNext>
              ) : (
                <Button variant="ghost" size="sm" disabled>
                  Next
                </Button>
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}
