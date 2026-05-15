export type ProjectScreenshotPhotoPayload = {
  id: number
  url: string
  updatedAt: string
  project: {
    slug: string
    title: string
  }
  newerId: number | null
  olderId: number | null
}

export function projectScreenshotHref(projectSlug: string, screenshotId: number) {
  return `/projects/${projectSlug}/screenshot/${screenshotId}`
}
