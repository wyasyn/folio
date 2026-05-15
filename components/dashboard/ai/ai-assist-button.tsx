"use client"

import { useMemo, useState } from "react"
import { IconLoader2, IconSparkles } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AiStreamingMarkdown } from "@/components/dashboard/ai/ai-streaming-markdown"
import {
  ASSIST_FOCUS_OPTIONS,
  type AssistContext,
  type AssistDraftPayload,
  type AssistFocus,
} from "@/lib/ai/assist-types"
import { consumeAiSseStream } from "@/lib/ai/consume-sse-stream"
import { friendlyChatError } from "@/lib/ai/friendly-chat-error"
import { cn } from "@/lib/utils"

type AiAssistButtonProps = {
  context: AssistContext
  mode: "create" | "edit"
  getDraft: () => AssistDraftPayload
  disabled?: boolean
  className?: string
}

export function AiAssistButton({
  context,
  mode,
  getDraft,
  disabled,
  className,
}: AiAssistButtonProps) {
  const focusOptions = ASSIST_FOCUS_OPTIONS[context]
  const [open, setOpen] = useState(false)
  const [focus, setFocus] = useState<AssistFocus>("general")
  const [content, setContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState("")

  const contextLabel = useMemo(() => {
    switch (context) {
      case "post":
        return "blog post"
      case "news":
        return "news item"
      case "project":
        return "project"
      case "profile":
        return "profile"
    }
  }, [context])

  const runAssist = async () => {
    setContent("")
    setError("")
    setIsStreaming(true)

    try {
      const response = await fetch("/api/admin/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          focus,
          mode,
          draft: getDraft(),
        }),
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
      setError("Could not load suggestions. Try again.")
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isStreaming) return
        setOpen(next)
        if (!next) {
          setContent("")
          setError("")
          setFocus("general")
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn("gap-1.5", className)}
        >
          <IconSparkles className="size-4" aria-hidden />
          AI help
        </Button>
      </DialogTrigger>
      <DialogContent className="items-center justify-center p-4 sm:p-6">
        <div className="flex min-h-[min(72vh,620px)] max-h-[min(90vh,860px)] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-xl border border-border bg-popover p-6 text-popover-foreground shadow-lg">
        <DialogHeader className="shrink-0 border-b border-border pb-4">
          <DialogTitle>AI help — {contextLabel}</DialogTitle>
          <DialogDescription>
            Suggestions based on your site content and this draft. Cached context
            keeps follow-up requests cheaper.
          </DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 flex-wrap gap-2 border-b border-border py-3">
          {focusOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={isStreaming}
              onClick={() => setFocus(option.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                focus === option.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-4">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : content || isStreaming ? (
            <AiStreamingMarkdown content={content} isStreaming={isStreaming} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose a focus area and run AI help to get tailored suggestions for
              what you are editing.
            </p>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border pt-4">
          {isStreaming ? (
            <span className="mr-auto flex items-center gap-2 text-xs text-muted-foreground">
              <IconLoader2 className="size-3.5 animate-spin" />
              Analyzing…
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={isStreaming}
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            disabled={isStreaming}
            onClick={() => void runAssist()}
          >
            {content ? "Run again" : "Get suggestions"}
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
