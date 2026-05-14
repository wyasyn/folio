import db from "@/lib/db"

export type AdminScreenshotDetail = {
  id: number
  url: string
  updatedAt: Date
  project: {
    id: number
    title: string
    ownerLabel: string
  }
}

export async function getAdminScreenshotDetail(
  screenshotId: number,
): Promise<AdminScreenshotDetail | null> {
  const screenshot = await db.screenshot.findFirst({
    where: { id: screenshotId },
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
  if (!screenshot) return null
  return {
    id: screenshot.id,
    url: screenshot.url,
    updatedAt: screenshot.updatedAt,
    project: {
      id: screenshot.Project.id,
      title: screenshot.Project.title,
      ownerLabel:
        screenshot.Project.user.name ?? screenshot.Project.user.email,
    },
  }
}
