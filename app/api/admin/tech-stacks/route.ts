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
    const techStack = await db.techStack.create({
      data: { name, updatedAt: new Date() },
    })
    return Response.json({ data: techStack }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "A tech stack with this name already exists." },
        { status: 409 }
      )
    }
    return Response.json(
      { error: "Unable to create tech stack." },
      { status: 500 }
    )
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
    return Response.json({ error: "Invalid tech stack id." }, { status: 400 })
  }
  if (!name)
    return Response.json({ error: "name is required." }, { status: 400 })

  try {
    const techStack = await db.techStack.update({
      where: { id },
      data: { name, updatedAt: new Date() },
    })
    return Response.json({ data: techStack })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "A tech stack with this name already exists." },
        { status: 409 }
      )
    }
    return Response.json(
      { error: "Unable to update tech stack." },
      { status: 500 }
    )
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
    return Response.json({ error: "Invalid tech stack id." }, { status: 400 })
  }

  const techStack = await db.techStack.findUnique({
    where: { id },
    select: { _count: { select: { Project: true } } },
  })
  if (!techStack) return Response.json({ error: "Not found." }, { status: 404 })
  if (techStack._count.Project > 0) {
    return Response.json(
      { error: "Remove this tech stack from projects before deleting it." },
      { status: 409 }
    )
  }

  await db.techStack.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
