"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { marked } from "marked"
import TurndownService from "turndown"
import {
  IconBlockquote,
  IconBold,
  IconCheck,
  IconCode,
  IconDownload,
  IconFileImport,
  IconH2,
  IconItalic,
  IconList,
  IconListNumbers,
  IconPhotoPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  onUploadImage: (file: File) => Promise<string>
  onImageRemoved: (url: string) => void
  error?: string
}

const lowlight = createLowlight(common)
const turndown = new TurndownService()
const codeLanguages = [
  { value: "plaintext", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "TSX" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
] as const

turndown.addRule("fencedCodeBlocks", {
  filter: ["pre"],
  replacement(content: string, node: Node) {
    const codeNode = node.firstChild as HTMLElement | null
    const codeText = codeNode?.textContent ?? content
    return `\n\n\`\`\`\n${codeText.trim()}\n\`\`\`\n\n`
  },
})

export function RichTextEditor({
  value,
  onChange,
  onUploadImage,
  onImageRemoved,
  error,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previousImageUrlsRef = useRef<Set<string>>(new Set())
  const imageActionRef = useRef<"insert" | "replace">("insert")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isImageActive, setIsImageActive] = useState(false)
  const [markdownDraft, setMarkdownDraft] = useState("")
  const [isMarkdownPanelOpen, setIsMarkdownPanelOpen] = useState(false)
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false)
  const [codeDraft, setCodeDraft] = useState("")
  const [languageQuery, setLanguageQuery] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<
    (typeof codeLanguages)[number]["value"]
  >("plaintext")
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "ProseMirror min-h-72 w-full rounded-b-md border border-t-0 border-border bg-background px-3 py-2 text-sm text-foreground outline-none [&_img]:my-3 [&_img]:max-h-96 [&_img]:w-full [&_img]:rounded-md [&_img]:border [&_img]:object-cover [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:bg-muted/60 [&_pre]:p-3 [&_pre]:text-foreground [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML()
      onChange(html)

      const currentImageUrls = new Set(
        Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)).map(
          (match) => match[1],
        ),
      )

      const removedImageUrls = Array.from(previousImageUrlsRef.current).filter(
        (url) => !currentImageUrls.has(url),
      )

      previousImageUrlsRef.current = currentImageUrls
      for (const removedUrl of removedImageUrls) {
        onImageRemoved(removedUrl)
      }
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      setIsImageActive(currentEditor.isActive("image"))
    },
  })
  const toggleButtonVariant = (isActive: boolean) =>
    isActive ? "secondary" : "ghost"

  useEffect(() => {
    if (!editor || editor.getHTML() === value) {
      return
    }

    editor.commands.setContent(value, { emitUpdate: false })
    previousImageUrlsRef.current = new Set(
      Array.from(value.matchAll(/<img[^>]+src=["']([^"']+)["']/g)).map(
        (match) => match[1],
      ),
    )
  }, [editor, value])

  useEffect(() => {
    if (!editor) return

    setIsImageActive(editor.isActive("image"))
  }, [editor])

  const handleImagePick = () => fileInputRef.current?.click()

  const handleImageSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file || !editor) return

    setIsUploadingImage(true)
    try {
      const imageUrl = await onUploadImage(file)

      if (imageActionRef.current === "replace") {
        editor.chain().focus().updateAttributes("image", { src: imageUrl }).run()
      } else {
        editor.chain().focus().setImage({ src: imageUrl }).run()
      }
    } finally {
      setIsUploadingImage(false)
      imageActionRef.current = "insert"
      event.target.value = ""
    }
  }

  const handleDropImageUpload = async (files: File[]) => {
    if (!editor) return
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    if (imageFiles.length === 0) return

    setIsUploadingImage(true)
    try {
      for (const file of imageFiles) {
        const imageUrl = await onUploadImage(file)
        editor.chain().focus().setImage({ src: imageUrl }).run()
      }
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleExportMarkdown = async () => {
    if (!editor) return
    const markdown = turndown.turndown(editor.getHTML())
    try {
      await navigator.clipboard.writeText(markdown)
    } catch {
      window.prompt("Copy markdown", markdown)
    }
  }

  const handleApplyMarkdown = () => {
    if (!editor) return
    const parsed = marked.parse(markdownDraft)
    const html = typeof parsed === "string" ? parsed : ""
    editor.commands.setContent(html)
    setIsMarkdownPanelOpen(false)
  }

  const openCodePanel = () => {
    if (!editor) return

    const activeLanguage = editor.getAttributes("codeBlock").language as
      | string
      | undefined
    const normalizedLanguage = codeLanguages.some(
      (language) => language.value === activeLanguage,
    )
      ? (activeLanguage as (typeof codeLanguages)[number]["value"])
      : "plaintext"

    setSelectedLanguage(normalizedLanguage)
    setLanguageQuery("")
    setCodeDraft(editor.isActive("codeBlock") ? editor.getText() : "")
    setIsCodePanelOpen(true)
  }

  const closeCodePanel = () => {
    setIsCodePanelOpen(false)
    setCodeDraft("")
    setLanguageQuery("")
    setSelectedLanguage("plaintext")
  }

  const handleInsertCodeBlock = () => {
    if (!editor || !codeDraft.trim()) return

    editor
      .chain()
      .focus()
      .setCodeBlock({
        language: selectedLanguage,
      })
      .insertContent(codeDraft)
      .run()
    closeCodePanel()
  }

  const filteredCodeLanguages = codeLanguages.filter((language) =>
    language.label.toLowerCase().includes(languageQuery.trim().toLowerCase()),
  )

  return (
    <div className="flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelected}
      />
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 rounded-t-md border border-border bg-muted/40 p-1",
          error && "border-destructive/60",
        )}
      >
        <Button
          type="button"
          variant={toggleButtonVariant(Boolean(editor?.isActive("bold")))}
          size="sm"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          aria-label="Bold (Ctrl/Cmd+B)"
          title="Bold (Ctrl/Cmd+B)"
          aria-pressed={Boolean(editor?.isActive("bold"))}
          disabled={!editor?.can().chain().focus().toggleBold().run()}
        >
          <IconBold />
        </Button>
        <Button
          type="button"
          variant={toggleButtonVariant(Boolean(editor?.isActive("italic")))}
          size="sm"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          aria-label="Italic (Ctrl/Cmd+I)"
          title="Italic (Ctrl/Cmd+I)"
          aria-pressed={Boolean(editor?.isActive("italic"))}
          disabled={!editor?.can().chain().focus().toggleItalic().run()}
        >
          <IconItalic />
        </Button>
        <Button
          type="button"
          variant={toggleButtonVariant(Boolean(editor?.isActive("heading", { level: 2 })))}
          size="sm"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Heading 2"
          title="Heading 2"
          aria-pressed={Boolean(editor?.isActive("heading", { level: 2 }))}
          disabled={!editor?.can().chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <IconH2 />
        </Button>
        <Button
          type="button"
          variant={toggleButtonVariant(Boolean(editor?.isActive("bulletList")))}
          size="sm"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
          title="Bullet list"
          aria-pressed={Boolean(editor?.isActive("bulletList"))}
          disabled={!editor?.can().chain().focus().toggleBulletList().run()}
        >
          <IconList />
        </Button>
        <Button
          type="button"
          variant={toggleButtonVariant(Boolean(editor?.isActive("orderedList")))}
          size="sm"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered list"
          title="Ordered list"
          aria-pressed={Boolean(editor?.isActive("orderedList"))}
          disabled={!editor?.can().chain().focus().toggleOrderedList().run()}
        >
          <IconListNumbers />
        </Button>
        <Button
          type="button"
          variant={toggleButtonVariant(Boolean(editor?.isActive("blockquote")))}
          size="sm"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          aria-label="Quote"
          title="Block quote"
          aria-pressed={Boolean(editor?.isActive("blockquote"))}
          disabled={!editor?.can().chain().focus().toggleBlockquote().run()}
        >
          <IconBlockquote />
        </Button>
        <Button
          type="button"
          variant={toggleButtonVariant(Boolean(editor?.isActive("codeBlock")))}
          size="sm"
          onClick={openCodePanel}
          aria-label="Code block"
          title="Insert code block"
          aria-pressed={Boolean(editor?.isActive("codeBlock"))}
          disabled={!editor}
        >
          <IconCode />
          Code
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImagePick}
          aria-label="Insert image"
          disabled={isUploadingImage}
        >
          <IconPhotoPlus data-icon="inline-start" />
          {isUploadingImage ? "Uploading..." : "Image"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            imageActionRef.current = "replace"
            handleImagePick()
          }}
          aria-label="Replace selected image"
          disabled={!isImageActive || isUploadingImage}
        >
          <IconRefresh data-icon="inline-start" />
          Replace
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (!editor?.isActive("image")) return
            editor.chain().focus().deleteSelection().run()
          }}
          aria-label="Remove selected image"
          disabled={!isImageActive || isUploadingImage}
        >
          <IconTrash data-icon="inline-start" />
          Remove
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleExportMarkdown}
          aria-label="Export markdown"
        >
          <IconDownload data-icon="inline-start" />
          Export MD
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setMarkdownDraft(turndown.turndown(value))
            setIsMarkdownPanelOpen((open) => !open)
          }}
          aria-label="Import markdown"
        >
          <IconFileImport data-icon="inline-start" />
          Import MD
        </Button>
      </div>
      {isMarkdownPanelOpen ? (
        <div className="rounded-none border-x border-border bg-muted/30 p-3">
          <textarea
            value={markdownDraft}
            onChange={(event) => setMarkdownDraft(event.target.value)}
            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            placeholder="Paste markdown here..."
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMarkdownPanelOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleApplyMarkdown}>
              Apply Markdown
            </Button>
          </div>
        </div>
      ) : null}
      {isCodePanelOpen ? (
        <div className="rounded-none border-x border-border bg-muted/30 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="code-language" className="text-xs text-muted-foreground">
              Language
            </label>
            <input
              type="text"
              value={languageQuery}
              onChange={(event) => setLanguageQuery(event.target.value)}
              placeholder="Search language..."
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            />
            <select
              id="code-language"
              value={selectedLanguage}
              onChange={(event) =>
                setSelectedLanguage(
                  event.target.value as (typeof codeLanguages)[number]["value"],
                )
              }
              className="rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              {filteredCodeLanguages.length > 0 ? (
                filteredCodeLanguages.map((language) => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))
              ) : (
                <option value={selectedLanguage}>No matching language</option>
              )}
            </select>
          </div>
          <textarea
            value={codeDraft}
            onChange={(event) => setCodeDraft(event.target.value)}
            className="mt-2 min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none"
            placeholder="Paste or type your code here..."
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={closeCodePanel}>
              <IconX data-icon="inline-start" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleInsertCodeBlock}
              disabled={!codeDraft.trim()}
            >
              <IconCheck data-icon="inline-start" />
              Insert Code Block
            </Button>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "[&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-muted-foreground [&_p.is-editor-empty:first-child::before]:content-['Write_the_project_story,_results,_and_implementation_details...']",
          error && "[&_.ProseMirror]:border-destructive/60",
        )}
      >
        <EditorContent
          editor={editor}
          onDrop={(event) => {
            const files = Array.from(event.dataTransfer?.files ?? [])
            const hasImages = files.some((file) => file.type.startsWith("image/"))
            if (!hasImages) return

            event.preventDefault()
            void handleDropImageUpload(files)
          }}
        />
      </div>
    </div>
  )
}
