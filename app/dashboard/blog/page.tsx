import { getDashboardSectionById } from "@/lib/dashboard-navigation"

export default function BlogPage() {
  const blogSection = getDashboardSectionById("blog")

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {blogSection.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          Create, edit, and publish technical articles for your portfolio blog.
        </p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-medium text-foreground">Editorial Pipeline</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You currently have no drafts in progress. Start a new post when
          you&apos;re ready to publish.
        </p>
      </div>
    </section>
  )
}
