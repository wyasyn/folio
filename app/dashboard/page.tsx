import { getDashboardSectionById } from "@/lib/dashboard-navigation"

export default function Page() {
  const overviewSection = getDashboardSectionById("overview")

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {overviewSection.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your portfolio at a glance: featured projects, recent blog
          drafts, and profile completion.
        </p>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Published Projects</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">08</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Published Blog Posts</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">14</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Profile Completion</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">92%</p>
        </div>
      </div>
      <div className="min-h-[360px] rounded-xl border bg-card p-6">
        <h2 className="text-lg font-medium text-foreground">Quick Actions</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Add a new project case study.</li>
          <li>Draft your next technical blog post.</li>
          <li>Update your bio and contact links.</li>
        </ul>
      </div>
    </section>
  )
}
