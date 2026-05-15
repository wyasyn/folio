"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ComponentProps, ReactNode } from "react"
import { FlipHoverLabel } from "@/components/portfolio/flip-hover-label"
import { cn } from "@/lib/utils"
import {
  navigatePageWithViewTransition,
  shouldInterceptPageLinkClick,
  type PageNavTransitionType,
} from "@/lib/navigate-page-view-transition"

export type PortfolioLinkProps = Omit<ComponentProps<typeof Link>, "scroll"> & {
  href: string
  transitionTypes?: PageNavTransitionType[]
  scroll?: boolean
  leading?: ReactNode
}

export function PortfolioLink({
  href,
  transitionTypes = ["page-forward"],
  scroll = true,
  className,
  children,
  leading,
  onClick,
  ...rest
}: PortfolioLinkProps) {
  const router = useRouter()

  return (
    <Link
      href={href}
      scroll={scroll}
      className={cn("group inline-flex items-center", leading && "gap-3", className)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if (!shouldInterceptPageLinkClick(e)) return
        e.preventDefault()
        navigatePageWithViewTransition(
          (h, opts) => router.push(h, opts),
          href,
          transitionTypes,
        )
      }}
      {...rest}
    >
      {leading}
      <FlipHoverLabel>{children}</FlipHoverLabel>
    </Link>
  )
}
