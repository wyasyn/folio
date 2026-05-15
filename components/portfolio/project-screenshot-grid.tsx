import { ScreenshotGridImage } from "@/components/dashboard/admin/screenshot-grid-image"
import { ScreenshotPhotoNavLink } from "@/components/dashboard/admin/screenshot-photo-nav-link"
import { projectScreenshotHref } from "@/lib/public/project-screenshot-types"

type ProjectScreenshotGridProps = {
  projectSlug: string
  projectTitle: string
  screenshots: Array<{ id: number; url: string }>
}

export function ProjectScreenshotGrid({
  projectSlug,
  projectTitle,
  screenshots,
}: ProjectScreenshotGridProps) {
  if (screenshots.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Screenshots</h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {screenshots.map((shot) => (
          <li key={shot.id}>
            <ScreenshotPhotoNavLink
              href={projectScreenshotHref(projectSlug, shot.id)}
              scroll={false}
              transitionTypes={["nav-forward"]}
              className="relative isolate block aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-lg border border-border bg-muted/40 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Open screenshot for ${projectTitle}`}
            >
              <ScreenshotGridImage
                screenshotId={shot.id}
                src={shot.url}
                alt={`Screenshot for ${projectTitle}`}
              />
            </ScreenshotPhotoNavLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
