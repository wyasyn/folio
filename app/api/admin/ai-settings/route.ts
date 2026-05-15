import { revalidateTag } from "next/cache"
import db from "@/lib/db"
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/openrouter-models"
import { getSiteAiSettingsUncached } from "@/lib/ai/site-ai-settings"
import {
  assertModelIsSaved,
  getSavedOpenRouterModelsUncached,
} from "@/lib/ai/saved-openrouter-models"
import { getRequestSession, unauthorizedResponse } from "@/lib/authz"
import { CACHE_TAGS } from "@/lib/cache/tags"

type UpdateAiSettingsBody = {
  chatModel?: unknown
  chatEnabled?: unknown
}

export async function GET(request: Request) {
  const session = await getRequestSession(request)
  if (!session) return unauthorizedResponse()

  const [settings, models] = await Promise.all([
    getSiteAiSettingsUncached(),
    getSavedOpenRouterModelsUncached(),
  ])

  return Response.json({
    data: settings,
    models,
  })
}

export async function PATCH(request: Request) {
  const session = await getRequestSession(request)
  if (!session) return unauthorizedResponse()

  let body: UpdateAiSettingsBody
  try {
    body = (await request.json()) as UpdateAiSettingsBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const chatEnabled =
    typeof body.chatEnabled === "boolean" ? body.chatEnabled : undefined

  let chatModel: string | undefined
  if (typeof body.chatModel === "string") {
    const trimmed = body.chatModel.trim()
    if (!(await assertModelIsSaved(trimmed))) {
      return Response.json(
        { error: "Select a model from your saved list." },
        { status: 400 },
      )
    }
    chatModel = trimmed
  }

  if (chatEnabled === undefined && chatModel === undefined) {
    return Response.json({ error: "No valid fields to update." }, { status: 400 })
  }

  const updated = await db.siteAiSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      chatModel: chatModel ?? DEFAULT_CHAT_MODEL,
      chatEnabled: chatEnabled ?? false,
    },
    update: {
      ...(chatModel !== undefined ? { chatModel } : {}),
      ...(chatEnabled !== undefined ? { chatEnabled } : {}),
      updatedAt: new Date(),
    },
  })

  revalidateTag(CACHE_TAGS.aiSettings, "max")

  return Response.json({
    data: {
      chatModel: updated.chatModel,
      chatEnabled: updated.chatEnabled,
    },
  })
}
