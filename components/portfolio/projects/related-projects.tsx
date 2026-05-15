import { RelatedContentSection } from "@/components/portfolio/related-content-section"
import { getRelatedProjectsBySlug } from "@/lib/public/projects"

type RelatedProjectsProps = {
  slug: string
}

export async function RelatedProjects({ slug }: RelatedProjectsProps) {
  const projects = await getRelatedProjectsBySlug(slug)

  return (
    <RelatedContentSection
      title="Related projects"
      items={projects.map((project) => ({
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
    />
  )
}
