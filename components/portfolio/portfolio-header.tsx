"use client"

import { useState } from "react"
import { PortfolioLink } from "@/components/portfolio/portfolio-link"
import { ThemeToggle } from "@/components/portfolio/theme-toggle"
import { CommandPalette } from "@/components/portfolio/command-palette"
import { portfolioNavItems } from "@/lib/portfolio-nav"
import { cn } from "@/lib/utils"

type PortfolioHeaderProps = {
  chatEnabled: boolean
  chatConfigured: boolean
}

export function PortfolioHeader({
  chatEnabled,
  chatConfigured,
}: PortfolioHeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <>
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        chatEnabled={chatEnabled}
        chatConfigured={chatConfigured}
      />
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <PortfolioLink
            href="/"
            className="font-heading text-sm font-semibold tracking-tight"
            transitionTypes={["page-back"]}
          >
            Portfolio
          </PortfolioLink>
          <nav className="hidden items-center gap-1 sm:flex">
            {portfolioNavItems
              .filter((item) => item.href !== "/")
              .map((item) => (
                <PortfolioLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors",
                    "hover:bg-accent hover:text-foreground",
                  )}
                >
                  {item.label}
                </PortfolioLink>
              ))}
          </nav>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label="Open search"
              className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline"
            >
              ⌘K
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  )
}
