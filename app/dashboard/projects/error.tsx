"use client"

import { useEffect } from "react"
import Link from "next/link"
import { IconRefresh, IconArrowLeft } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <h2 className="text-lg font-medium text-foreground">
        Something went wrong loading projects
      </h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred. Try again or contact support if it persists."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => reset()}>
          <IconRefresh data-icon="inline-start" />
          Try again
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard/projects">
            <IconArrowLeft data-icon="inline-start" />
            Back to projects
          </Link>
        </Button>
      </div>
    </div>
  )
}
