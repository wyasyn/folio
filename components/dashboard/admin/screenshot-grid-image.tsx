"use client"

import { useState } from "react"
import { IconPhoto } from "@tabler/icons-react"
import { CloudinaryImage } from "@/components/ui/cloudinary-image"

type ScreenshotGridImageProps = {
  src: string
  alt: string
  /** When set, participates in shared view transitions with the photo viewer image. */
  screenshotId?: number
}

export function ScreenshotGridImage({
  src,
  alt,
  screenshotId,
}: ScreenshotGridImageProps) {
  const [failed, setFailed] = useState(!src.trim())

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
        <IconPhoto className="size-12 opacity-40" aria-hidden />
        <span className="sr-only">Image unavailable</span>
      </div>
    )
  }

  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      preset="screenshot"
      fill
      sizes="(max-width: 768px) 50vw, 25vw"
      className="object-cover"
      style={
        screenshotId != null
          ? { viewTransitionName: `admin-screenshot-${screenshotId}` }
          : undefined
      }
      onError={() => setFailed(true)}
    />
  )
}
