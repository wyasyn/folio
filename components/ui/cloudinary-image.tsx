"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  cloudinaryUrl,
  DEFAULT_BLUR_DATA_URL,
  fetchBlurDataUrl,
  isOptimizableImageUrl,
  PRESET_DIMENSIONS,
  type CloudinaryImagePreset,
} from "@/lib/cloudinary"
import { cn } from "@/lib/utils"

type CloudinaryImageProps = {
  src: string
  alt: string
  preset?: CloudinaryImagePreset
  sizes?: string
  priority?: boolean
  className?: string
  fill?: boolean
  width?: number
  height?: number
  style?: React.CSSProperties
  /** Precomputed on the server when possible for instant, accurate blur. */
  blurDataURL?: string
  onError?: () => void
}

export function CloudinaryImage({
  src,
  alt,
  preset = "full",
  sizes,
  priority = false,
  className,
  fill,
  width,
  height,
  style,
  blurDataURL: blurDataURLProp,
  onError,
}: CloudinaryImageProps) {
  const [blurDataURL, setBlurDataURL] = useState(
    blurDataURLProp ?? DEFAULT_BLUR_DATA_URL,
  )

  useEffect(() => {
    if (blurDataURLProp) {
      setBlurDataURL(blurDataURLProp)
      return
    }
    let cancelled = false
    void fetchBlurDataUrl(src).then((dataUrl) => {
      if (!cancelled) setBlurDataURL(dataUrl)
    })
    return () => {
      cancelled = true
    }
  }, [src, blurDataURLProp])

  if (!src.trim()) return null

  const optimizedSrc = cloudinaryUrl(src, preset)
  const dims = PRESET_DIMENSIONS[preset]
  const useFill = fill ?? (!width && !height)

  if (!isOptimizableImageUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- unknown remote hosts
      <img
        src={src}
        alt={alt}
        className={cn(useFill && "object-cover", className)}
        style={style}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={onError}
      />
    )
  }

  const shared = {
    src: optimizedSrc,
    alt,
    className: cn(useFill && "object-cover", className),
    style,
    priority,
    sizes,
    onError,
    placeholder: "blur" as const,
    blurDataURL,
  }

  if (useFill) {
    return <Image {...shared} fill />
  }

  return (
    <Image
      {...shared}
      width={width ?? dims.width}
      height={height ?? dims.height}
    />
  )
}
