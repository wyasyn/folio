import { revalidatePath, revalidateTag } from "next/cache"
import db from "@/lib/db"
import { CACHE_TAGS } from "@/lib/cache/tags"
import type { OpenRouterUsage } from "@/lib/ai/openrouter"

export async function logChatUsage(model: string, usage: OpenRouterUsage | null) {
  if (!usage) return

  await db.chatUsageLog.create({
    data: {
      model,
      promptTokens: usage.prompt_tokens ?? 0,
      completionTokens: usage.completion_tokens ?? 0,
      totalTokens:
        usage.total_tokens ??
        (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
    },
  })

  revalidateTag(CACHE_TAGS.aiSettings, "max")
  revalidateTag(CACHE_TAGS.openrouterModels, "max")
  revalidatePath("/dashboard/ai")
}
