"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type CatalogItem = {
  id: number
  name: string
  count: number
}

type CatalogManagerProps = {
  title: string
  itemName: string
  endpoint: "/api/admin/tags" | "/api/admin/tech-stacks"
  countLabel: string
  items: CatalogItem[]
}

function formatUsage(count: number, countLabel: string) {
  if (count === 0) return "Unused"
  return `${count.toLocaleString()} ${countLabel}`
}

export function CatalogManager({
  title,
  itemName,
  endpoint,
  countLabel,
  items,
}: CatalogManagerProps) {
  const router = useRouter()
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const inUseCount = items.filter((item) => item.count > 0).length

  const send = async (method: "POST" | "PATCH" | "DELETE", body: object) => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(payload.error ?? "Catalog update failed.")
      }
      setNewName("")
      setEditingId(null)
      setEditingName("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  return (
    <Card>
      <CardHeader className="gap-4 border-b">
        <div className="flex flex-col gap-1">
          <CardTitle>{title} catalog</CardTitle>
          <CardDescription>
            {items.length} {itemName}
            {items.length === 1 ? "" : "s"}
            {items.length > 0 ? ` · ${inUseCount} in use` : ""}
          </CardDescription>
        </div>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            void send("POST", { name: newName })
          }}
        >
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder={`New ${itemName} name`}
            className="sm:flex-1"
          />
          <Button
            type="submit"
            disabled={isSaving || !newName.trim()}
            className="shrink-0"
          >
            <IconPlus data-icon="inline-start" />
            Add {itemName}
          </Button>
        </form>
      </CardHeader>

      <CardContent className="pt-6">
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              No {itemName}s yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add your first {itemName} above. It will appear here and be
              available when editing content.
            </p>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const isEditing = editingId === item.id
              const inUse = item.count > 0

              return (
                <li
                  key={item.id}
                  className={cn(
                    "rounded-xl border bg-muted/15 transition-colors",
                    isEditing ? "border-ring bg-card ring-3 ring-ring/30" : "border-border"
                  )}
                >
                  {isEditing ? (
                    <div className="flex flex-col gap-3 p-3">
                      <Input
                        value={editingName}
                        onChange={(event) =>
                          setEditingName(event.target.value)
                        }
                        autoFocus
                        aria-label={`Rename ${item.name}`}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={isSaving || !editingName.trim()}
                          onClick={() =>
                            void send("PATCH", {
                              id: item.id,
                              name: editingName,
                            })
                          }
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {item.name}
                        </p>
                        <Badge
                          variant={inUse ? "secondary" : "outline"}
                          className="mt-2"
                        >
                          {formatUsage(item.count, countLabel)}
                        </Badge>
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => {
                            setEditingId(item.id)
                            setEditingName(item.name)
                          }}
                        >
                          <IconPencil />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Delete ${item.name}`}
                          disabled={isSaving || inUse}
                          title={
                            inUse
                              ? `Cannot delete — used on ${formatUsage(item.count, countLabel)}`
                              : `Delete ${item.name}`
                          }
                          onClick={() => void send("DELETE", { id: item.id })}
                        >
                          <IconTrash
                            className={cn(inUse && "opacity-40")}
                          />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
