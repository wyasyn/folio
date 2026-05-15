import { ContentForm } from "@/components/dashboard/content/content-form"
import db from "@/lib/db"
import { getDashboardSession } from "@/lib/authz"

export default async function NewPostPage() {
  const session = await getDashboardSession()
  const tags = await db.tag.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  })

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-4xl font-semibold text-foreground">Create Post</h1>
        <p className="text-sm text-muted-foreground">
          Add a long-form article with rich content, tags, and a cover image.
        </p>
      </div>
      <ContentForm
        kind="posts"
        mode="create"
        userId={session.user.id}
        tagOptions={tags.map((tag) => tag.name)}
      />
    </section>
  )
}
