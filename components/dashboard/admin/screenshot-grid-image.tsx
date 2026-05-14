"use client"

import { useState } from "react"
import { IconPhoto } from "@tabler/icons-react"

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
    // eslint-disable-next-line @next/next/no-img-element -- URLs may be any host
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 size-full object-cover"
      loading="lazy"
      decoding="async"
      style={
        screenshotId != null
          ? { viewTransitionName: `admin-screenshot-${screenshotId}` }
          : undefined
      }
      onError={() => setFailed(true)}
    />
  )
}
