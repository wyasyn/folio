import { ScreenshotPhotoPageClient } from "@/components/dashboard/admin/screenshot-photo-viewer"
import { loadAdminScreenshotPhotoView } from "@/lib/admin-screenshot-photo-view"

type PhotoPageProps = {
  params: Promise<{ screenshotId: string }>
}

export default async function ScreenshotPhotoPage({ params }: PhotoPageProps) {
  const { screenshotId } = await params
  const data = await loadAdminScreenshotPhotoView(screenshotId)
  return <ScreenshotPhotoPageClient data={data} />
}
