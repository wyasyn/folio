"use client"

import { motion, useReducedMotion } from "motion/react"
import { createStaggerContainer, fadeUp, motionEase } from "@/lib/motion/variants"
import { homeSectionMarginY } from "@/lib/portfolio/home-spacing"
import { cn } from "@/lib/utils"

const QUOTE_LINES = [
  {
    before: "The best code is written with ",
    emphasis: "care",
    after: " —",
  },
  {
    before: "and the best teams are built with ",
    emphasis: "kindness",
    after: ".",
  },
] as const

const ATTRIBUTION = "how I work"

const containerVariants = createStaggerContainer(0.08, 0.12)

const markFade = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: motionEase,
    },
  },
}

export function HeroQuote({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion()

  const motionProps = prefersReducedMotion
    ? { initial: false }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, amount: 0.35 },
      }

  return (
    <motion.figure
      {...motionProps}
      variants={prefersReducedMotion ? undefined : containerVariants}
      className={cn(
        "relative mx-auto w-full max-w-4xl space-y-3 px-4 py-10 text-center md:space-y-4 md:py-12 lg:py-14",
        homeSectionMarginY,
        className,
      )}
    >
      <motion.span
        aria-hidden
        variants={prefersReducedMotion ? undefined : markFade}
        className="font-heading block text-5xl leading-none text-muted-foreground/25 select-none sm:text-6xl md:text-7xl"
      >
        &ldquo;
      </motion.span>

      <motion.blockquote
        variants={prefersReducedMotion ? undefined : containerVariants}
        className="space-y-1 md:space-y-2"
      >
        {QUOTE_LINES.map((line, index) => (
          <motion.p
            key={index}
            variants={prefersReducedMotion ? undefined : fadeUp}
            className="font-heading text-2xl leading-tight font-normal tracking-tight text-foreground italic sm:text-3xl md:text-4xl lg:text-5xl"
          >
            {line.before}
            <span className="text-primary not-italic">{line.emphasis}</span>
            {line.after}
          </motion.p>
        ))}
      </motion.blockquote>

      <motion.figcaption
        variants={prefersReducedMotion ? undefined : fadeUp}
        className="pt-2 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase sm:text-sm"
      >
        — {ATTRIBUTION}
      </motion.figcaption>
    </motion.figure>
  )
}
