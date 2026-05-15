import { revalidateTag } from "next/cache"
import db from "@/lib/db"
import {
  isValidOpenRouterModelId,
  normalizeOpenRouterModelId,
} from "@/lib/ai/openrouter-models"
import { getRequestSession, unauthorizedResponse } from "@/lib/authz"
import { CACHE_TAGS } from "@/lib/cache/tags"

type CreateModelBody = {
  modelId?: unknown
  label?: unknown
}

function revalidateModelCaches() {
  revalidateTag(CACHE_TAGS.openrouterModels, "max")
  revalidateTag(CACHE_TAGS.aiSettings, "max")
}

export async function POST(request: Request) {
  const session = await getRequestSession(request)
  if (!session) return unauthorizedResponse()

  let body: CreateModelBody
  try {
    body = (await request.json()) as CreateModelBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (typeof body.modelId !== "string") {
    return Response.json({ error: "Model id is required." }, { status: 400 })
  }

  const modelId = normalizeOpenRouterModelId(body.modelId)
  if (!isValidOpenRouterModelId(modelId)) {
    return Response.json(
      {
        error:
          "Invalid model id. Use the OpenRouter slug (e.g. openai/gpt-4o-mini).",
      },
      { status: 400 },
    )
  }

  const label =
    typeof body.label === "string" ? body.label.trim().slice(0, 80) || null : null

  try {
    const model = await db.openRouterModel.create({
      data: { modelId, label },
      select: { id: true, modelId: true, label: true },
    })
    revalidateModelCaches()
    return Response.json({ data: model }, { status: 201 })
  } catch {
    return Response.json(
      { error: "That model is already in your list." },
      { status: 409 },
    )
  }
}
