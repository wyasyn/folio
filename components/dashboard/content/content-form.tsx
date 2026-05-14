"use client"

import { type FormEvent, useMemo, useRef, useState } from "react"
import { IconArrowRight, IconLoader, IconSparkles } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ImageUploadDropzone } from "@/components/ui/image-upload-dropzone"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownSplitEditor } from "@/components/dashboard/content/markdown-split-editor"
import { TechStackMultiSelect } from "@/components/dashboard/projects/tech-stack-multi-select"
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload"
import { uploadPresets } from "@/lib/upload-presets"
import {
  collectMediaUrlsFromContent,
  isMarkdownContentEmpty,
  normalizeStoredContentToMarkdown,
} from "@/lib/content-markdown"
import { cn } from "@/lib/utils"

export type ContentKind = "posts" | "news"

export type ContentFormInitial = {
  title: string
  description: string
  content: string
  coverImage: string
  readTime: number
  published: boolean
  featured: boolean
  tags: string[]
}

type ContentFormProps = {
  kind: ContentKind
  mode: "create" | "edit"
  userId: string | null
  itemId?: number
  tagOptions: string[]
  initial?: ContentFormInitial
}

type FormErrors = Partial<Record<keyof ContentFormInitial, string>> & {
  global?: string
}

const DEFAULT_TAGS = [
  "Engineering",
  "Product",
  "Design",
  "AI",
  "Web",
  "Launch",
  "Case Study",
]

function defaultFormState(): ContentFormInitial {
  return {
    title: "",
    description: "",
    content: "",
    coverImage: "",
    readTime: 0,
    published: true,
    featured: false,
    tags: [],
  }
}

function labelFor(kind: ContentKind) {
  return kind === "posts" ? "post" : "news item"
}

export function ContentForm({
  kind,
  mode,
  userId,
  itemId,
  tagOptions,
  initial,
}: ContentFormProps) {
  const router = useRouter()
  const pendingDeletedEditorImagesRef = useRef<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [form, setForm] = useState<ContentFormInitial>(() => {
    const base =
      mode === "edit" && initial ? { ...initial } : defaultFormState()
    return {
      ...base,
      content: normalizeStoredContentToMarkdown(base.content),
    }
  })

  const availableTags = useMemo(
    () => Array.from(new Set([...tagOptions, ...DEFAULT_TAGS])).sort(),
    [tagOptions]
  )

  const validate = () => {
    const nextErrors: FormErrors = {}
    if (!form.title.trim()) nextErrors.title = "Title is required."
    if (isMarkdownContentEmpty(form.content))
      nextErrors.content = "Content is required."
    if (form.tags.length === 0) nextErrors.tags = "Select at least one tag."
    if (
      !Number.isFinite(form.readTime) ||
      form.readTime < 0 ||
      form.readTime > 240
    ) {
      nextErrors.readTime = "Read time must be between 0 and 240 minutes."
    }
    if (!userId)
      nextErrors.global = `No author profile was found for this ${labelFor(kind)}.`
    if (mode === "edit" && (!itemId || itemId < 1)) {
      nextErrors.global = `Missing ${labelFor(kind)} identifier.`
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const deleteImageFromCloudinary = async (url: string) => {
    try {
      await fetch("/api/uploads/cloudinary-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
    } catch {
      // Best effort cleanup: do not block editor interactions.
    }
  }

  const handleEditorChange = (content: string) => {
    const currentUrls = collectMediaUrlsFromContent(content)
    for (const url of Array.from(pendingDeletedEditorImagesRef.current)) {
      if (currentUrls.has(url))
        pendingDeletedEditorImagesRef.current.delete(url)
    }
    setForm((current) => ({ ...current, content }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage("")
    if (!validate()) return

    setIsSubmitting(true)
    setErrors((current) => ({ ...current, global: undefined }))

    const body = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      content: form.content,
      coverImage: form.coverImage || undefined,
      readTime: form.readTime,
      tags: form.tags,
      published: form.published,
      featured: form.featured,
    }
    const url =
      mode === "create" ? `/api/${kind}` : `/api/${kind}/${itemId as number}`
    const method = mode === "create" ? "POST" : "PATCH"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok)
        throw new Error(result.error ?? `Unable to save ${labelFor(kind)}.`)

      const pendingImageDeletes = Array.from(
        pendingDeletedEditorImagesRef.current
      )
      pendingDeletedEditorImagesRef.current.clear()
      await Promise.all(
        pendingImageDeletes.map((url) => deleteImageFromCloudinary(url))
      )

      setSuccessMessage(
        mode === "create"
          ? `${labelFor(kind)} created successfully. Redirecting...`
          : `${labelFor(kind)} updated successfully. Redirecting...`
      )
      setTimeout(
        () => router.push(`/dashboard/${kind}`),
        mode === "create" ? 700 : 500
      )
    } catch (error) {
      setErrors((current) => ({
        ...current,
        global:
          error instanceof Error ? error.message : "Something went wrong.",
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const preset =
    kind === "posts" ? uploadPresets.postCover : uploadPresets.newsCover
  const submitLabel =
    mode === "create" ? `Create ${labelFor(kind)}` : "Save changes"
  const SubmitIcon = mode === "create" ? IconArrowRight : IconSparkles

  const inlineImageFolder =
    kind === "posts" ? uploadPresets.postCover.folder : uploadPresets.newsCover.folder

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]"
    >
      <div className="flex justify-end xl:col-span-2">
        <Button type="submit" disabled={isSubmitting || !userId}>
          {isSubmitting && (
            <IconLoader data-icon="inline-start" className="animate-spin" />
          )}
          {submitLabel} <SubmitIcon className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder={
              kind === "posts"
                ? "How I built a scalable dashboard"
                : "Product launch update"
            }
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && (
            <span className="text-xs text-destructive">{errors.title}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Optional short summary for listings and previews."
            className="min-h-28 resize-y"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>Tags</Label>
          <TechStackMultiSelect
            options={availableTags}
            value={form.tags}
            onChange={(tags) => setForm((current) => ({ ...current, tags }))}
            error={errors.tags}
          />
          {errors.tags && (
            <span className="text-xs text-destructive">{errors.tags}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Cover Image</Label>
          <ImageUploadDropzone
            value={form.coverImage}
            onChange={(coverImage) =>
              setForm((current) => ({ ...current, coverImage }))
            }
            onUpload={(file) =>
              uploadImageToCloudinary(file, { folder: preset.folder })
            }
            onRemove={deleteImageFromCloudinary}
            maxSizeMB={preset.maxSizeMB}
            dropTitle={preset.dropTitle}
            dropHint={preset.dropHint}
            selectLabel={preset.selectLabel}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="read-time">Read time (minutes)</Label>
          <Input
            id="read-time"
            type="number"
            min={0}
            max={240}
            value={form.readTime}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                readTime: Number.parseInt(event.target.value || "0", 10),
              }))
            }
            aria-invalid={Boolean(errors.readTime)}
          />
          {errors.readTime && (
            <span className="text-xs text-destructive">{errors.readTime}</span>
          )}
        </div>

        {(["published", "featured"] as const).map((field) => (
          <div
            key={field}
            className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {field === "published" ? "Published" : "Featured"}
              </span>
              <span className="text-xs text-muted-foreground">
                {field === "published"
                  ? `Make this ${labelFor(kind)} visible on the public site.`
                  : `Highlight this ${labelFor(kind)} in featured areas.`}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form[field]}
              onClick={() =>
                setForm((current) => ({ ...current, [field]: !current[field] }))
              }
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                form[field] ? "bg-primary" : "bg-muted-foreground/40"
              )}
            >
              <span
                className={cn(
                  "inline-block size-5 translate-x-0.5 rounded-full bg-background shadow transition-transform",
                  form[field] && "translate-x-5"
                )}
              />
            </button>
          </div>
        ))}

        {errors.global && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.global}
          </p>
        )}
        {successMessage && (
          <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {successMessage}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6 xl:col-span-2">
        <div className="flex flex-col gap-2">
          <Label>Content</Label>
          <MarkdownSplitEditor
            value={form.content}
            onChange={handleEditorChange}
            onUploadImage={uploadImageToCloudinary}
            cloudinaryFolder={inlineImageFolder}
            onImageRemoved={(url) =>
              pendingDeletedEditorImagesRef.current.add(url)
            }
            error={errors.content}
            placeholder={
              kind === "posts"
                ? "Write your post in Markdown…"
                : "Write your announcement in Markdown…"
            }
          />
          {errors.content && (
            <span className="text-xs text-destructive">{errors.content}</span>
          )}
        </div>
      </div>
    </form>
  )
}
