import Link from "next/link"
import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { getPublishedProjects } from "@/lib/public/projects"
import { siteConfig } from "@/lib/site-config"

export const revalidate = 3600

export const metadata = {
  title: "Projects",
  alternates: {
    types: {
      "application/rss+xml": `${siteConfig.siteUrl}/projects/feed.xml`,
    },
  },
}

export default async function ProjectsPage() {
  const projects = await getPublishedProjects()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 space-y-2">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Home
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <Link
            href="/projects/feed.xml"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            RSS feed
          </Link>
        </div>
      </header>
      <ContentListGrid
        items={projects.map((project) => ({
          id: project.id,
          href: `/projects/${project.slug}`,
          title: project.title,
          description: project.description,
          coverImage: project.coverImage,
          meta:
            project.TechStack.length > 0
              ? project.TechStack.map((s) => s.name).join(" · ")
              : undefined,
        }))}
        emptyMessage="No projects published yet."
      />
    </main>
  )
}
