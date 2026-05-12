"use client"

import { type FormEvent, useMemo, useRef, useState } from "react"
import { IconArrowRight, IconLoader, IconSparkles } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/dashboard/projects/rich-text-editor"
import { TechStackMultiSelect } from "@/components/dashboard/projects/tech-stack-multi-select"
import { ImageUploadDropzone } from "@/components/ui/image-upload-dropzone"
import { MultiImageUploadDropzone } from "@/components/ui/multi-image-upload-dropzone"
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload"
import { uploadPresets } from "@/lib/upload-presets"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type NewProjectFormProps = {
  userId: string | null
  techStackOptions: string[]
}

type FormState = {
  title: string
  description: string
  content: string
  coverImage: string
  screenshots: string[]
  liveUrl: string
  githubUrl: string
  published: boolean
  techStacks: string[]
}

type FormErrors = Partial<Record<keyof FormState, string>> & {
  global?: string
}

const DEFAULT_TECH_STACKS = [
  "Next.js",
  "TypeScript",
  "React",
  "Tailwind CSS",
  "Prisma",
  "PostgreSQL",
  "Node.js",
  "Cloudinary",
]

const EMPTY_PARAGRAPH_PATTERN = /^<(p|h[1-6]|blockquote)>(\s|&nbsp;|<br\s*\/?>)*<\/(p|h[1-6]|blockquote)>$/i

const isRichTextEmpty = (value: string) => {
  if (/<img\b/i.test(value)) return false

  const stripped = value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
  return stripped.length === 0 || EMPTY_PARAGRAPH_PATTERN.test(value.trim())
}

export function NewProjectForm({ userId, techStackOptions }: NewProjectFormProps) {
  const router = useRouter()
  const pendingDeletedEditorImagesRef = useRef<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    content: "<p></p>",
    coverImage: "",
    screenshots: [],
    liveUrl: "",
    githubUrl: "",
    published: true,
    techStacks: [],
  })

  const availableTechStacks = useMemo(
    () => Array.from(new Set([...techStackOptions, ...DEFAULT_TECH_STACKS])).sort(),
    [techStackOptions],
  )

  const validate = () => {
    const nextErrors: FormErrors = {}

    if (!form.title.trim()) nextErrors.title = "Title is required."
    if (!form.description.trim())
      nextErrors.description = "Description is required."
    if (isRichTextEmpty(form.content))
      nextErrors.content = "Content is required."
    if (form.techStacks.length === 0)
      nextErrors.techStacks = "Select at least one tech stack."
    if (typeof form.published !== "boolean")
      nextErrors.published = "Choose a publish state."
    if (!userId) nextErrors.global = "No author profile was found for this project."

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

  const getImageUrlsFromHtml = (html: string) =>
    new Set(
      Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)).map(
        (match) => match[1],
      ),
    )

  const handleEditorChange = (content: string) => {
    const currentUrls = getImageUrlsFromHtml(content)
    for (const url of Array.from(pendingDeletedEditorImagesRef.current)) {
      if (currentUrls.has(url)) {
        pendingDeletedEditorImagesRef.current.delete(url)
      }
    }
    setForm((current) => ({ ...current, content }))
  }

  const queueEditorImageDeletion = (url: string) => {
    pendingDeletedEditorImagesRef.current.add(url)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage("")

    if (!validate()) return

    setIsSubmitting(true)
    setErrors((current) => ({ ...current, global: undefined }))

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          content: form.content,
          coverImage: form.coverImage || undefined,
          screenshots: form.screenshots,
          liveUrl: form.liveUrl.trim() || undefined,
          githubUrl: form.githubUrl.trim() || undefined,
          techStacks: form.techStacks,
          published: form.published,
        }),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create project.")
      }

      const pendingImageDeletes = Array.from(pendingDeletedEditorImagesRef.current)
      pendingDeletedEditorImagesRef.current.clear()
      await Promise.all(
        pendingImageDeletes.map((url) => deleteImageFromCloudinary(url)),
      )

      setSuccessMessage("Project created successfully. Redirecting...")
      setTimeout(() => router.push("/dashboard/projects"), 700)
    } catch (error) {
      setErrors((current) => ({
        ...current,
        global: error instanceof Error ? error.message : "Something went wrong.",
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="xl:col-span-2 flex justify-end">
        <Button
          type="submit"
          size="default"
          className="w-fit"
          disabled={isSubmitting || !userId}
        >
          {isSubmitting && <IconLoader data-icon="inline-start" className="animate-spin" />}
          Create Project <IconArrowRight className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title
          </Label>
          <Input
            id="title"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="AI Sales Assistant Platform"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && (
            <span className="text-xs text-destructive">{errors.title}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="A concise summary of the product and business impact."
            className="min-h-32 resize-y"
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && (
            <span className="text-xs text-destructive">{errors.description}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor
            value={form.content}
            onChange={handleEditorChange}
            onUploadImage={uploadImageToCloudinary}
            onImageRemoved={queueEditorImageDeletion}
            error={errors.content}
          />
          {errors.content && (
            <span className="text-xs text-destructive">{errors.content}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        

        <div className="space-y-2">
          <Label>Tech Stacks</Label>
          <TechStackMultiSelect
            options={availableTechStacks}
            value={form.techStacks}
            onChange={(techStacks) => setForm((current) => ({ ...current, techStacks }))}
            error={errors.techStacks}
          />
          {errors.techStacks && (
            <span className="text-xs text-destructive">{errors.techStacks}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label>Cover Image</Label>
          <ImageUploadDropzone
            value={form.coverImage}
            onChange={(coverImage) =>
              setForm((current) => ({ ...current, coverImage }))
            }
            onUpload={(file) =>
              uploadImageToCloudinary(file, {
                folder: uploadPresets.projectCover.folder,
              })
            }
            onRemove={deleteImageFromCloudinary}
            maxSizeMB={uploadPresets.projectCover.maxSizeMB}
            dropTitle={uploadPresets.projectCover.dropTitle}
            dropHint={uploadPresets.projectCover.dropHint}
            selectLabel={uploadPresets.projectCover.selectLabel}
          />
          {errors.coverImage && (
            <span className="text-xs text-destructive">{errors.coverImage}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label>Screenshots</Label>
          <p className="text-muted-foreground text-xs">
            Optional gallery — upload several images at once or add them in batches.
          </p>
          <MultiImageUploadDropzone
            value={form.screenshots}
            onChange={(screenshots) =>
              setForm((current) => ({ ...current, screenshots }))
            }
            onUpload={(file) =>
              uploadImageToCloudinary(file, {
                folder: uploadPresets.projectScreenshots.folder,
              })
            }
            onRemove={deleteImageFromCloudinary}
            maxSizeMB={uploadPresets.projectScreenshots.maxSizeMB}
            maxFiles={20}
            dropTitle={uploadPresets.projectScreenshots.dropTitle}
            dropHint={uploadPresets.projectScreenshots.dropHint}
            selectLabel={uploadPresets.projectScreenshots.selectLabel}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="live-url">Live URL</Label>
          <Input
            id="live-url"
            type="url"
            value={form.liveUrl}
            onChange={(event) =>
              setForm((current) => ({ ...current, liveUrl: event.target.value }))
            }
            placeholder="https://your-project.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github-url">GitHub URL</Label>
          <Input
            id="github-url"
            type="url"
            value={form.githubUrl}
            onChange={(event) =>
              setForm((current) => ({ ...current, githubUrl: event.target.value }))
            }
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Published</span>
            <span className="text-xs text-muted-foreground">
              Mark this project visible on your portfolio.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.published}
            onClick={() =>
              setForm((current) => ({ ...current, published: !current.published }))
            }
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              form.published ? "bg-primary" : "bg-muted-foreground/40",
            )}
          >
            <span
              className={cn(
                "inline-block size-5 translate-x-0.5 rounded-full bg-background shadow transition-transform",
                form.published && "translate-x-5",
              )}
            />
          </button>
        </div>

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
    </form>
  )
}
