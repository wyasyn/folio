import Link from "next/link"
import { IconArticle, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

type EmptyContentStateProps = {
  kind: "posts" | "news"
}

export function EmptyContentState({ kind }: EmptyContentStateProps) {
  const label = kind === "posts" ? "post" : "news item"

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <IconArticle className="size-6 text-muted-foreground" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className="text-lg font-medium text-foreground">No {label}s yet</h2>
        <p className="text-sm text-muted-foreground">
          Create your first {label} and publish when it is ready.
        </p>
      </div>
      <Button asChild>
        <Link href={`/dashboard/${kind}/new`}>
          <IconPlus data-icon="inline-start" />
          New {label}
        </Link>
      </Button>
    </div>
  )
}
