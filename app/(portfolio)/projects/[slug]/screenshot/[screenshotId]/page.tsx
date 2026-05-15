import { ProjectScreenshotPageClient } from "@/components/portfolio/project-screenshot-viewer"
import { loadProjectScreenshotPhotoView } from "@/lib/public/project-screenshot-photo"

export const revalidate = 3600
export const dynamicParams = true

type PageProps = {
  params: Promise<{ slug: string; screenshotId: string }>
}

export default async function ProjectScreenshotPage({ params }: PageProps) {
  const { slug, screenshotId } = await params
  const data = await loadProjectScreenshotPhotoView(slug, screenshotId)
  return <ProjectScreenshotPageClient data={data} />
}
