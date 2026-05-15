import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { getPublishedProjects } from "@/lib/public/projects"

type ProjectsListContentProps = {
  featuredOnly?: boolean
  emptyMessage?: string
}

export async function ProjectsListContent({
  featuredOnly = false,
  emptyMessage = "No projects published yet.",
}: ProjectsListContentProps) {
  const projects = await getPublishedProjects()
  const items = featuredOnly
    ? projects.filter((project) => project.featured).slice(0, 3)
    : projects

  if (featuredOnly && items.length === 0) {
    return null
  }

  return (
    <ContentListGrid
      items={items.map((project) => ({
        id: project.id,
        href: `/projects/${project.slug}`,
        title: project.title,
        description: project.description,
        coverImage: project.coverImage,
        meta:
          project.TechStack.length > 0
            ? project.TechStack.map((stack) => stack.name).join(" · ")
            : undefined,
      }))}
      emptyMessage={emptyMessage}
    />
  )
}
