import Link from "next/link"
import { notFound } from "next/navigation"
import { ProjectScreenshotGrid } from "@/components/portfolio/project-screenshot-grid"
import { CloudinaryImage } from "@/components/ui/cloudinary-image"
import { MarkdownBody } from "@/components/dashboard/content/markdown-body"
import {
  getPublishedProjectBySlug,
  getPublishedProjectSlugs,
} from "@/lib/public/projects"

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
  return {
    title: project.title,
    description: project.description,
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getPublishedProjectBySlug(slug)
  if (!project) notFound()

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/projects"
        className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Projects
      </Link>
      <article className="space-y-8">
        {project.coverImage ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border">
            <CloudinaryImage
              src={project.coverImage}
              alt=""
              preset="cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        ) : null}
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {project.title}
          </h1>
          <p className="text-lg text-muted-foreground">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.TechStack.map((stack) => (
              <span
                key={stack.name}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium"
              >
                {stack.name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Live site
              </a>
            ) : null}
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                GitHub
              </a>
            ) : null}
          </div>
        </header>
        <ProjectScreenshotGrid
          projectSlug={project.slug}
          projectTitle={project.title}
          screenshots={project.screenshots}
        />
        <MarkdownBody markdown={project.content} />
      </article>
    </main>
  )
}
