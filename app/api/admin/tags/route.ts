import { Prisma } from "@/generated/prisma/client"
import {
  forbiddenResponse,
  getRequestSession,
  isAdmin,
  unauthorizedResponse,
} from "@/lib/authz"
import db from "@/lib/db"

async function requireAdminRequest(request: Request) {
  const session = await getRequestSession(request)
  if (!session) return { error: unauthorizedResponse() }
  if (!isAdmin(session.user)) return { error: forbiddenResponse() }
  return { session }
}

export async function POST(request: Request) {
  const access = await requireAdminRequest(request)
  if ("error" in access) return access.error
  const body = (await request.json().catch(() => null)) as {
    name?: unknown
  } | null
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  if (!name)
    return Response.json({ error: "name is required." }, { status: 400 })

  try {
    const tag = await db.tag.create({ data: { name, updatedAt: new Date() } })
    return Response.json({ data: tag }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "A tag with this name already exists." },
        { status: 409 }
      )
    }
    return Response.json({ error: "Unable to create tag." }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const access = await requireAdminRequest(request)
  if ("error" in access) return access.error
  const body = (await request.json().catch(() => null)) as {
    id?: unknown
    name?: unknown
  } | null
  const id = Number.parseInt(String(body?.id ?? ""), 10)
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  if (!Number.isFinite(id) || id < 1) {
    return Response.json({ error: "Invalid tag id." }, { status: 400 })
  }
  if (!name)
    return Response.json({ error: "name is required." }, { status: 400 })

  try {
    const tag = await db.tag.update({
      where: { id },
      data: { name, updatedAt: new Date() },
    })
    return Response.json({ data: tag })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "A tag with this name already exists." },
        { status: 409 }
      )
    }
    return Response.json({ error: "Unable to update tag." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const access = await requireAdminRequest(request)
  if ("error" in access) return access.error
  const body = (await request.json().catch(() => null)) as {
    id?: unknown
  } | null
  const id = Number.parseInt(String(body?.id ?? ""), 10)
  if (!Number.isFinite(id) || id < 1) {
    return Response.json({ error: "Invalid tag id." }, { status: 400 })
  }

  const tag = await db.tag.findUnique({
    where: { id },
    select: { _count: { select: { Post: true, News: true } } },
  })
  if (!tag) return Response.json({ error: "Not found." }, { status: 404 })
  if (tag._count.Post > 0 || tag._count.News > 0) {
    return Response.json(
      { error: "Remove this tag from posts and news before deleting it." },
      { status: 409 }
    )
  }

  await db.tag.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
