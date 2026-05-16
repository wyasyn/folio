"use client"

import { useEffect } from "react"
import { useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { FeaturedScrollSection } from "@/components/portfolio/home/featured-scroll-section"
import {
  homeSectionGap,
  homeSectionPaddingBottom,
} from "@/lib/portfolio/home-spacing"
import { cn } from "@/lib/utils"

const SNAP_CLASS = "home-featured-snap"

type HomeFeaturedSectionsProps = {
  projects: ReactNode
  posts: ReactNode
  news: ReactNode
}

export function HomeFeaturedSections({
  projects,
  posts,
  news,
}: HomeFeaturedSectionsProps) {
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    document.body.classList.add(SNAP_CLASS)
    return () => {
      document.body.classList.remove(SNAP_CLASS)
    }
  }, [prefersReducedMotion])

  return (
    <div
      className={cn(
        "mx-auto flex max-w-6xl flex-col px-4",
        homeSectionGap,
        homeSectionPaddingBottom,
      )}
    >
      <FeaturedScrollSection>{projects}</FeaturedScrollSection>
      <FeaturedScrollSection>{posts}</FeaturedScrollSection>
      <FeaturedScrollSection>{news}</FeaturedScrollSection>
    </div>
  )
}
