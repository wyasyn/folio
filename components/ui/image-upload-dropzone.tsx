"use client"

import { useMemo, useRef, useState } from "react"
import {
  IconAlertCircle,
  IconPhoto,
  IconUpload,
  IconX,
  IconLoader,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ImageUploadDropzoneProps = {
  value?: string
  onChange: (url: string) => void
  onRemove?: (url: string) => Promise<void> | void
  onUpload: (file: File) => Promise<string>
  maxSizeMB?: number
  dropTitle?: string
  dropHint?: string
  selectLabel?: string
  className?: string
}

export function ImageUploadDropzone({
  value = "",
  onChange,
  onRemove,
  onUpload,
  maxSizeMB = 5,
  dropTitle = "Drop your image here",
  dropHint,
  selectLabel = "Select image",
  className,
}: ImageUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const maxSize = maxSizeMB * 1024 * 1024
  const previewUrl = useMemo(() => value || null, [value])

  const handleUpload = async (file: File) => {
    setError("")
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSizeMB}MB.`)
      return
    }

    setIsUploading(true)
    try {
      const uploadedUrl = await onUpload(file)
      onChange(uploadedUrl)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Could not upload image.",
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative">
        <div
          data-dragging={isDragging || undefined}
          className="border-input data-[dragging=true]:bg-accent/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors"
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
            const file = event.dataTransfer.files?.[0]
            if (file) void handleUpload(file)
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleUpload(file)
            }}
            aria-label="Upload image file"
            disabled={isUploading}
          />

          {previewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={previewUrl}
                alt="Uploaded image preview"
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <IconPhoto className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">{dropTitle}</p>
              <p className="text-muted-foreground text-xs">
                {dropHint ?? `SVG, PNG, JPG or GIF (max. ${maxSizeMB}MB)`}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
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
          )}
        </div>
        {previewUrl ? (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              aria-label="Remove image"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={async () => {
                setError("")
                if (previewUrl && onRemove) {
                  await onRemove(previewUrl)
                }
                onChange("")
              }}
            >
              <IconX className="size-4" />
            </button>
          </div>
        ) : null}
      </div>
      {error ? (
        <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
          <IconAlertCircle className="size-3 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  )
}
