"use client"

import Image from "next/image"
import {
  cloudinaryBlurUrl,
  cloudinaryUrl,
  isCloudinaryUrl,
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
  onError,
}: CloudinaryImageProps) {
  if (!src.trim()) return null

  const optimizedSrc = cloudinaryUrl(src, preset)
  const blur = cloudinaryBlurUrl(src)
  const dims = PRESET_DIMENSIONS[preset]
  const useFill = fill ?? (!width && !height)

  if (!isCloudinaryUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- non-Cloudinary hosts (e.g. seed URLs)
      <img
        src={src}
        alt={alt}
        className={className}
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
    className: cn(className),
    style,
    priority,
    sizes,
    onError,
    ...(blur
      ? { placeholder: "blur" as const, blurDataURL: blur }
      : {}),
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
