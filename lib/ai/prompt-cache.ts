/** OpenRouter prompt caching — ephemeral breakpoints on large stable context. */

export type EphemeralCacheControl = {
  type: "ephemeral"
  ttl?: "1h"
}

export type OpenRouterTextBlock = {
  type: "text"
  text: string
  cache_control?: EphemeralCacheControl
}

export type OpenRouterMessageContent = string | OpenRouterTextBlock[]

export type OpenRouterMessage = {
  role: "system" | "user" | "assistant"
  content: OpenRouterMessageContent
}

/** Static instructions + large body cached across turns (Anthropic/Gemini explicit; helps sticky routing). */
export function buildCachedSystemMessage(
  instructions: string,
  cacheableBody: string,
): OpenRouterMessage {
  return {
    role: "system",
    content: [
      { type: "text", text: instructions.trim() },
      {
        type: "text",
        text: cacheableBody.trim(),
        cache_control: { type: "ephemeral" },
      },
    ],
  }
}

/** Top-level automatic caching for multi-turn chat (Anthropic; OpenRouter sticky routing). */
export const OPENROUTER_AUTOMATIC_CACHE_CONTROL: EphemeralCacheControl = {
  type: "ephemeral",
}
