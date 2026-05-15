"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { IconPlus, IconSelector, IconX } from "@tabler/icons-react"
import {
  findCanonicalCatalogName,
  isCatalogNameInList,
} from "@/lib/catalog-names"
import { cn } from "@/lib/utils"

type CatalogMultiSelectProps = {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  /** Singular label for placeholders, e.g. "tag" or "tech stack". */
  itemName?: string
}

export function TechStackMultiSelect({
  options,
  value,
  onChange,
  error,
  itemName = "tech stack",
}: CatalogMultiSelectProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeIfOutside = (event: PointerEvent) => {
      const root = rootRef.current
      if (!root) return
      if (!root.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", closeIfOutside, true)
    return () =>
      document.removeEventListener("pointerdown", closeIfOutside, true)
  }, [open])

  const trimmedQuery = query.trim()

  const sortedOptions = useMemo(
    () => [...options].sort((a, b) => a.localeCompare(b)),
    [options]
  )

  const filteredOptions = useMemo(() => {
    const normalizedQuery = trimmedQuery.toLowerCase()
    return sortedOptions
      .filter((option) => !isCatalogNameInList(value, option))
      .filter((option) =>
        normalizedQuery.length === 0
          ? true
          : option.toLowerCase().includes(normalizedQuery)
      )
  }, [sortedOptions, trimmedQuery, value])

  const canAddNew =
    trimmedQuery.length > 0 &&
    !isCatalogNameInList(value, trimmedQuery) &&
    !isCatalogNameInList(sortedOptions, trimmedQuery)

  const addItem = (raw: string) => {
    const canonical = findCanonicalCatalogName(raw, sortedOptions)
    if (!canonical || isCatalogNameInList(value, canonical)) return
    onChange([...value, canonical])
    setQuery("")
  }

  const removeItem = (item: string) => {
    onChange(value.filter((entry) => entry !== item))
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false)
      return
    }
    if (event.key === "Backspace" && query === "" && value.length > 0) {
      event.preventDefault()
      onChange(value.slice(0, -1))
      return
    }
    if (event.key !== "Enter") return
    event.preventDefault()
    if (canAddNew) {
      addItem(trimmedQuery)
      return
    }
    if (filteredOptions.length === 1) {
      addItem(filteredOptions[0]!)
    }
  }

  const emptyCatalog = sortedOptions.length === 0

  return (
    <div ref={rootRef} className="relative flex flex-col gap-2">
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex min-h-10 w-full cursor-text items-start gap-1 rounded-xl border border-input bg-background px-2 py-1.5 text-sm outline-none transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          error && "border-destructive/60"
        )}
        onMouseDown={(event) => {
          const target = event.target as HTMLElement
          if (target.closest("[data-catalog-chip-remove]")) return
          if (target.closest("button[data-toggle]")) return
          if (target.closest("input")) return
          event.preventDefault()
          inputRef.current?.focus()
          setOpen(true)
        }}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 py-0.5">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex max-w-full shrink-0 items-center gap-0.5 rounded-md border border-border bg-muted/60 py-0.5 pl-2 pr-0.5 text-xs font-medium"
            >
              <span className="truncate">{item}</span>
              <button
                type="button"
                data-catalog-chip-remove
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation()
                  removeItem(item)
                }}
                aria-label={`Remove ${item}`}
              >
                <IconX className="size-3.5 shrink-0" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setOpen(true)}
            className="min-w-32 flex-1 border-0 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            placeholder={
              value.length === 0
                ? emptyCatalog
                  ? `Type a new ${itemName}…`
                  : `Search or add a ${itemName}…`
                : "Add more…"
            }
          />
        </div>
        <button
          type="button"
          data-toggle
          tabIndex={-1}
          className="mt-0.5 shrink-0 self-start rounded-md p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation()
            setOpen((current) => !current)
            inputRef.current?.focus()
          }}
          aria-label={
            open
              ? `Close ${itemName} suggestions`
              : `Open ${itemName} suggestions`
          }
        >
          <IconSelector className="size-5" />
        </button>
      </div>

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-20 mt-1 flex max-h-44 flex-col divide-y divide-border overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-card shadow-sm"
          role="listbox"
        >
          {canAddNew && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                addItem(trimmedQuery)
                inputRef.current?.focus()
              }}
            >
              <IconPlus className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {`Create "${trimmedQuery}"`}
              </span>
            </button>
          )}
          {filteredOptions.length === 0 && !canAddNew ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {trimmedQuery
                ? `No matching ${itemName}s.`
                : emptyCatalog
                  ? `No ${itemName}s in the catalog yet — type to add one.`
                  : `All catalog ${itemName}s are selected.`}
            </p>
          ) : (
            filteredOptions.map((option) => (
              <button
                type="button"
                key={option}
                className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted/60"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  addItem(option)
                  inputRef.current?.focus()
                }}
              >
                <span>{option}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
