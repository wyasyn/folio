"use client"

import { useState } from "react"
import {
  IconBulb,
  IconLoader2,
  IconNews,
  IconNotebook,
  IconRocket,
  IconSettings,
  IconWorld,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AiStreamingMarkdown } from "@/components/dashboard/ai/ai-streaming-markdown"
import { ADVISE_TOPICS, type AdviseTopic } from "@/lib/ai/advise-topics"
import { consumeAiSseStream } from "@/lib/ai/consume-sse-stream"
import { friendlyChatError } from "@/lib/ai/friendly-chat-error"
import { cn } from "@/lib/utils"

const topicIcons: Record<AdviseTopic["id"], typeof IconBulb> = {
  site: IconWorld,
  projects: IconRocket,
  blog: IconNotebook,
  "blog-ideas": IconBulb,
  news: IconNews,
  "site-management": IconSettings,
}

type AiAdviseSectionProps = {
  openRouterConfigured: boolean
}

export function AiAdviseSection({ openRouterConfigured }: AiAdviseSectionProps) {
  const [activeTopic, setActiveTopic] = useState<AdviseTopic | null>(null)
  const [content, setContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState("")

  const runAdvise = async (topic: AdviseTopic) => {
    setActiveTopic(topic)
    setContent("")
    setError("")
    setIsStreaming(true)

    try {
      const response = await fetch("/api/admin/ai/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.id }),
      })

      let accumulated = ""
      const result = await consumeAiSseStream(response, (chunk) => {
        accumulated += chunk
        setContent(accumulated)
      })

      if (result.error) {
        setError(friendlyChatError(result.error))
      }
    } catch {
      setError("Could not load advice. Try again.")
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Advise</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Actionable suggestions for your site, content, and workflow. Uses your
            full dashboard content with prompt caching to reduce cost on repeat
            requests.
          </p>
        </div>
        {!openRouterConfigured ? (
          <p className="text-sm text-muted-foreground">
            Add OPENROUTER_API_KEY to enable advise.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ADVISE_TOPICS.map((topic) => {
              const Icon = topicIcons[topic.id]
              return (
                <button
                  key={topic.id}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => void runAdvise(topic)}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4 text-left transition-colors",
                    "hover:border-primary/40 hover:bg-muted/50",
                    "disabled:pointer-events-none disabled:opacity-60",
                  )}
                >
                  <Icon className="size-5 text-primary" aria-hidden />
                  <span className="text-sm font-medium">{topic.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {topic.description}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <Dialog
        open={activeTopic !== null}
        onOpenChange={(open) => {
          if (!open && !isStreaming) {
            setActiveTopic(null)
            setContent("")
            setError("")
          }
        }}
      >
        <DialogContent className="items-center justify-center p-4 sm:p-6">
          <div className="flex min-h-[min(72vh,620px)] max-h-[min(90vh,860px)] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-xl border border-border bg-popover p-6 text-popover-foreground shadow-lg">
          <DialogHeader className="shrink-0 border-b border-border pb-4">
            <DialogTitle>{activeTopic?.label ?? "Advise"}</DialogTitle>
            <DialogDescription>{activeTopic?.description}</DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto py-4">
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <AiStreamingMarkdown
                content={content}
                isStreaming={isStreaming}
              />
            )}
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-border pt-4">
            {isStreaming ? (
              <span className="mr-auto flex items-center gap-2 text-xs text-muted-foreground">
                <IconLoader2 className="size-3.5 animate-spin" />
                Generating…
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              disabled={isStreaming}
              onClick={() => {
                setActiveTopic(null)
                setContent("")
                setError("")
              }}
            >
              Close
            </Button>
            {activeTopic && !isStreaming ? (
              <Button
                type="button"
                onClick={() => void runAdvise(activeTopic)}
              >
                Refresh
              </Button>
            ) : null}
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
