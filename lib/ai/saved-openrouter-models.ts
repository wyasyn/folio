import { unstable_cache } from "next/cache"
import {
  DEFAULT_CHAT_MODEL,
  SUGGESTED_OPENROUTER_MODELS,
} from "@/lib/ai/openrouter-models"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import db from "@/lib/db"

export type SavedOpenRouterModel = {
  id: string
  modelId: string
  label: string | null
}

async function seedDefaultModelsIfEmpty() {
  if (!db.openRouterModel) {
    throw new Error(
      "Prisma client is out of date. Run `pnpm db:generate` and restart the dev server.",
    )
  }

  try {
    const count = await db.openRouterModel.count()
    if (count > 0) return

    await db.openRouterModel.createMany({
      data: SUGGESTED_OPENROUTER_MODELS.map((model) => ({
        modelId: model.modelId,
        label: model.label,
      })),
      skipDuplicates: true,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes("does not exist") || message.includes("OpenRouterModel")) {
      throw new Error(
        "OpenRouterModel table is missing. Run `pnpm db:migrate` (or `pnpm db:push`).",
      )
    }
    throw error
  }
}

export async function getSavedOpenRouterModelsUncached(): Promise<
  SavedOpenRouterModel[]
> {
  await seedDefaultModelsIfEmpty()

  return db.openRouterModel.findMany({
    select: { id: true, modelId: true, label: true },
    orderBy: { createdAt: "asc" },
  })
}

export const getSavedOpenRouterModels = unstable_cache(
  getSavedOpenRouterModelsUncached,
  ["saved-openrouter-models"],
  {
    tags: [CACHE_TAGS.openrouterModels, CACHE_TAGS.aiSettings],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  },
)

export async function assertModelIsSaved(modelId: string) {
  const saved = await db.openRouterModel.findUnique({
    where: { modelId },
    select: { modelId: true },
  })
  return Boolean(saved)
}

export async function pickFallbackChatModel(): Promise<string> {
  const first = await db.openRouterModel.findFirst({
    orderBy: { createdAt: "asc" },
    select: { modelId: true },
  })
  return first?.modelId ?? DEFAULT_CHAT_MODEL
}
