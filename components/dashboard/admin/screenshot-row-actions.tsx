"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

type ScreenshotRowActionsProps = {
  screenshotId: number
}

export function ScreenshotRowActions({
  screenshotId,
}: ScreenshotRowActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/screenshots/${screenshotId}`, {
        method: "DELETE",
      })
      if (response.ok) router.refresh()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      disabled={isDeleting}
      onClick={() => void handleDelete()}
      aria-label="Delete screenshot"
    >
      <IconTrash />
    </Button>
  )
}
