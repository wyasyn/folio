import {
  forbiddenResponse,
  getRequestSession,
  isAdmin,
  unauthorizedResponse,
} from "@/lib/authz"
import { auth } from "@/lib/auth"
import db from "@/lib/db"

async function requireAdminRequest(request: Request) {
  const session = await getRequestSession(request)
  if (!session) return { error: unauthorizedResponse() }
  if (!isAdmin(session.user)) return { error: forbiddenResponse() }
  return { session }
}

async function isLastAdmin(userId: string) {
  const adminCount = await db.user.count({
    where: { role: { contains: "admin" } },
  })
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return adminCount <= 1 && isAdmin(user)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireAdminRequest(request)
  if ("error" in access) return access.error
  const { id: userId } = await context.params
  const body = (await request.json().catch(() => null)) as {
    action?: unknown
    role?: unknown
    banReason?: unknown
    banExpiresIn?: unknown
  } | null

  if (!userId)
    return Response.json({ error: "Invalid user id." }, { status: 400 })
  const action = typeof body?.action === "string" ? body.action : ""

  if (action === "set-role") {
    const role = body?.role === "admin" ? "admin" : "user"
    if (userId === access.session.user.id && role !== "admin") {
      return Response.json(
        { error: "You cannot remove your own admin role." },
        { status: 409 }
      )
    }
    if (role !== "admin" && (await isLastAdmin(userId))) {
      return Response.json(
        { error: "You cannot remove the last admin." },
        { status: 409 }
      )
    }
    await auth.api.setRole({
      body: { userId, role },
      headers: request.headers,
    })
    return Response.json({ ok: true })
  }

  if (action === "ban") {
    if (userId === access.session.user.id) {
      return Response.json(
        { error: "You cannot ban yourself." },
        { status: 409 }
      )
    }
    if (await isLastAdmin(userId)) {
      return Response.json(
        { error: "You cannot ban the last admin." },
        { status: 409 }
      )
    }
    const banReason =
      typeof body?.banReason === "string" && body.banReason.trim()
        ? body.banReason.trim()
        : "Blocked by admin"
    const banExpiresIn =
      typeof body?.banExpiresIn === "number" &&
      Number.isFinite(body.banExpiresIn)
        ? body.banExpiresIn
        : undefined
    await auth.api.banUser({
      body: { userId, banReason, banExpiresIn },
      headers: request.headers,
    })
    return Response.json({ ok: true })
  }

  if (action === "unban") {
    await auth.api.unbanUser({
      body: { userId },
      headers: request.headers,
    })
    return Response.json({ ok: true })
  }

  return Response.json({ error: "Unsupported action." }, { status: 400 })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireAdminRequest(request)
  if ("error" in access) return access.error
  const { id: userId } = await context.params

  if (userId === access.session.user.id) {
    return Response.json(
      { error: "You cannot delete yourself." },
      { status: 409 }
    )
  }
  if (await isLastAdmin(userId)) {
    return Response.json(
      { error: "You cannot delete the last admin." },
      { status: 409 }
    )
  }

  await auth.api.removeUser({
    body: { userId },
    headers: request.headers,
  })
  return new Response(null, { status: 204 })
}
