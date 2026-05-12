"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type CatalogItem = {
  id: number
  name: string
  count: number
}

type CatalogManagerProps = {
  title: string
  endpoint: "/api/admin/tags" | "/api/admin/tech-stacks"
  countLabel: string
  items: CatalogItem[]
}

export function CatalogManager({
  title,
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

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex max-w-xl gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void send("POST", { name: newName })
        }}
      >
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder={`Add ${title.toLowerCase().slice(0, -1)}`}
        />
        <Button type="submit" disabled={isSaving || !newName.trim()}>
          <IconPlus data-icon="inline-start" />
          Add
        </Button>
      </form>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>{countLabel}</TableHead>
            <TableHead className="w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {editingId === item.id ? (
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                  />
                ) : (
                  item.name
                )}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {item.count}
              </TableCell>
              <TableCell className="text-right">
                {editingId === item.id ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      disabled={isSaving || !editingName.trim()}
                      onClick={() =>
                        void send("PATCH", { id: item.id, name: editingName })
                      }
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null)
                        setEditingName("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
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
                      disabled={isSaving || item.count > 0}
                      onClick={() => void send("DELETE", { id: item.id })}
                    >
                      <IconTrash />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
