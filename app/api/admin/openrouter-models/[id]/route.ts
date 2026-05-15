import { revalidateTag } from "next/cache"
import db from "@/lib/db"
import { pickFallbackChatModel } from "@/lib/ai/saved-openrouter-models"
import { getRequestSession, unauthorizedResponse } from "@/lib/authz"
import { CACHE_TAGS } from "@/lib/cache/tags"

type RouteContext = {
  params: Promise<{ id: string }>
}

function revalidateModelCaches() {
  revalidateTag(CACHE_TAGS.openrouterModels, "max")
  revalidateTag(CACHE_TAGS.aiSettings, "max")
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getRequestSession(request)
  if (!session) return unauthorizedResponse()

  const { id } = await context.params
  if (!id?.trim()) {
    return Response.json({ error: "Invalid model id." }, { status: 400 })
  }

  const existing = await db.openRouterModel.findUnique({
    where: { id },
    select: { id: true, modelId: true },
  })

  if (!existing) {
    return Response.json({ error: "Model not found." }, { status: 404 })
  }

  await db.openRouterModel.delete({ where: { id } })

  const settings = await db.siteAiSettings.findUnique({
    where: { id: "default" },
    select: { chatModel: true },
  })

  if (settings?.chatModel === existing.modelId) {
    const fallback = await pickFallbackChatModel()
    await db.siteAiSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        chatModel: fallback,
        chatEnabled: false,
      },
      update: { chatModel: fallback, updatedAt: new Date() },
    })
  }

  revalidateModelCaches()

  return Response.json({ ok: true })
}
