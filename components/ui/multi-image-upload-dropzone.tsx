"use client"

import { useRef, useState } from "react"
import {
  IconAlertCircle,
  IconPhoto,
  IconUpload,
  IconX,
  IconLoader,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FileError = { name: string; message: string }

type MultiImageUploadDropzoneProps = {
  value: string[]
  onChange: (urls: string[]) => void
  onRemove?: (url: string) => Promise<void> | void
  onUpload: (file: File) => Promise<string>
  maxSizeMB?: number
  maxFiles?: number
  dropTitle?: string
  dropHint?: string
  selectLabel?: string
  className?: string
}

export function MultiImageUploadDropzone({
  value,
  onChange,
  onRemove,
  onUpload,
  maxSizeMB = 5,
  maxFiles = 20,
  dropTitle = "Drop images here",
  dropHint,
  selectLabel = "Select images",
  className,
}: MultiImageUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [batchError, setBatchError] = useState("")
  const [fileErrors, setFileErrors] = useState<FileError[]>([])

  const maxSize = maxSizeMB * 1024 * 1024
  const atLimit = value.length >= maxFiles

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return

    const images = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    )
    if (images.length === 0) {
      setBatchError("No image files in the selection.")
      setFileErrors([])
      return
    }

    if (atLimit) {
      setBatchError(`You can add at most ${maxFiles} screenshots.`)
      setFileErrors([])
      return
    }

    const remaining = maxFiles - value.length
    const toUpload = images.slice(0, remaining)
    if (images.length > remaining) {
      setBatchError(
        `Only the first ${remaining} file(s) were queued (limit ${maxFiles}).`,
      )
    } else {
      setBatchError("")
    }

    setIsUploading(true)
    setFileErrors([])

    const results = await Promise.all(
      toUpload.map(async (file) => {
        if (file.size > maxSize) {
          return {
            ok: false as const,
            name: file.name,
            message: `Exceeds ${maxSizeMB}MB`,
          }
        }
        try {
          const url = await onUpload(file)
          return { ok: true as const, url }
        } catch (uploadError) {
          return {
            ok: false as const,
            name: file.name,
            message:
              uploadError instanceof Error
                ? uploadError.message
                : "Could not upload image.",
          }
        }
      }),
    )

    const newUrls = results
      .filter((r): r is { ok: true; url: string } => r.ok)
      .map((r) => r.url)
    const errs = results
      .filter((r): r is { ok: false; name: string; message: string } => !r.ok)
      .map((r) => ({ name: r.name, message: r.message }))

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls])
    }
    if (errs.length > 0) {
      setFileErrors(errs)
    }

    setIsUploading(false)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const removeAt = async (url: string) => {
    setBatchError("")
    setFileErrors([])
    if (onRemove) {
      await onRemove(url)
    }
    onChange(value.filter((item) => item !== url))
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((url) => (
            <li
              key={url}
              className="border-input relative aspect-video overflow-hidden rounded-lg border bg-muted/30"
            >
              <img
                src={url}
                alt=""
                className="size-full object-cover"
              />
              <button
                type="button"
                aria-label="Remove image"
                className="focus-visible:border-ring focus-visible:ring-ring/50 absolute right-1.5 top-1.5 z-10 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:ring-[3px]"
                onClick={() => void removeAt(url)}
                disabled={isUploading}
              >
                <IconX className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!atLimit ? (
        <div
          data-dragging={isDragging || undefined}
          className="border-input data-[dragging=true]:bg-accent/50 relative flex min-h-40 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors"
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDragging(false)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            void processFiles(event.dataTransfer.files)
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              void processFiles(event.target.files)
            }}
            aria-label="Upload image files"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center px-4 py-2 text-center">
            <div
              className="bg-background mb-2 flex size-10 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              {isUploading ? (
                <IconLoader className="size-4 animate-spin opacity-60" />
              ) : (
                <IconPhoto className="size-4 opacity-60" />
              )}
            </div>
            <p className="mb-1 text-sm font-medium">{dropTitle}</p>
            <p className="text-muted-foreground text-xs">
              {dropHint ?? `Images up to ${maxSizeMB}MB each (max ${maxFiles})`}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? (
                <IconLoader className="-ms-1 size-4 animate-spin opacity-60" />
              ) : (
                <IconUpload className="-ms-1 size-4 opacity-60" />
              )}
              {isUploading ? "Uploading..." : selectLabel}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          Maximum of {maxFiles} screenshots reached. Remove one to add more.
        </p>
      )}

      {batchError ? (
        <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
          <IconAlertCircle className="size-3 shrink-0" />
          <span>{batchError}</span>
        </div>
      ) : null}

      {fileErrors.length > 0 ? (
        <ul className="text-destructive space-y-1 text-xs" role="alert">
          {fileErrors.map((err) => (
            <li key={`${err.name}-${err.message}`} className="flex gap-1">
              <IconAlertCircle className="mt-0.5 size-3 shrink-0" />
              <span>
                <span className="font-medium">{err.name}</span>: {err.message}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
