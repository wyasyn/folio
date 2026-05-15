import { NewProjectForm } from "@/components/dashboard/projects/new-project-form"
import db from "@/lib/db"
import { getDashboardSession } from "@/lib/authz"

export default async function NewProjectPage() {
  const session = await getDashboardSession()

  const techStacks = await db.techStack.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  })

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-4xl font-semibold text-foreground">Create Project</h1>
        <p className="text-sm text-muted-foreground">
          Add a polished project entry with rich content, tech stacks, and a
          cover image for your portfolio.
        </p>
      </div>
      <NewProjectForm
        userId={session.user.id}
        techStackOptions={techStacks.map((techStack) => techStack.name)}
      />
    </section>
  )
}
