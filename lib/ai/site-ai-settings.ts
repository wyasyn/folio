import { unstable_cache } from "next/cache"
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/openrouter-models"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import db from "@/lib/db"

export { DEFAULT_CHAT_MODEL } from "@/lib/ai/openrouter-models"

export type SiteAiSettingsData = {
  chatModel: string
  chatEnabled: boolean
}

export async function getSiteAiSettingsUncached(): Promise<SiteAiSettingsData> {
  const row = await db.siteAiSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      chatModel: DEFAULT_CHAT_MODEL,
      chatEnabled: false,
    },
    update: {},
  })

  return {
    chatModel: row.chatModel,
    chatEnabled: row.chatEnabled,
  }
}

export const getSiteAiSettings = unstable_cache(
  getSiteAiSettingsUncached,
  ["site-ai-settings"],
  {
    tags: [CACHE_TAGS.aiSettings],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  },
)

export function isOpenRouterConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim())
}
