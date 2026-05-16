import Link from "next/link"
import { Suspense } from "react"
import { JsonLd } from "@/components/seo/json-ld"
import { ProjectDetailArticle } from "@/components/portfolio/projects/project-detail-article"
import { RelatedProjects } from "@/components/portfolio/projects/related-projects"
import { BlogPostDetailSkeleton } from "@/components/portfolio/skeletons/blog-post-detail-skeleton"
import { ContentListGridSkeleton } from "@/components/portfolio/skeletons/content-list-grid-skeleton"
import {
  getPublishedProjectBySlug,
  getPublishedProjectSlugs,
} from "@/lib/public/projects"
import { createContentJsonLd } from "@/lib/seo/json-ld"
import { createContentMetadata } from "@/lib/seo/metadata"
import { IconArrowLeft } from "@tabler/icons-react"

export const revalidate = 3600
export const dynamicParams = true

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const rows = await getPublishedProjectSlugs()
  return rows.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const project = await getPublishedProjectBySlug(slug)
  if (!project) return { title: "Project not found" }
  return createContentMetadata({
    type: "project",
    title: project.title,
    description: project.description,
    path: `/projects/${slug}`,
    coverImage: project.coverImage,
    publishedAt: project.createdAt,
    modifiedAt: project.updatedAt,
  })
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getPublishedProjectBySlug(slug)

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {project ? (
        <JsonLd
          data={createContentJsonLd({
            type: "project",
            title: project.title,
            description: project.description,
            path: `/projects/${slug}`,
            coverImage: project.coverImage,
            publishedAt: project.createdAt,
            modifiedAt: project.updatedAt,
            authorName: project.user.name,
          })}
        />
      ) : null}
      <Link
        href="/projects"
        className="mb-8 gap-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft data-icon="inline-start" /> Projects
      </Link>
      <Suspense fallback={<BlogPostDetailSkeleton />}>
        <ProjectDetailArticle slug={slug} />
      </Suspense>
      <Suspense fallback={<ContentListGridSkeleton count={3} className="mt-16" />}>
        <RelatedProjects slug={slug} />
      </Suspense>
    </main>
  )
}
