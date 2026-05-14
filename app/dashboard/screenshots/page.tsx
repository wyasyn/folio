import Link from "next/link"
import { ScreenshotGridImage } from "@/components/dashboard/admin/screenshot-grid-image"
import { ScreenshotPhotoNavLink } from "@/components/dashboard/admin/screenshot-photo-nav-link"
import { ScreenshotRowActions } from "@/components/dashboard/admin/screenshot-row-actions"
import { ADMIN_SCREENSHOT_GALLERY_LIMIT } from "@/lib/admin-screenshot-gallery"
import db from "@/lib/db"
import { requireAdmin } from "@/lib/authz"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"

export default async function ScreenshotsPage() {
  await requireAdmin()
  const section = getDashboardSectionById("screenshots")
  const screenshots = await db.screenshot.findMany({
    orderBy: { updatedAt: "desc" },
    take: ADMIN_SCREENSHOT_GALLERY_LIMIT,
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

      {screenshots.length === 0 ? (
        <p className="text-sm text-muted-foreground">No screenshots yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {screenshots.map((screenshot) => {
            const ownerLabel =
              screenshot.Project.user.name ?? screenshot.Project.user.email
            const updatedLabel = screenshot.updatedAt.toLocaleDateString(
              undefined,
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              },
            )

            return (
              <article
                key={screenshot.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground "
              >
                <ScreenshotPhotoNavLink
                  href={`/photo/${screenshot.id}`}
                  scroll={false}
                  transitionTypes={["nav-forward"]}
                  className="relative isolate block aspect-4/3 w-full shrink-0 cursor-zoom-in overflow-hidden bg-muted/40 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Open full-size screenshot for ${screenshot.Project.title}`}
                >
                  <ScreenshotGridImage
                    screenshotId={screenshot.id}
                    src={screenshot.url}
                    alt={`Screenshot for ${screenshot.Project.title}`}
                  />
                </ScreenshotPhotoNavLink>
                <div className="flex flex-1 flex-col gap-3 p-3">
                  <div className="min-h-0 flex-1 space-y-1">
                    <Link
                      href={`/dashboard/projects/${screenshot.Project.id}/edit`}
                      className="line-clamp-2 font-medium leading-snug underline-offset-4 hover:underline"
                    >
                      {screenshot.Project.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        Owner
                      </span>
                      {" · "}
                      {ownerLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        Updated
                      </span>
                      {" · "}
                      {updatedLabel}
                    </p>
                  </div>
                  <div className="flex items-center justify-end border-t border-border pt-2">
                    <ScreenshotRowActions screenshotId={screenshot.id} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
