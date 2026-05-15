"use client"

import { useState } from "react"
import { IconMenu2, IconSearch } from "@tabler/icons-react"
import { PortfolioLink } from "@/components/portfolio/portfolio-link"
import { ThemeToggle } from "@/components/portfolio/theme-toggle"
import { CommandPalette } from "@/components/portfolio/command-palette"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { portfolioNavItems } from "@/lib/portfolio-nav"
import { cn } from "@/lib/utils"

type PortfolioHeaderProps = {
  chatEnabled: boolean
  chatConfigured: boolean
}

const navLinkClassName = cn(
  "rounded-md px-3 text-sm text-muted-foreground transition-colors",
  "hover:bg-accent hover:text-foreground",
)

type PortfolioNavLinksProps = {
  onNavigate?: () => void
  className?: string
  includeHome?: boolean
  showIcons?: boolean
}

function PortfolioNavLinks({
  onNavigate,
  className,
  includeHome = false,
  showIcons = false,
}: PortfolioNavLinksProps) {
  const items = includeHome
    ? portfolioNavItems
    : portfolioNavItems.filter((item) => item.href !== "/")

  return (
    <>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <PortfolioLink
            key={item.href}
            href={item.href}
            className={cn(
              navLinkClassName,
              showIcons && "w-full gap-3",
              className,
            )}
            transitionTypes={item.href === "/" ? ["page-back"] : undefined}
            onClick={onNavigate}
            leading={
              showIcons ? (
                <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
              ) : undefined
            }
          >
            {item.label}
          </PortfolioLink>
        )
      })}
    </>
  )
}

export function PortfolioHeader({
  chatEnabled,
  chatConfigured,
}: PortfolioHeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        chatEnabled={chatEnabled}
        chatConfigured={chatConfigured}
      />
      <header className="sticky top-0 z-40 border-b  bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <PortfolioLink
            href="/"
            className="font-heading font-semibold "
            transitionTypes={["page-back"]}
          >
            Yasin.
          </PortfolioLink>
          <nav className="hidden items-center gap-1 sm:flex">
            <PortfolioNavLinks className="py-1.5" />
          </nav>
          <div className="flex items-center gap-1">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 sm:hidden"
                  aria-label="Open menu"
                >
                  <IconMenu2 className="size-4" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>
                    Portfolio pages and sections
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-1 pt-2">
                  <PortfolioNavLinks
                    includeHome
                    showIcons
                    className="py-2.5"
                    onNavigate={() => setMenuOpen(false)}
                  />
                </nav>
              </SheetContent>
            </Sheet>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 sm:hidden"
              aria-label="Open search"
              onClick={() => setCommandOpen(true)}
            >
              <IconSearch className="size-4" aria-hidden />
            </Button>
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
