"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { defaultInViewViewport, fadeUp } from "@/lib/motion/variants"
import { cn } from "@/lib/utils"

type FeaturedScrollSectionProps = {
  children: ReactNode
}

export function FeaturedScrollSection({ children }: FeaturedScrollSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  if (children == null) {
    return null
  }

  const motionProps = prefersReducedMotion
    ? { initial: false }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: defaultInViewViewport,
      }

  return (
    <motion.section
      {...motionProps}
      variants={prefersReducedMotion ? undefined : fadeUp}
      className={cn(
        "scroll-mt-24 snap-start",
        "not-first:border-t not-first:border-border/40",
      )}
    >
      {children}
    </motion.section>
  )
}
