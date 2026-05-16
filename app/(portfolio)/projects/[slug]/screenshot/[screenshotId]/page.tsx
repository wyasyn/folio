import { ProjectScreenshotPageClient } from "@/components/portfolio/project-screenshot-viewer"
import { loadProjectScreenshotPhotoView } from "@/lib/public/project-screenshot-photo"
import { createNoIndexMetadata } from "@/lib/seo/metadata"

export const revalidate = 3600
export const dynamicParams = true

export const metadata = createNoIndexMetadata("Screenshot")

type PageProps = {
  params: Promise<{ slug: string; screenshotId: string }>
}

export default async function ProjectScreenshotPage({ params }: PageProps) {
  const { slug, screenshotId } = await params
  const data = await loadProjectScreenshotPhotoView(slug, screenshotId)
  return <ProjectScreenshotPageClient data={data} />
}
