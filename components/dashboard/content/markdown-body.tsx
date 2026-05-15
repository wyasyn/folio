"use client"

import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { Children, isValidElement } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeHighlight from "rehype-highlight"
import type { Options as RehypeHighlightOptions } from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import { all as lowlightAllGrammars } from "lowlight"
import "katex/dist/katex.min.css"
import { CloudinaryImage } from "@/components/ui/cloudinary-image"
import { cn } from "@/lib/utils"
import { parseVideoEmbedUrl } from "@/lib/content-markdown"

const rehypeHighlightOptions: RehypeHighlightOptions = {
  detect: true,
  languages: lowlightAllGrammars,
  aliases: {
    ts: "typescript",
    js: "javascript",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
  },
}

const rehypeHighlightConfigured: [typeof rehypeHighlight, RehypeHighlightOptions] =
  [rehypeHighlight, rehypeHighlightOptions]

const remarkMathConfigured: [typeof remarkMath, { singleDollarTextMath: boolean }] =
  [remarkMath, { singleDollarTextMath: true }]

function Paragraph({
  children,
  ...rest
}: ComponentPropsWithoutRef<"p">) {
  const arr = Children.toArray(children)
  if (arr.length === 1 && isValidElement(arr[0])) {
    const href = (arr[0].props as { href?: string }).href
    if (parseVideoEmbedUrl(href)) {
      return <div className="mb-4 last:mb-0">{children}</div>
    }
  }
  return <p {...rest}>{children}</p>
}

function MarkdownLink({
  href,
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<"a">) {
  const embed = parseVideoEmbedUrl(href ?? undefined)
  if (embed?.kind === "youtube") {
    return (
      <span className="not-prose my-4 block w-full overflow-hidden rounded-md border border-border">
        <span className="relative block aspect-video w-full">
          <iframe
            title="YouTube embed"
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${embed.id}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </span>
      </span>
    )
  }
  if (embed?.kind === "vimeo") {
    return (
      <span className="not-prose my-4 block w-full overflow-hidden rounded-md border border-border">
        <span className="relative block aspect-video w-full">
          <iframe
            title="Vimeo embed"
            className="absolute inset-0 h-full w-full"
            src={`https://player.vimeo.com/video/${embed.id}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </span>
      </span>
    )
  }
  return (
    <a
      href={href}
      className={cn("text-primary underline underline-offset-2", className)}
      {...rest}
    >
      {children}
    </a>
  )
}

function isFencedCode(className?: string) {
  if (!className) return false
  return className.includes("hljs") || /language-\w+/.test(className)
}

function MarkdownPre({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      className={cn(
        "not-prose my-4 overflow-x-auto rounded-md border border-border bg-muted/60 p-3 text-sm",
        className,
      )}
      {...rest}
    >
      {children}
    </pre>
  )
}

function MarkdownCode({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"code">) {
  if (!isFencedCode(className)) {
    return (
      <code
        className="not-prose rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        {...rest}
      >
        {children}
      </code>
    )
  }

  return (
    <code
      className={cn("block whitespace-pre font-mono text-[0.85em]", className)}
      {...rest}
    >
      {children as ReactNode}
    </code>
  )
}

type MarkdownBodyProps = {
  markdown: string
  className?: string
}

export function MarkdownBody({ markdown, className }: MarkdownBodyProps) {
  return (
    <div
      className={cn(
        "markdown-preview prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMathConfigured]}
        rehypePlugins={[rehypeKatex, rehypeHighlightConfigured, rehypeRaw]}
        components={{
          p: Paragraph,
          a: MarkdownLink,
          img: ({ alt, src }) => {
            const imageSrc = typeof src === "string" ? src : ""
            if (!imageSrc) return null
            return (
              <CloudinaryImage
                src={imageSrc}
                alt={typeof alt === "string" ? alt : ""}
                preset="markdown"
                width={960}
                height={540}
                sizes="(max-width: 768px) 100vw, 960px"
                className="my-4 max-h-96 w-full rounded-md border border-border object-cover"
              />
            )
          },
          pre: MarkdownPre,
          code: MarkdownCode,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
