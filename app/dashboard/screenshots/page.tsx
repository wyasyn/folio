import Link from "next/link"
import { ScreenshotRowActions } from "@/components/dashboard/admin/screenshot-row-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import db from "@/lib/db"
import { requireAdmin } from "@/lib/authz"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"

export default async function ScreenshotsPage() {
  await requireAdmin()
  const section = getDashboardSectionById("screenshots")
  const screenshots = await db.screenshot.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      url: true,
      updatedAt: true,
      Project: {
        select: {
          id: true,
          title: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  })

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {section.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and remove project gallery screenshots across all users.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Screenshot</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {screenshots.map((screenshot) => (
            <TableRow key={screenshot.id}>
              <TableCell className="max-w-[320px] truncate">
                <Link
                  href={screenshot.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  {screenshot.url}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/projects/${screenshot.Project.id}/edit`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {screenshot.Project.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {screenshot.Project.user.name ?? screenshot.Project.user.email}
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                {screenshot.updatedAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                <ScreenshotRowActions screenshotId={screenshot.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
