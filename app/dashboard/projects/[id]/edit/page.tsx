import { notFound, redirect } from "next/navigation"
import db from "@/lib/db"
import {
  ProjectForm,
  type ProjectFormInitial,
} from "@/components/dashboard/projects/project-form"
import { getDashboardSession, isAdmin } from "@/lib/authz"

type EditProjectPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id: idParam } = await params
  const projectId = Number.parseInt(idParam, 10)
  if (!Number.isFinite(projectId) || projectId < 1) {
    notFound()
  }

  const session = await getDashboardSession()
  if (!session?.user?.id) redirect("/login")
  const admin = isAdmin(session.user)

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      ...(admin ? {} : { userId: session.user.id }),
    },
    include: {
      TechStack: { select: { name: true } },
      screenshots: { select: { url: true }, orderBy: { createdAt: "asc" } },
    },
  })

  if (!project) {
    notFound()
  }

  const techStacks = await db.techStack.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  })

  const initial: ProjectFormInitial = {
    title: project.title,
    description: project.description,
    content: project.content,
    coverImage: project.coverImage ?? "",
    screenshots: project.screenshots.map((s) => s.url),
    liveUrl: project.liveUrl ?? "",
    githubUrl: project.githubUrl ?? "",
    published: project.published,
    featured: project.featured,
    techStacks: project.TechStack.map((t) => t.name),
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-4xl font-semibold text-foreground">Edit project</h1>
        <p className="text-sm text-muted-foreground">
          Update details, media, and visibility for this portfolio entry.
        </p>
      </div>
      <ProjectForm
        mode="edit"
        userId={session.user.id}
        techStackOptions={techStacks.map((t) => t.name)}
        projectId={project.id}
        initial={initial}
      />
    </section>
  )
}
