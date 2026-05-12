import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export type DashboardSession = Awaited<ReturnType<typeof auth.api.getSession>>

type SessionUser = NonNullable<DashboardSession>["user"]

export function isAdmin(user: Pick<SessionUser, "role"> | null | undefined) {
  return (
    typeof user?.role === "string" && user.role.split(",").includes("admin")
  )
}

export async function getDashboardSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    redirect("/login")
  }

  return session
}

export async function requireAdmin() {
  const session = await getDashboardSession()

  if (!isAdmin(session.user)) {
    redirect("/unauthorized")
  }

  return session
}

export async function getRequestSession(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user?.id) return null
  return session
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized." }, { status: 401 })
}

export function forbiddenResponse() {
  return Response.json({ error: "Forbidden." }, { status: 403 })
}
