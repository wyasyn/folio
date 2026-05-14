import { notFound } from "next/navigation"
import { getAdminScreenshotGalleryNav } from "@/lib/admin-screenshot-gallery"
import { getAdminScreenshotDetail } from "@/lib/admin-screenshot-detail"
import { serializeScreenshotPhotoPayload } from "@/lib/admin-screenshot-photo-payload"
import { requireAdmin } from "@/lib/authz"
import type { ScreenshotPhotoViewerPayload } from "@/lib/admin-screenshot-photo-payload"

export async function loadAdminScreenshotPhotoView(
  screenshotIdParam: string,
): Promise<ScreenshotPhotoViewerPayload> {
  await requireAdmin()
  const screenshotId = Number.parseInt(screenshotIdParam, 10)
  if (!Number.isFinite(screenshotId) || screenshotId < 1) {
    notFound()
  }

  const detail = await getAdminScreenshotDetail(screenshotId)
  if (!detail) {
    notFound()
  }

  const nav = await getAdminScreenshotGalleryNav(screenshotId)
  return serializeScreenshotPhotoPayload(detail, nav)
}
