import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { PortfolioLink } from "@/components/portfolio/portfolio-link"
import { getPublishedProjects } from "@/lib/public/projects"

export async function FeaturedProjectsSection() {
  const projects = await getPublishedProjects()
  const featured = projects.filter((project) => project.featured).slice(0, 3)

  if (featured.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl md:text-4xl">Featured projects</h2>
        <PortfolioLink
          href="/projects"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </PortfolioLink>
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
    </div>
  )
}
