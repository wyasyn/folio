"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { IconMessage, IconSearch } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { PortfolioChatPanel } from "@/components/portfolio/portfolio-chat-panel"
import { navigatePageWithViewTransition } from "@/lib/navigate-page-view-transition"
import {
  searchGroupLabels,
  searchGroupOrder,
  type PortfolioSearchItem,
} from "@/lib/portfolio/search-types"
import { cn } from "@/lib/utils"

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

type PaletteTab = "search" | "ask"

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatEnabled: boolean
  chatConfigured: boolean
}

export function CommandPalette({
  open,
  onOpenChange,
  chatEnabled,
  chatConfigured,
}: CommandPaletteProps) {
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<PaletteTab>("search")
  const [searchItems, setSearchItems] = useState<PortfolioSearchItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const go = useCallback(
    (href: string) => {
      onOpenChange(false)
      navigatePageWithViewTransition(
        (h, opts) => router.push(h, opts),
        href,
        ["page-forward"],
      )
    },
    [router, onOpenChange],
  )

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setSearchLoading(true)
    fetch("/api/portfolio/search-index")
      .then((res) => res.json())
      .then((data: { items?: PortfolioSearchItem[] }) => {
        if (!cancelled) setSearchItems(data.items ?? [])
      })
      .catch(() => {
        if (!cancelled) setSearchItems([])
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) setTab("search")
  }, [open])

  useEffect(() => {
    if (!open || tab !== "search") return
    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open, tab])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.repeat) return
      if (e.key.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey)) return
      if (isTypingTarget(e.target)) return
      e.preventDefault()
      onOpenChange(!open)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  const groupedItems = useMemo(() => {
    const groups = new Map<string, PortfolioSearchItem[]>()
    for (const type of searchGroupOrder) {
      groups.set(type, [])
    }
    for (const item of searchItems) {
      groups.get(item.type)?.push(item)
    }
    return searchGroupOrder
      .map((type) => ({
        type,
        label: searchGroupLabels[type],
        items: groups.get(type) ?? [],
      }))
      .filter((group) => group.items.length > 0)
  }, [searchItems])

  const showAskTab = chatConfigured

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="items-center justify-center p-4 sm:p-6"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          if (!panelRef.current?.contains(e.target as Node)) {
            onOpenChange(false)
          }
        }}
      >
        <DialogTitle className="sr-only">Search and ask</DialogTitle>
        <DialogDescription className="sr-only">
          Search portfolio content or ask questions about this site.
        </DialogDescription>
        <div
          ref={panelRef}
          className={cn(
            "flex w-full flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg",
            "max-h-[min(85vh,720px)]",
            tab === "ask"
              ? "max-w-2xl min-h-[min(70vh,560px)]"
              : "max-w-lg",
          )}
        >
          <div className="flex shrink-0 border-b border-border">
            <button
              type="button"
              onClick={() => setTab("search")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
                tab === "search"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <IconSearch className="size-4" aria-hidden />
              Search
            </button>
            {showAskTab ? (
              <button
                type="button"
                onClick={() => setTab("ask")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
                  tab === "ask"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <IconMessage className="size-4" aria-hidden />
                Ask
              </button>
            ) : null}
          </div>

          {tab === "search" ? (
            <Command
              className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium"
              label="Portfolio search"
            >
              <div className="flex items-center gap-2 border-b border-border px-3">
                <IconSearch className="size-4 shrink-0 opacity-50" aria-hidden />
                <Command.Input
                  ref={searchInputRef}
                  placeholder="Search pages, projects, blog, news…"
                  className="flex h-11 w-full bg-transparent py-3 text-sm outline-none focus:outline-none focus-visible:outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Command.List className="max-h-72 overflow-y-auto p-2">
                {searchLoading ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Loading index…
                  </p>
                ) : (
                  <>
                    <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                      No results found.
                    </Command.Empty>
                    {groupedItems.map((group) => (
                      <Command.Group key={group.type} heading={group.label}>
                        {group.items.map((item) => (
                          <Command.Item
                            key={item.id}
                            value={item.keywords}
                            onSelect={() => go(item.href)}
                            className={cn(
                              "relative flex cursor-pointer select-none flex-col gap-0.5 rounded-md px-2 py-2 text-sm outline-none",
                              "aria-selected:bg-accent aria-selected:text-accent-foreground",
                            )}
                          >
                            <span className="font-medium">{item.title}</span>
                            {item.subtitle ? (
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {item.subtitle}
                              </span>
                            ) : null}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    ))}
                  </>
                )}
              </Command.List>
            </Command>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <PortfolioChatPanel
                chatEnabled={chatEnabled}
                chatConfigured={chatConfigured}
                autoFocusInput={open}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
