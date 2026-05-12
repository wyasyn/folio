import { Prisma } from "@/generated/prisma/client"
import {
  forbiddenResponse,
  getRequestSession,
  isAdmin,
  unauthorizedResponse,
} from "@/lib/authz"
import db from "@/lib/db"

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getRequestSession(request)
  if (!session) return unauthorizedResponse()
  if (!isAdmin(session.user)) return forbiddenResponse()

  const { id: idParam } = await context.params
  const id = Number.parseInt(idParam, 10)
  if (!Number.isFinite(id) || id < 1) {
    return Response.json({ error: "Invalid screenshot id." }, { status: 400 })
  }

  try {
    await db.screenshot.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ error: "Not found." }, { status: 404 })
    }
    return Response.json(
      { error: "Unable to delete screenshot." },
      { status: 500 }
    )
  }
}
