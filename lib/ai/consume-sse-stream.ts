/** Read OpenRouter SSE stream from our API routes (`data: {"text": "..."}`). */
export async function consumeAiSseStream(
  response: Response,
  onText: (chunk: string) => void,
): Promise<{ error?: string }> {
  if (!response.ok) {
    let raw = "Request failed."
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) raw = body.error
    } catch {
      // ignore
    }
    return { error: raw }
  }

  if (!response.body) {
    return { error: "No response body." }
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let streamError: string | null = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split("\n\n")
    buffer = parts.pop() ?? ""

    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith("data:")) continue
      const data = line.slice(5).trim()
      if (data === "[DONE]") continue

      try {
        const parsed = JSON.parse(data) as { text?: string; error?: string }
        if (parsed.error) {
          streamError = parsed.error
          break
        }
        if (parsed.text) onText(parsed.text)
      } catch {
        // ignore malformed chunks
      }
    }

    if (streamError) break
  }

  return streamError ? { error: streamError } : {}
}
