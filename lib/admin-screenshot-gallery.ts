import db from "@/lib/db"

/** Same window as the admin screenshots grid (`/dashboard/screenshots`). */
export const ADMIN_SCREENSHOT_GALLERY_LIMIT = 100 as const

export type AdminScreenshotGalleryNav = {
  /** Newer screenshot (earlier index in `updatedAt` desc list). */
  newerId: number | null
  /** Older screenshot (later index in `updatedAt` desc list). */
  olderId: number | null
}

export async function getAdminScreenshotGalleryNav(
  screenshotId: number,
): Promise<AdminScreenshotGalleryNav> {
  const rows = await db.screenshot.findMany({
    orderBy: { updatedAt: "desc" },
    take: ADMIN_SCREENSHOT_GALLERY_LIMIT,
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
