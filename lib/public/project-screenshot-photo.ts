import { notFound } from "next/navigation"
import db from "@/lib/db"
import type { ProjectScreenshotPhotoPayload } from "@/lib/public/project-screenshot-types"

export type { ProjectScreenshotPhotoPayload } from "@/lib/public/project-screenshot-types"
export { projectScreenshotHref } from "@/lib/public/project-screenshot-types"

async function getProjectScreenshotNav(
  projectId: number,
  screenshotId: number,
) {
  const rows = await db.screenshot.findMany({
    where: { projectId },
    orderBy: { id: "asc" },
    select: { id: true },
  })
  const ids = rows.map((r) => r.id)
  const idx = ids.indexOf(screenshotId)
  if (idx === -1) {
    return { newerId: null, olderId: null }
  }
  return {
    newerId: idx > 0 ? ids[idx - 1]! : null,
    olderId: idx < ids.length - 1 ? ids[idx + 1]! : null,
  }
}

export async function loadProjectScreenshotPhotoView(
  projectSlug: string,
  screenshotIdParam: string,
): Promise<ProjectScreenshotPhotoPayload> {
  const screenshotId = Number.parseInt(screenshotIdParam, 10)
  if (!Number.isFinite(screenshotId) || screenshotId < 1) {
    notFound()
  }

  const screenshot = await db.screenshot.findFirst({
    where: {
      id: screenshotId,
      Project: { slug: projectSlug, published: true },
    },
    select: {
      id: true,
      url: true,
      updatedAt: true,
      projectId: true,
      Project: { select: { slug: true, title: true } },
    },
  })

  if (!screenshot) {
    notFound()
  }

  const nav = await getProjectScreenshotNav(screenshot.projectId, screenshot.id)

  return {
    id: screenshot.id,
    url: screenshot.url,
    updatedAt: screenshot.updatedAt.toISOString(),
    project: {
      slug: screenshot.Project.slug,
      title: screenshot.Project.title,
    },
    newerId: nav.newerId,
    olderId: nav.olderId,
  }
}
