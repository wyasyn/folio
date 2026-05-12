"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconBan,
  IconShield,
  IconShieldOff,
  IconTrash,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

type UserRowActionsProps = {
  userId: string
  role: string
  banned: boolean
  isCurrentUser: boolean
}

export function UserRowActions({
  userId,
  role,
  banned,
  isCurrentUser,
}: UserRowActionsProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (method: "PATCH" | "DELETE", body?: object) => {
    setIsPending(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(payload.error ?? "User update failed.")
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsPending(false)
    }
  }

  const nextRole = role.split(",").includes("admin") ? "user" : "admin"

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-2">
        <Button
          size="icon-sm"
          variant="ghost"
          disabled={isPending || isCurrentUser}
          onClick={() =>
            void send("PATCH", { action: "set-role", role: nextRole })
          }
          aria-label={nextRole === "admin" ? "Make admin" : "Remove admin"}
        >
          {nextRole === "admin" ? <IconShield /> : <IconShieldOff />}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          disabled={isPending || isCurrentUser}
          onClick={() =>
            void send("PATCH", { action: banned ? "unban" : "ban" })
          }
          aria-label={banned ? "Unban user" : "Ban user"}
        >
          <IconBan />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          disabled={isPending || isCurrentUser}
          onClick={() => {
            if (window.confirm("Delete this user and all related content?")) {
              void send("DELETE")
            }
          }}
          aria-label="Delete user"
        >
          <IconTrash />
        </Button>
      </div>
      {error ? (
        <span className="max-w-56 text-xs text-destructive">{error}</span>
      ) : null}
    </div>
  )
}
