import { logChatUsage } from "@/lib/ai/log-chat-usage"
import { streamDashboardAiChat } from "@/lib/ai/openrouter"
import {
  getSiteAiSettingsUncached,
  isOpenRouterConfigured,
} from "@/lib/ai/site-ai-settings"

export async function createAdminAiStreamResponse({
  systemInstructions,
  cacheableContext,
  userPrompt,
}: {
  systemInstructions: string
  cacheableContext: string
  userPrompt: string
}): Promise<Response> {
  if (!isOpenRouterConfigured()) {
    return Response.json(
      { error: "Add OPENROUTER_API_KEY to enable AI features." },
      { status: 503 },
    )
  }

  const settings = await getSiteAiSettingsUncached()

  try {
    const { stream, getUsage } = streamDashboardAiChat({
      model: settings.chatModel,
      systemInstructions,
      cacheableContext,
      userPrompt,
    })

    const wrapped = stream.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        async flush() {
          const usage = await getUsage()
          await logChatUsage(settings.chatModel, usage)
        },
      }),
    )

    return new Response(wrapped, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed."
    return Response.json({ error: message }, { status: 500 })
  }
}
