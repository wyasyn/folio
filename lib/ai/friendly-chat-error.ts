/** Map API / OpenRouter errors to user-facing copy. */
export function friendlyChatError(raw: string): string {
  const message = raw.trim()
  const lower = message.toLowerCase()

  if (!message) {
    return "Something went wrong while getting a reply. Please try again."
  }

  if (lower.includes("not configured") || lower.includes("openrouter_api_key")) {
    return "Chat isn't available yet — the site still needs to be connected to OpenRouter."
  }

  if (lower.includes("disabled")) {
    return "Chat is turned off right now. Please check back later."
  }

  if (lower.includes("invalid messages")) {
    return "That message couldn't be sent. Try rephrasing or starting a new question."
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("429") ||
    lower.includes("too many requests")
  ) {
    return "Too many messages in a short time. Wait a moment, then try again."
  }

  if (lower.includes("insufficient") && lower.includes("credit")) {
    return "The AI provider is out of credits. The site owner may need to top up OpenRouter."
  }

  if (lower.includes("invalid model") || lower.includes("model not found")) {
    return "The selected AI model isn't available. Try another model in the dashboard."
  }

  if (lower.includes("context length") || lower.includes("maximum context")) {
    return "That conversation got too long. Start fresh with a shorter question."
  }

  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "The model took too long to respond. Please try again."
  }

  if (lower.includes("unauthorized") || lower.includes("401")) {
    return "There was an authentication problem with the AI service."
  }

  if (message.length > 180) {
    return "Something went wrong while getting a reply. Please try again."
  }

  return message
}
