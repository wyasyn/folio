import { NewProjectForm } from "@/components/dashboard/projects/new-project-form"
import db from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function NewProjectPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/login")
  }

  const techStacks = await db.techStack.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  })

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl text-foreground">Create Project</h1>
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
