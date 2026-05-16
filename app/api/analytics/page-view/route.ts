import { NextResponse, type NextRequest } from "next/server"
import { isBotUserAgent } from "@/lib/analytics/bot"
import { resolveResourceId } from "@/lib/analytics/resolve-resource-id"
import {
  coarseDeviceType,
  getClientIp,
  getCountryFromRequest,
  normalizeReferrer,
} from "@/lib/analytics/request-meta"
import { isTrackablePath } from "@/lib/analytics/route-meta"
import { hashAnalyticsSessionKey } from "@/lib/analytics/session"
import { isAnalyticsResourceType } from "@/lib/analytics/types"
import db from "@/lib/db"

const RATE_LIMIT_PER_MINUTE = 60

function analyticsEnabled(): boolean {
  return process.env.ANALYTICS_ENABLED !== "false"
}

export async function POST(request: NextRequest) {
  if (!analyticsEnabled()) {
    return new NextResponse(null, { status: 204 })
  }

  const userAgent = request.headers.get("user-agent")
  if (isBotUserAgent(userAgent)) {
    return new NextResponse(null, { status: 204 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const path = typeof record.path === "string" ? record.path : null
  const resourceType = record.resourceType
  const clientSessionKey =
    typeof record.sessionKey === "string" ? record.sessionKey : null
  const slug =
    typeof record.slug === "string" && record.slug.trim()
      ? record.slug.trim()
      : null
  const deviceType =
    typeof record.deviceType === "string" ? record.deviceType : null

  if (!path || !clientSessionKey || !isAnalyticsResourceType(resourceType)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (!isTrackablePath(path)) {
    return new NextResponse(null, { status: 204 })
  }

  const ip = getClientIp(request)
  const sessionKey = hashAnalyticsSessionKey(clientSessionKey, ip, userAgent)

  const since = new Date(Date.now() - 60_000)
  const recentCount = await db.pageView.count({
    where: {
      sessionKey,
      createdAt: { gte: since },
    },
  })

  if (recentCount >= RATE_LIMIT_PER_MINUTE) {
    return new NextResponse(null, { status: 429 })
  }

  const resourceId =
    typeof record.resourceId === "string" && record.resourceId.trim()
      ? record.resourceId.trim()
      : await resolveResourceId(resourceType, slug)

  const referrer = normalizeReferrer(request.headers.get("referer"))
  const country = getCountryFromRequest(request)

  await db.pageView.create({
    data: {
      path,
      resourceType,
      resourceId,
      slug,
      referrer,
      country,
      deviceType: deviceType ?? coarseDeviceType(userAgent),
      sessionKey,
    },
  })

  return new NextResponse(null, { status: 204 })
}
