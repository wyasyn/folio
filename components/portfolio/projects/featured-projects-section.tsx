import Link from "next/link"
import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { getPublishedProjects } from "@/lib/public/projects"

export async function FeaturedProjectsSection() {
  const projects = await getPublishedProjects()
  const featured = projects.filter((project) => project.featured).slice(0, 3)

  if (featured.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Featured projects</h2>
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>
      <ContentListGrid
        items={featured.map((project) => ({
          id: project.id,
          href: `/projects/${project.slug}`,
          title: project.title,
          description: project.description,
          coverImage: project.coverImage,
        }))}
      />
    </section>
  )
}
