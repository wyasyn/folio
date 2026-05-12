import { Prisma } from "@/generated/prisma/client"
import { parseContentPayload, type ContentPayload } from "@/lib/content-payload"
import db from "@/lib/db"
import { getRequestSession, unauthorizedResponse } from "@/lib/authz"

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
    const existingTags = await db.tag.findMany({
      where: { name: { in: parsed.data.tags } },
      select: { id: true, name: true },
    })
    const existingByName = new Map(
      existingTags.map((tag) => [tag.name, tag.id])
    )

    const post = await db.post.create({
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
        Tag: {
          connect: parsed.data.tags
            .filter((name) => existingByName.has(name))
            .map((name) => ({ id: existingByName.get(name)! })),
          create: parsed.data.tags
            .filter((name) => !existingByName.has(name))
            .map((name) => ({ name, updatedAt: new Date() })),
        },
      },
      include: { Tag: true },
    })

    return Response.json({ data: post }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "A post with this slug already exists." },
        { status: 409 }
      )
    }

    return Response.json({ error: "Unable to create post." }, { status: 500 })
  }
}
