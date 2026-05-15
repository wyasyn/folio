import { ProjectScreenshotDialog } from "@/components/portfolio/project-screenshot-viewer"
import { loadProjectScreenshotPhotoView } from "@/lib/public/project-screenshot-photo"

type ModalProps = {
  params: Promise<{ slug: string; screenshotId: string }>
}

export default async function ProjectScreenshotModal({ params }: ModalProps) {
  const { slug, screenshotId } = await params
  const data = await loadProjectScreenshotPhotoView(slug, screenshotId)
  return <ProjectScreenshotDialog data={data} />
}
