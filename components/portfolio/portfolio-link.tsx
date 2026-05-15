"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
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
}

export function PortfolioLink({
  href,
  transitionTypes = ["page-forward"],
  scroll = true,
  className,
  onClick,
  ...rest
}: PortfolioLinkProps) {
  const router = useRouter()

  return (
    <Link
      href={href}
      scroll={scroll}
      className={cn(className)}
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
    />
  )
}
