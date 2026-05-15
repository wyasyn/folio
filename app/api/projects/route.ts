import { Prisma } from "@/generated/prisma/client"
import { techStackRelationInputForCreate } from "@/lib/catalog-db"
import db from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidateProject } from "@/lib/revalidate-content"
import {
  asOptionalString,
  asRequiredString,
  parseScreenshotUrls,
  parseTechStackNames,
  slugify,
} from "@/lib/project-payload"

type CreateProjectPayload = {
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

export async function POST(request: Request) {
  let payload: CreateProjectPayload

  try {
    payload = (await request.json()) as CreateProjectPayload
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (typeof payload.title !== "string" || payload.title.trim().length === 0) {
    return Response.json(
      { error: "title is required and must be a non-empty string." },
      { status: 400 },
    )
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user?.id || typeof session.user.id !== "string") {
    return Response.json(
      { error: "Unauthorized." },
      { status: 401 },
    )
  }

  const title = payload.title.trim()
  const description = asRequiredString(payload.description)
  const content = asRequiredString(payload.content)

  if (!description) {
    return Response.json(
      { error: "description is required and must be a non-empty string." },
      { status: 400 },
    )
  }

  if (!content) {
    return Response.json(
      { error: "content is required and must be a non-empty string." },
      { status: 400 },
    )
  }

  if (typeof payload.published !== "boolean") {
    return Response.json(
      { error: "published is required and must be a boolean." },
      { status: 400 },
    )
  }

  const featured =
    typeof payload.featured === "boolean" ? payload.featured : false

  const slug = slugify(title)
  if (!slug) {
    return Response.json(
      { error: "slug cannot be empty after formatting title." },
      { status: 400 },
    )
  }

  const parsedTechStacks = parseTechStackNames(payload.techStacks)
  if (!parsedTechStacks || parsedTechStacks.length === 0) {
    return Response.json(
      {
        error:
          "techStacks is required and must include at least one non-empty string.",
      },
      { status: 400 },
    )
  }

  const screenshotsResult = parseScreenshotUrls(payload.screenshots)
  if (!screenshotsResult.ok) {
    return Response.json({ error: screenshotsResult.error }, { status: 400 })
  }
  const parsedScreenshotUrls = screenshotsResult.urls

  try {
    const techStackRelations =
      await techStackRelationInputForCreate(parsedTechStacks)

    const project = await db.project.create({
      data: {
        title,
        slug,
        userId: session.user.id,
        description,
        content,
        coverImage: asOptionalString(payload.coverImage),
        liveUrl: asOptionalString(payload.liveUrl),
        githubUrl: asOptionalString(payload.githubUrl),
        published: payload.published,
        featured,
        updatedAt: new Date(),
        TechStack: techStackRelations,
        screenshots: {
          create: parsedScreenshotUrls.map((url) => ({ url })),
        },
      },
      include: {
        TechStack: true,
        screenshots: true,
      },
    })

    revalidateProject(project.slug)
    return Response.json({ data: project }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "A project with this slug already exists." },
        { status: 409 },
      )
    }

    return Response.json(
      { error: "Unable to create project." },
      { status: 500 },
    )
  }
}
