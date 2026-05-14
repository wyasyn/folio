import type { AdminScreenshotDetail } from "@/lib/admin-screenshot-detail"
import type { AdminScreenshotGalleryNav } from "@/lib/admin-screenshot-gallery"

export type ScreenshotPhotoViewerPayload = {
  id: number
  url: string
  updatedAt: string
  project: {
    id: number
    title: string
    ownerLabel: string
  }
  newerId: number | null
  olderId: number | null
}

export function serializeScreenshotPhotoPayload(
  detail: AdminScreenshotDetail,
  nav: AdminScreenshotGalleryNav,
): ScreenshotPhotoViewerPayload {
  return {
    id: detail.id,
    url: detail.url,
    updatedAt: detail.updatedAt.toISOString(),
    project: detail.project,
    newerId: nav.newerId,
    olderId: nav.olderId,
  }
}
