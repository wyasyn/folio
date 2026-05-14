"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import {
  navigatePhotoWithViewTransition,
  shouldInterceptPhotoLinkClick,
  type PhotoNavTransitionType,
} from "@/lib/navigate-photo-view-transition"

type LinkProps = ComponentProps<typeof Link>

export type ScreenshotPhotoNavLinkProps = Omit<LinkProps, "scroll"> & {
  href: string
  transitionTypes?: PhotoNavTransitionType[]
  scroll?: boolean
}

export function ScreenshotPhotoNavLink({
  href,
  transitionTypes,
  scroll = false,
  className,
  onClick,
  ...rest
}: ScreenshotPhotoNavLinkProps) {
  const router = useRouter()

  return (
    <Link
      href={href}
      scroll={scroll}
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if (!shouldInterceptPhotoLinkClick(e)) return
        e.preventDefault()
        navigatePhotoWithViewTransition(
          (h, opts) => {
            router.push(h, opts)
          },
          href,
          transitionTypes,
        )
      }}
      {...rest}
    />
  )
}
