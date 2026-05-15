"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IconAlertCircle, IconLoader2, IconSend } from "@tabler/icons-react"
import { MarkdownBody } from "@/components/dashboard/content/markdown-body"
import { Button } from "@/components/ui/button"
import { friendlyChatError } from "@/lib/ai/friendly-chat-error"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/ai/openrouter"

type PortfolioChatPanelProps = {
  chatEnabled: boolean
  chatConfigured: boolean
  autoFocusInput?: boolean
}

const bubbleClass =
  "rounded-lg bg-muted px-4 py-3 text-sm text-foreground"

function ChatMessageContent({
  message,
  isStreamingPlaceholder,
}: {
  message: ChatMessage
  isStreamingPlaceholder: boolean
}) {
  if (message.role === "user") {
    return (
      <p className="whitespace-pre-wrap">{message.content}</p>
    )
  }

  if (!message.content) {
    return isStreamingPlaceholder ? (
      <span className="text-muted-foreground">Thinking…</span>
    ) : null
  }

  return (
    <MarkdownBody
      markdown={message.content}
      className="prose-sm prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 prose-pre:my-2"
    />
  )
}

export function PortfolioChatPanel({
  chatEnabled,
  chatConfigured,
  autoFocusInput = false,
}: PortfolioChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, error, scrollToBottom])

  useEffect(() => {
    if (!autoFocusInput || !chatEnabled || !chatConfigured) return
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [autoFocusInput, chatEnabled, chatConfigured])

  const reportError = (raw: string, revertTo: ChatMessage[]) => {
    setError(friendlyChatError(raw))
    setMessages(revertTo)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    setError("")
    setInput("")
    const priorMessages = messages
    const nextMessages: ChatMessage[] = [
      ...priorMessages,
      { role: "user", content: text },
    ]
    setMessages(nextMessages)
    setIsStreaming(true)

    try {
      const response = await fetch("/api/portfolio/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!response.ok) {
        let raw = "Chat request failed."
        try {
          const body = (await response.json()) as { error?: string }
          if (body.error) raw = body.error
        } catch {
          // ignore
        }
        reportError(raw, priorMessages)
        return
      }

      if (!response.body) {
        reportError("No response from the assistant.", priorMessages)
        return
      }

      const assistantMessage: ChatMessage = { role: "assistant", content: "" }
      setMessages([...nextMessages, assistantMessage])

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
            const parsed = JSON.parse(data) as {
              text?: string
              error?: string
            }
            if (parsed.error) {
              streamError = parsed.error
              break
            }
            if (parsed.text) {
              assistantMessage.content += parsed.text
              setMessages([...nextMessages, { ...assistantMessage }])
            }
          } catch {
            // ignore malformed chunks
          }
        }

        if (streamError) break
      }

      if (streamError) {
        reportError(
          streamError,
          assistantMessage.content.trim() ? nextMessages : priorMessages,
        )
      }
    } catch {
      reportError("Chat request failed.", priorMessages)
    } finally {
      setIsStreaming(false)
    }
  }

  if (!chatConfigured) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        Chat is not configured on this site yet.
      </p>
    )
  }

  if (!chatEnabled) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        Portfolio chat is currently disabled.
      </p>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        className="min-h-[12rem] flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Ask anything about this portfolio — projects, blog, news, or about
            me. Answers use only published site content.
          </p>
        ) : (
          <ul className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <li
                key={`${message.role}-${index}`}
                className={cn(
                  bubbleClass,
                  message.role === "user"
                    ? "ml-6 max-w-[85%] self-end"
                    : "mr-6 max-w-[95%]",
                )}
              >
                <ChatMessageContent
                  message={message}
                  isStreamingPlaceholder={
                    isStreaming && index === messages.length - 1
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="mx-4 mb-2 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <IconAlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      ) : null}

      <form
        className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this portfolio…"
          disabled={isStreaming}
          className="flex h-11 flex-1 bg-transparent text-sm outline-none focus:outline-none focus-visible:outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="icon-sm"
          disabled={isStreaming || !input.trim()}
          aria-label="Send message"
        >
          {isStreaming ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconSend className="size-4" />
          )}
        </Button>
      </form>
    </div>
  )
}
