"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror"
import { markdown } from "@codemirror/lang-markdown"
import { indentUnit, LanguageDescription } from "@codemirror/language"
import { languages } from "@codemirror/language-data"
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands"
import { EditorView, keymap, lineNumbers } from "@codemirror/view"
import {
  IconBlockquote,
  IconBold,
  IconCode,
  IconH1,
  IconH2,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconStrikethrough,
  IconUnderline,
  IconVideo,
} from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { countWordsInMarkdown } from "@/lib/content-markdown"
import { MarkdownBody } from "@/components/dashboard/content/markdown-body"

type ViewMode = "editor" | "split" | "preview"

export type MarkdownSplitEditorProps = {
  value: string
  onChange: (value: string) => void
  onUploadImage: (
    file: File,
    options?: { folder?: "projects" | "avatars" | "posts" | "news" },
  ) => Promise<string>
  cloudinaryFolder?: "projects" | "avatars" | "posts" | "news"
  onImageRemoved: (url: string) => void
  error?: string
  placeholder?: string
}

function resolveCodeLanguage(info: string) {
  const id = info.trim()
  if (!id) return null
  const normalized = id.toLowerCase() === "shell" ? "bash" : id
  return LanguageDescription.matchLanguageName(languages, normalized)
}

function insertAtCursor(view: EditorView, text: string) {
  const { from, to } = view.state.selection.main
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length },
  })
  view.focus()
}

export function MarkdownSplitEditor({
  value,
  onChange,
  onUploadImage,
  cloudinaryFolder,
  onImageRemoved,
  error,
  placeholder = "Write in Markdown…",
}: MarkdownSplitEditorProps) {
  const { resolvedTheme } = useTheme()
  const cmRef = useRef<ReactCodeMirrorRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previousImageUrlsRef = useRef<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const extensions = useMemo(
    () => [
      markdown({ codeLanguages: resolveCodeLanguage }),
      lineNumbers(),
      history(),
      indentUnit.of("  "),
      keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
      EditorView.theme(
        {
          "&": { minHeight: "min(70vh, 640px)" },
          ".cm-scroller": {
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: "13px",
          },
          ".cm-content": { paddingBlock: "0.75rem" },
          ".cm-gutters": {
            backgroundColor: "transparent",
            border: "none",
            color: "var(--muted-foreground)",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "transparent",
          },
        },
      ),
    ],
    [],
  )

  useEffect(() => {
    const urls = new Set(
      Array.from(value.matchAll(/!\[[^\]]*\]\((https?:[^)\s]+)\)/g)).map(
        (m) => m[1],
      ),
    )
    const removed = Array.from(previousImageUrlsRef.current).filter(
      (u) => !urls.has(u),
    )
    previousImageUrlsRef.current = urls
    for (const url of removed) {
      onImageRemoved(url)
    }
  }, [value, onImageRemoved])

  const runInsert = (snippet: string) => {
    const view = cmRef.current?.view
    if (view) insertAtCursor(view, snippet)
    else onChange(value + snippet)
  }

  const handlePickImage = () => fileInputRef.current?.click()

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploadingImage(true)
    try {
      const url = await onUploadImage(
        file,
        cloudinaryFolder ? { folder: cloudinaryFolder } : undefined,
      )
      const alt = file.name.replace(/\.[^.]+$/, "")
      const snippet = `\n\n![${alt}](${url})\n\n`
      const view = cmRef.current?.view
      if (view) insertAtCursor(view, snippet)
      else onChange(`${value}${snippet}`)
    } finally {
      setIsUploadingImage(false)
      event.target.value = ""
    }
  }

  const wordCount = useMemo(() => countWordsInMarkdown(value), [value])

  const showEditor = viewMode === "editor" || viewMode === "split"
  const showPreview = viewMode === "preview" || viewMode === "split"

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        error && "border-destructive/60",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          title="Heading 1"
          onClick={() => runInsert("# ")}
        >
          <IconH1 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
         
          title="Heading 2"
          onClick={() => runInsert("## ")}
        >
          <IconH2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          
          title="Bold"
          onClick={() => runInsert("**bold**")}
        >
          <IconBold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
         
          title="Italic"
          onClick={() => runInsert("*italic*")}
        >
          <IconItalic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
        
          title="Inline code"
          onClick={() => runInsert("`code`")}
        >
          <IconCode className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
         
          title="Link"
          onClick={() => runInsert("[label](https://)")}
        >
          <IconLink className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
        
          title="Bullet list"
          onClick={() => runInsert("\n- \n")}
        >
          <IconList className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
        
          title="Numbered list"
          onClick={() => runInsert("\n1. \n")}
        >
          <IconListNumbers className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
         
          title="Blockquote"
          onClick={() => runInsert("\n> \n")}
        >
          <IconBlockquote className="size-4" />
        </Button>

        <Button
        type="button"
        variant="ghost"
        title="Underline"
        onClick={() => runInsert("<u>underline</u>")}
        >
          <IconUnderline className="size-4" />
        </Button>
        <Button
        type="button"
        variant="ghost"
        title="Strikethrough"
        onClick={() => runInsert("~~strikethrough~~")}
        >
          <IconStrikethrough className="size-4" />
        </Button>
       
      </div>
        <div
          className="flex rounded-lg bg-muted/60 p-0.5"
          role="group"
          aria-label="Editor layout"
        >
          {(
            [
              ["editor", "Editor"],
              ["split", "Split"],
              ["preview", "Preview"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                viewMode === mode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      

      <Tabs defaultValue="write" className="border-b border-border px-2 pt-2 pb-4">
        <TabsList className="h-auto min-h-8 w-full flex-wrap justify-start gap-0.5 bg-transparent p-0">
          <TabsTrigger value="write" className="text-xs">
            Write
          </TabsTrigger>
          <TabsTrigger value="code" className="text-xs">
            Code
          </TabsTrigger>
          <TabsTrigger value="image" className="text-xs">
            Image
          </TabsTrigger>
          <TabsTrigger value="video" className="text-xs">
            Video
          </TabsTrigger>
          <TabsTrigger value="latex" className="text-xs">
            LaTeX
          </TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="text-muted-foreground">
          <p>
            Use Markdown for headings (<code className="text-foreground">#</code>
            ), lists, links, and tables (GFM). The preview updates as you type.
          </p>
        </TabsContent>
        <TabsContent value="code" className="space-y-2">
          <p className="text-muted-foreground">
            Insert a fenced code block with a language tag (e.g.{" "}
            <code className="text-foreground">typescript</code>). Syntax highlighting
            applies in the editor and preview; inline{" "}
            <code className="text-foreground">`code`</code> is not highlighted.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              runInsert("\n\n```typescript\n// your code\n```\n\n")
            }
          >
            <IconCode className="size-3.5" /> Insert TypeScript block
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => runInsert("\n\n```bash\n\n```\n\n")}
          >
            Insert Bash block
          </Button>
        </TabsContent>
        <TabsContent value="image" className="space-y-2">
          <p className="text-muted-foreground">
            Upload to Cloudinary or paste a <code className="text-foreground">![]()</code>{" "}
            image URL.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isUploadingImage}
              onClick={handlePickImage}
            >
              <IconPhoto className="size-3.5" />
              {isUploadingImage ? "Uploading…" : "Upload image"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => runInsert("\n\n![alt text](https://)\n\n")}
            >
              Insert markdown image
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />
        </TabsContent>
        <TabsContent value="video" className="space-y-2">
          <p className="text-muted-foreground">
            Paste a standalone YouTube or Vimeo URL on its own line (or as a
            markdown link). Allowed hosts:{" "}
            <code className="text-foreground">youtube.com</code>,{" "}
            <code className="text-foreground">youtu.be</code>,{" "}
            <code className="text-foreground">vimeo.com</code>.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              runInsert(
                "\n\nhttps://www.youtube.com/watch?v=VIDEO_ID\n\n",
              )
            }
          >
            <IconVideo className="size-3.5" /> Insert sample YouTube URL
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => runInsert("\n\nhttps://vimeo.com/148751763\n\n")}
          >
            Insert sample Vimeo URL
          </Button>
        </TabsContent>
        <TabsContent value="latex" className="space-y-2">
          <p className="text-muted-foreground">
            Inline math: <code className="text-foreground">$E = mc^2$</code>
            <br />
            Display math: use <code className="text-foreground">$$</code> on
            their own lines.
          </p>
          <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-2 text-xs text-foreground">{`$$
\\int_0^1 x\\,dx = \\frac{1}{2}
$$`}</pre>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              runInsert(
                "\n\n$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$\n\n",
              )
            }
          >
            Insert display equation
          </Button>
        </TabsContent>
      </Tabs>

      <div
        className={cn(
          "grid min-h-[min(70vh,640px)] flex-1",
          showEditor &&
            showPreview &&
            "grid-cols-1 divide-y divide-border xl:grid-cols-2 xl:divide-x xl:divide-y-0",
        )}
      >
        {showEditor ? (
          <div className="flex min-h-0 min-w-0 flex-col xl:border-r">
            <CodeMirror
              ref={cmRef}
              value={value}
              height="100%"
              minHeight="min(70vh, 640px)"
              className="size-full min-h-[min(70vh,640px)] overflow-hidden rounded-none border-0 bg-background text-foreground [&_.cm-editor]:outline-none [&_.cm-focused]:outline-none"
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              extensions={extensions}
              placeholder={placeholder}
              onChange={onChange}
            />
          </div>
        ) : null}
        {showPreview ? (
          <div
            className={cn(
              "markdown-pane min-h-0 min-w-0 overflow-y-auto bg-muted/15 p-4 xl:max-h-[min(70vh,640px)]",
              !showEditor && "col-span-full",
            )}
          >
            {value.trim() ? (
              <MarkdownBody markdown={value} />
            ) : (
              <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
