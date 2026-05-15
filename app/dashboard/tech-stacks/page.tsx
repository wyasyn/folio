import { CatalogManager } from "@/components/dashboard/admin/catalog-manager"
import db from "@/lib/db"
import { requireAdmin } from "@/lib/authz"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"

export default async function TechStacksPage() {
  await requireAdmin()
  const section = getDashboardSectionById("tech-stacks")
  const techStacks = await db.techStack.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: { select: { Project: true } },
    },
  })

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl lg:text-4xl font-semibold text-foreground">
          {section.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          Maintain the project tech stack catalog. Stacks in use cannot be
          deleted.
        </p>
      </div>
      <CatalogManager
        title="Tech stacks"
        itemName="tech stack"
        endpoint="/api/admin/tech-stacks"
        countLabel="projects"
        items={techStacks.map((techStack) => ({
          id: techStack.id,
          name: techStack.name,
          count: techStack._count.Project,
        }))}
      />
    </section>
  )
}
