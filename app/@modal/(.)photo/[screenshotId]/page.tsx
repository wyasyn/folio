import { ScreenshotPhotoDialog } from "@/components/dashboard/admin/screenshot-photo-viewer"
import { loadAdminScreenshotPhotoView } from "@/lib/admin-screenshot-photo-view"

type ModalProps = {
  params: Promise<{ screenshotId: string }>
}

export default async function ScreenshotPhotoModal({
  params,
}: ModalProps) {
  const { screenshotId } = await params
  const data = await loadAdminScreenshotPhotoView(screenshotId)
  return <ScreenshotPhotoDialog data={data} />
}
