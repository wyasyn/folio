import {
  getSiteAiSettingsUncached,
  isOpenRouterConfigured,
} from "@/lib/ai/site-ai-settings"
import { logChatUsage } from "@/lib/ai/log-chat-usage"
import { streamPortfolioAskChat, type ChatMessage } from "@/lib/ai/openrouter"
import {
  getPortfolioAiContext,
  PORTFOLIO_CHAT_INSTRUCTIONS,
} from "@/lib/portfolio/ai-context"

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 4000

type ChatRequestBody = {
  messages?: unknown
}

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value)) return null
  const parsed: ChatMessage[] = []
  for (const item of value.slice(-MAX_MESSAGES)) {
    if (
      typeof item === "object" &&
      item !== null &&
      "role" in item &&
      "content" in item &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string"
    ) {
      const content = item.content.trim().slice(0, MAX_MESSAGE_LENGTH)
      if (content) parsed.push({ role: item.role, content })
    }
  }
  return parsed.length > 0 ? parsed : null
}

export async function POST(request: Request) {
  if (!isOpenRouterConfigured()) {
    return Response.json(
      { error: "Chat is not configured. Add OPENROUTER_API_KEY." },
      { status: 503 },
    )
  }

  const settings = await getSiteAiSettingsUncached()
  if (!settings.chatEnabled) {
    return Response.json(
      { error: "Portfolio chat is disabled." },
      { status: 403 },
    )
  }

  let body: ChatRequestBody
  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const messages = parseMessages(body.messages)
  if (!messages) {
    return Response.json({ error: "Invalid messages." }, { status: 400 })
  }

  const cacheableContext = await getPortfolioAiContext()

  try {
    const { stream, getUsage } = streamPortfolioAskChat({
      model: settings.chatModel,
      systemInstructions: PORTFOLIO_CHAT_INSTRUCTIONS,
      cacheableContext,
      messages,
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
    const message = error instanceof Error ? error.message : "Chat failed."
    return Response.json({ error: message }, { status: 500 })
  }
}
