"use client"

import { MarkdownBody } from "@/components/dashboard/content/markdown-body"
import { cn } from "@/lib/utils"

type AiStreamingMarkdownProps = {
  content: string
  isStreaming: boolean
  className?: string
}

export function AiStreamingMarkdown({
  content,
  isStreaming,
  className,
}: AiStreamingMarkdownProps) {
  if (!content && isStreaming) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Thinking…
      </p>
    )
  }

  if (!content) {
    return null
  }

  return (
    <MarkdownBody
      markdown={content}
      className={cn(
        "prose-sm prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2",
        className,
      )}
    />
  )
}
