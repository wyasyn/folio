import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const groupHoverClass = {
  default: "group-hover:-translate-y-1/2",
  button: "group-hover/button:-translate-y-1/2",
} as const

type FlipHoverLabelProps = {
  children: ReactNode
  className?: string
  /** Use `button` for shadcn Button (`group/button`) */
  groupHover?: keyof typeof groupHoverClass
}

export function FlipHoverLabel({
  children,
  className,
  groupHover = "default",
}: FlipHoverLabelProps) {
  return (
    <span className={cn("relative inline-block h-[1lh] overflow-hidden", className)}>
      <span
        className={cn(
          "flex flex-col transition-transform duration-300 ease-out motion-reduce:transition-none",
          groupHoverClass[groupHover],
        )}
      >
        <span className="block">{children}</span>
        <span className="block" aria-hidden="true">
          {children}
        </span>
      </span>
    </span>
  )
}
