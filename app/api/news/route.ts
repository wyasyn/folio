import { Prisma } from "@/generated/prisma/client"
import { tagRelationInputForCreate } from "@/lib/catalog-db"
import { parseContentPayload, type ContentPayload } from "@/lib/content-payload"
import db from "@/lib/db"
import { getRequestSession, unauthorizedResponse } from "@/lib/authz"
import { revalidateNews } from "@/lib/revalidate-content"

export async function POST(request: Request) {
  const session = await getRequestSession(request)
  if (!session) return unauthorizedResponse()

  let payload: ContentPayload
  try {
    payload = (await request.json()) as ContentPayload
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = parseContentPayload(payload)
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })

  try {
    const tagRelations = await tagRelationInputForCreate(parsed.data.tags)

    const news = await db.news.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        authorId: session.user.id,
        description: parsed.data.description,
        content: parsed.data.content,
        coverImage: parsed.data.coverImage,
        readTime: parsed.data.readTime,
        published: parsed.data.published,
        featured: parsed.data.featured,
        updatedAt: new Date(),
        tags: tagRelations,
      },
      include: { tags: true },
    })

    revalidateNews(news.slug)
    return Response.json({ data: news }, { status: 201 })
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
      { error: "Unable to create news item." },
      { status: 500 }
    )
  }
}
