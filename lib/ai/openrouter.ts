import { siteConfig } from "@/lib/site-config"
import {
  buildCachedSystemMessage,
  OPENROUTER_AUTOMATIC_CACHE_CONTROL,
  type OpenRouterMessage,
} from "@/lib/ai/prompt-cache"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type OpenRouterUsage = {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  prompt_tokens_details?: {
    cached_tokens?: number
    cache_write_tokens?: number
  }
}

type OpenRouterStreamChunk = {
  choices?: Array<{
    delta?: { content?: string }
    finish_reason?: string | null
  }>
  usage?: OpenRouterUsage
}

export type StreamChatResult = {
  stream: ReadableStream<Uint8Array>
  getUsage: () => Promise<OpenRouterUsage | null>
}

export type StreamOpenRouterChatOptions = {
  model: string
  messages: OpenRouterMessage[]
  /** Enables Anthropic automatic caching + OpenRouter sticky routing for multi-turn chats. */
  automaticCache?: boolean
}

export function streamOpenRouterChat({
  model,
  messages,
  automaticCache = false,
}: StreamOpenRouterChatOptions): StreamChatResult {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.")
  }

  let usageResolve: (value: OpenRouterUsage | null) => void
  const usagePromise = new Promise<OpenRouterUsage | null>((resolve) => {
    usageResolve = resolve
  })

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let lastUsage: OpenRouterUsage | null = null

      try {
        const body: Record<string, unknown> = {
          model,
          stream: true,
          messages,
        }
        if (automaticCache) {
          body.cache_control = OPENROUTER_AUTOMATIC_CACHE_CONTROL
        }

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": siteConfig.siteUrl,
              "X-Title": siteConfig.name,
            },
            body: JSON.stringify(body),
          },
        )

        if (!response.ok) {
          const errText = await response.text()
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errText || "OpenRouter request failed." })}\n\n`,
            ),
          )
          controller.close()
          usageResolve(null)
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          usageResolve(null)
          return
        }

        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith("data:")) continue
            const data = trimmed.slice(5).trim()
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data) as OpenRouterStreamChunk
              if (parsed.usage) lastUsage = parsed.usage
              const text = parsed.choices?.[0]?.delta?.content
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
                )
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
        usageResolve(lastUsage)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Stream failed."
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`),
        )
        controller.close()
        usageResolve(null)
      }
    },
  })

  return { stream, getUsage: () => usagePromise }
}

/** Portfolio Ask tab: cached system context + conversation with automatic multi-turn caching. */
export function streamPortfolioAskChat({
  model,
  systemInstructions,
  cacheableContext,
  messages,
}: {
  model: string
  systemInstructions: string
  cacheableContext: string
  messages: ChatMessage[]
}): StreamChatResult {
  const openRouterMessages: OpenRouterMessage[] = [
    buildCachedSystemMessage(systemInstructions, cacheableContext),
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ]

  return streamOpenRouterChat({
    model,
    messages: openRouterMessages,
    automaticCache: true,
  })
}

/** Dashboard advise/assist: cached site knowledge + single user turn (no automatic cache needed). */
export function streamDashboardAiChat({
  model,
  systemInstructions,
  cacheableContext,
  userPrompt,
}: {
  model: string
  systemInstructions: string
  cacheableContext: string
  userPrompt: string
}): StreamChatResult {
  return streamOpenRouterChat({
    model,
    messages: [
      buildCachedSystemMessage(systemInstructions, cacheableContext),
      { role: "user", content: userPrompt },
    ],
  })
}
