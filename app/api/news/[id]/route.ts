import { Prisma } from "@/generated/prisma/client"
import { parseContentPayload, type ContentPayload } from "@/lib/content-payload"
import db from "@/lib/db"
import { getRequestSession, isAdmin, unauthorizedResponse } from "@/lib/authz"

async function requireNewsAccess(request: Request, newsId: number) {
  const session = await getRequestSession(request)
  if (!session) return { error: unauthorizedResponse() }

  const news = await db.news.findFirst({
    where: {
      id: newsId,
      ...(isAdmin(session.user) ? {} : { authorId: session.user.id }),
    },
    select: { id: true },
  })

  if (!news) {
    return { error: Response.json({ error: "Not found." }, { status: 404 }) }
  }

  return { session }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params
  const newsId = Number.parseInt(idParam, 10)
  if (!Number.isFinite(newsId) || newsId < 1) {
    return Response.json({ error: "Invalid news id." }, { status: 400 })
  }

  const access = await requireNewsAccess(request, newsId)
  if ("error" in access) return access.error

  let payload: ContentPayload
  try {
    payload = (await request.json()) as ContentPayload
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = parseContentPayload(payload)
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })

  try {
    const news = await db.$transaction(async (tx) => {
      const existingTags = await tx.tag.findMany({
        where: { name: { in: parsed.data.tags } },
        select: { id: true, name: true },
      })
      const existingByName = new Map(
        existingTags.map((tag) => [tag.name, tag.id])
      )
      for (const name of parsed.data.tags.filter(
        (name) => !existingByName.has(name)
      )) {
        await tx.tag.create({ data: { name, updatedAt: new Date() } })
      }
      const tags = await tx.tag.findMany({
        where: { name: { in: parsed.data.tags } },
        select: { id: true, name: true },
      })
      const idByName = new Map(tags.map((tag) => [tag.name, tag.id]))

      return tx.news.update({
        where: { id: newsId },
        data: {
          title: parsed.data.title,
          slug: parsed.data.slug,
          description: parsed.data.description,
          content: parsed.data.content,
          coverImage: parsed.data.coverImage,
          readTime: parsed.data.readTime,
          published: parsed.data.published,
          featured: parsed.data.featured,
          updatedAt: new Date(),
          tags: {
            set: parsed.data.tags.map((name) => ({ id: idByName.get(name)! })),
          },
        },
        include: { tags: true },
      })
    })

    return Response.json({ data: news })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "A news item with this slug already exists." },
        { status: 409 }
      )
    }

    return Response.json(
      { error: "Unable to update news item." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params
  const newsId = Number.parseInt(idParam, 10)
  if (!Number.isFinite(newsId) || newsId < 1) {
    return Response.json({ error: "Invalid news id." }, { status: 400 })
  }

  const access = await requireNewsAccess(request, newsId)
  if ("error" in access) return access.error

  try {
    await db.news.delete({ where: { id: newsId } })
    return new Response(null, { status: 204 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ error: "Not found." }, { status: 404 })
    }
    return Response.json(
      { error: "Unable to delete news item." },
      { status: 500 }
    )
  }
}
