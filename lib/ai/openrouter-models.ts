export const DEFAULT_CHAT_MODEL = "openai/gpt-4o-mini"

/** Starter suggestions — users can add any OpenRouter model id. */
export const SUGGESTED_OPENROUTER_MODELS = [
  { modelId: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { modelId: "openai/gpt-4o", label: "GPT-4o" },
  { modelId: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { modelId: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
  { modelId: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
] as const

const MODEL_ID_PATTERN =
  /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:@-]*$/i

export function isValidOpenRouterModelId(value: string) {
  const trimmed = value.trim()
  if (trimmed.length < 3 || trimmed.length > 120) return false
  return MODEL_ID_PATTERN.test(trimmed)
}

export function normalizeOpenRouterModelId(value: string) {
  return value.trim()
}

export function displayModelLabel(modelId: string, label?: string | null) {
  const trimmed = label?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : modelId
}
