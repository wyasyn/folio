import { CatalogManager } from "@/components/dashboard/admin/catalog-manager"
import db from "@/lib/db"
import { requireAdmin } from "@/lib/authz"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"

export default async function TagsPage() {
  await requireAdmin()
  const section = getDashboardSectionById("tags")
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: { select: { Post: true, News: true } },
    },
  })

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl lg:text-4xl font-semibold text-foreground">
          {section.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage reusable tags for posts and news. Tags in use cannot be
          deleted.
        </p>
      </div>
      <CatalogManager
        title="Tags"
        itemName="tag"
        endpoint="/api/admin/tags"
        countLabel="uses"
        items={tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          count: tag._count.Post + tag._count.News,
        }))}
      />
    </section>
  )
}
