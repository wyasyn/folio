import { Prisma } from "@/generated/prisma/client"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

const MAX_SCREENSHOTS = 20

type CreateProjectPayload = {
  title?: unknown
  description?: unknown
  content?: unknown
  coverImage?: unknown
  liveUrl?: unknown
  githubUrl?: unknown
  published?: unknown
  techStacks?: unknown
  screenshots?: unknown
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const asRequiredString = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const asOptionalString = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const parseScreenshotUrls = (
  value: unknown,
):
  | { ok: true; urls: string[] }
  | { ok: false; error: string } => {
  if (value === undefined || value === null) {
    return { ok: true, urls: [] }
  }
  if (!Array.isArray(value)) {
    return {
      ok: false,
      error: "screenshots must be an array of URL strings.",
    }
  }

  const urls: string[] = []
  const seen = new Set<string>()

  for (const item of value) {
    if (typeof item !== "string") {
      return {
        ok: false,
        error: "Every screenshot must be a non-empty https URL string.",
      }
    }
    const trimmed = item.trim()
    if (!trimmed) continue
    if (!trimmed.startsWith("https://")) {
      return {
        ok: false,
        error: "Every screenshot URL must use https.",
      }
    }
    if (seen.has(trimmed)) continue
    seen.add(trimmed)
    urls.push(trimmed)
    if (urls.length > MAX_SCREENSHOTS) {
      return {
        ok: false,
        error: `At most ${MAX_SCREENSHOTS} screenshots are allowed.`,
      }
    }
  }

  return { ok: true, urls }
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

  if ((session.user as { role?: string }).role !== "admin") {
    return Response.json(
      { error: "Forbidden." },
      { status: 403 },
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

  const slug = slugify(title)
  if (!slug) {
    return Response.json(
      { error: "slug cannot be empty after formatting title." },
      { status: 400 },
    )
  }

  const parsedTechStacks =
    Array.isArray(payload.techStacks) &&
    payload.techStacks.every((item) => typeof item === "string")
      ? Array.from(
          new Set(
            payload.techStacks
          .map((item) => item.trim())
              .filter((item) => item.length > 0),
          ),
        )
      : []

  if (parsedTechStacks.length === 0) {
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
    const existingTechStacks = await db.techStack.findMany({
      where: { name: { in: parsedTechStacks } },
      select: { id: true, name: true },
    })

    const existingByName = new Map(
      existingTechStacks.map((techStack) => [techStack.name, techStack.id]),
    )

    const connect = parsedTechStacks
      .filter((name) => existingByName.has(name))
      .map((name) => ({ id: existingByName.get(name)! }))

    const create = parsedTechStacks
      .filter((name) => !existingByName.has(name))
      .map((name) => ({ name, updatedAt: new Date() }))

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
        updatedAt: new Date(),
        TechStack: {
          connect,
          create,
        },
        screenshots: {
          create: parsedScreenshotUrls.map((url) => ({ url })),
        },
      },
      include: {
        TechStack: true,
        screenshots: true,
      },
    })

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
