import { Prisma } from "@/generated/prisma/client"
import db from "@/lib/db"
import { getRequestSession, isAdmin, unauthorizedResponse } from "@/lib/authz"
import {
  asOptionalString,
  asRequiredString,
  parseScreenshotUrls,
  parseTechStackNames,
  slugify,
} from "@/lib/project-payload"

type UpdateProjectPayload = {
  title?: unknown
  description?: unknown
  content?: unknown
  coverImage?: unknown
  liveUrl?: unknown
  githubUrl?: unknown
  published?: unknown
  featured?: unknown
  techStacks?: unknown
  screenshots?: unknown
}

async function requireProjectOwner(request: Request, projectId: number) {
  const session = await getRequestSession(request)

  if (!session) {
    return { error: unauthorizedResponse() }
  }

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      ...(isAdmin(session.user) ? {} : { userId: session.user.id }),
    },
    select: { id: true },
  })

  if (!project) {
    return { error: Response.json({ error: "Not found." }, { status: 404 }) }
  }

  return { session }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params
  const projectId = Number.parseInt(idParam, 10)
  if (!Number.isFinite(projectId) || projectId < 1) {
    return Response.json({ error: "Invalid project id." }, { status: 400 })
  }

  const authResult = await requireProjectOwner(request, projectId)
  if ("error" in authResult) return authResult.error

  let payload: UpdateProjectPayload
  try {
    payload = (await request.json()) as UpdateProjectPayload
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (typeof payload.title !== "string" || payload.title.trim().length === 0) {
    return Response.json(
      { error: "title is required and must be a non-empty string." },
      { status: 400 }
    )
  }

  const title = payload.title.trim()
  const description = asRequiredString(payload.description)
  const content = asRequiredString(payload.content)

  if (!description) {
    return Response.json(
      { error: "description is required and must be a non-empty string." },
      { status: 400 }
    )
  }

  if (!content) {
    return Response.json(
      { error: "content is required and must be a non-empty string." },
      { status: 400 }
    )
  }

  if (typeof payload.published !== "boolean") {
    return Response.json(
      { error: "published is required and must be a boolean." },
      { status: 400 }
    )
  }

  if (typeof payload.featured !== "boolean") {
    return Response.json(
      { error: "featured is required and must be a boolean." },
      { status: 400 }
    )
  }

  const published = payload.published
  const featured = payload.featured

  const slug = slugify(title)
  if (!slug) {
    return Response.json(
      { error: "slug cannot be empty after formatting title." },
      { status: 400 }
    )
  }

  const parsedTechStacks = parseTechStackNames(payload.techStacks)
  if (!parsedTechStacks || parsedTechStacks.length === 0) {
    return Response.json(
      {
        error:
          "techStacks is required and must include at least one non-empty string.",
      },
      { status: 400 }
    )
  }

  const screenshotsResult = parseScreenshotUrls(payload.screenshots)
  if (!screenshotsResult.ok) {
    return Response.json({ error: screenshotsResult.error }, { status: 400 })
  }
  const parsedScreenshotUrls = screenshotsResult.urls

  try {
    const existingTechStacks = await db.techStack.findMany({
      where: { name: { in: parsedTechStacks } },
      select: { id: true, name: true },
    })

    const existingByName = new Map(
      existingTechStacks.map((techStack) => [techStack.name, techStack.id])
    )

    const createNames = parsedTechStacks.filter(
      (name) => !existingByName.has(name)
    )

    const project = await db.$transaction(async (tx) => {
      for (const name of createNames) {
        await tx.techStack.create({
          data: { name, updatedAt: new Date() },
        })
      }

      const allStacks = await tx.techStack.findMany({
        where: { name: { in: parsedTechStacks } },
        select: { id: true, name: true },
      })
      const idByName = new Map(allStacks.map((t) => [t.name, t.id]))
      const orderedIds = parsedTechStacks.map((name) => idByName.get(name)!)

      return tx.project.update({
        where: { id: projectId },
        data: {
          title,
          slug,
          description,
          content,
          coverImage: asOptionalString(payload.coverImage),
          liveUrl: asOptionalString(payload.liveUrl),
          githubUrl: asOptionalString(payload.githubUrl),
          published,
          featured,
          updatedAt: new Date(),
          TechStack: {
            set: orderedIds.map((stackId) => ({ id: stackId })),
          },
          screenshots: {
            deleteMany: {},
            create: parsedScreenshotUrls.map((url) => ({ url })),
          },
        },
        include: {
          TechStack: true,
          screenshots: true,
        },
      })
    })

    return Response.json({ data: project })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "A project with this slug already exists." },
        { status: 409 }
      )
    }

    return Response.json(
      { error: "Unable to update project." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params
  const projectId = Number.parseInt(idParam, 10)
  if (!Number.isFinite(projectId) || projectId < 1) {
    return Response.json({ error: "Invalid project id." }, { status: 400 })
  }

  const authResult = await requireProjectOwner(request, projectId)
  if ("error" in authResult) return authResult.error

  try {
    await db.project.delete({
      where: { id: projectId },
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ error: "Not found." }, { status: 404 })
    }
    return Response.json(
      { error: "Unable to delete project." },
      { status: 500 }
    )
  }
}
