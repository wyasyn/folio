"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconPhoto,
} from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScreenshotPhotoNavLink } from "@/components/dashboard/admin/screenshot-photo-nav-link"
import { Button } from "@/components/ui/button"
import { CloudinaryImage } from "@/components/ui/cloudinary-image"
import type { ScreenshotPhotoViewerPayload } from "@/lib/admin-screenshot-photo-payload"
import {
  navigatePhotoWithViewTransition,
  routerBackWithViewTransition,
} from "@/lib/navigate-photo-view-transition"

function PhotoChrome({
  data,
  updatedLabel,
  topRight,
}: {
  data: ScreenshotPhotoViewerPayload
  updatedLabel: string
  topRight?: React.ReactNode
}) {
  const router = useRouter()
  const [failed, setFailed] = useState(!data.url.trim())

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const el = e.target as HTMLElement | null
      if (
        el?.closest(
          "input, textarea, select, [contenteditable=true], [role=textbox]",
        )
      ) {
        return
      }
      if (e.key === "ArrowLeft" && data.newerId != null) {
        e.preventDefault()
        navigatePhotoWithViewTransition(
          (href, opts) => {
            router.push(href, opts)
          },
          `/photo/${data.newerId}`,
          ["nav-back"],
        )
      } else if (e.key === "ArrowRight" && data.olderId != null) {
        e.preventDefault()
        navigatePhotoWithViewTransition(
          (href, opts) => {
            router.push(href, opts)
          },
          `/photo/${data.olderId}`,
          ["nav-forward"],
        )
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [data.newerId, data.olderId, router])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {topRight ? (
        <div className="pointer-events-none absolute top-4 right-4 z-55 flex items-center gap-2">
          <div className="pointer-events-auto">{topRight}</div>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1">
        {data.newerId != null ? (
          <div className="pointer-events-none absolute top-1/2 left-2 z-40 -translate-y-1/2 sm:left-4">
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto size-10 rounded-full border border-border shadow-lg sm:size-11"
              asChild
            >
              <ScreenshotPhotoNavLink
                href={`/photo/${data.newerId}`}
                scroll={false}
                transitionTypes={["nav-back"]}
                aria-label="Newer screenshot"
                title="Newer (←)"
              >
                <IconChevronLeft className="size-5" aria-hidden />
              </ScreenshotPhotoNavLink>
            </Button>
          </div>
        ) : null}
        {data.olderId != null ? (
          <div className="pointer-events-none absolute top-1/2 right-2 z-40 -translate-y-1/2 sm:right-4">
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto size-10 rounded-full border border-border shadow-lg sm:size-11"
              asChild
            >
              <ScreenshotPhotoNavLink
                href={`/photo/${data.olderId}`}
                scroll={false}
                transitionTypes={["nav-forward"]}
                aria-label="Older screenshot"
                title="Older (→)"
              >
                <IconChevronRight className="size-5" aria-hidden />
              </ScreenshotPhotoNavLink>
            </Button>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 items-center justify-center px-4 pt-14 pb-6 sm:px-8 sm:pt-16 sm:pb-10">
          <div className="relative max-h-[min(78vh,860px)] w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-muted/50 shadow-xl ring-1 ring-border/60">
            {failed ? (
              <div className="flex aspect-4/3 w-full items-center justify-center bg-muted text-muted-foreground">
                <IconPhoto className="size-16 opacity-35" aria-hidden />
                <span className="sr-only">Image unavailable</span>
              </div>
            ) : (
              <CloudinaryImage
                key={data.id}
                src={data.url}
                alt={`Screenshot for ${data.project.title}`}
                preset="screenshot"
                width={1200}
                height={800}
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="max-h-[min(78vh,860px)] w-full object-contain"
                style={{ viewTransitionName: `admin-screenshot-${data.id}` }}
                onError={() => setFailed(true)}
              />
            )}
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-border bg-card/90 px-4 py-4 text-card-foreground backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
              {data.project.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground/90">{data.project.ownerLabel}</span>
              <span className="mx-2 text-muted-foreground/50" aria-hidden>
                ·
              </span>
              Updated {updatedLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/dashboard/projects/${data.project.id}/edit`}>
                Open project
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={data.url} target="_blank" rel="noreferrer">
                <IconExternalLink className="mr-1.5 size-4" aria-hidden />
                Original
              </a>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function ScreenshotPhotoDialog({
  data,
}: {
  data: ScreenshotPhotoViewerPayload
}) {
  const router = useRouter()
  const updatedLabel = new Date(data.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        routerBackWithViewTransition(() => router.back(), ["nav-back"])
      }
    },
    [router],
  )

  return (
    <Dialog defaultOpen onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton suppressShellMotion>
        <DialogTitle className="sr-only">
          Screenshot for {data.project.title}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Owner {data.project.ownerLabel}. Updated {updatedLabel}.
        </DialogDescription>
        <PhotoChrome key={data.id} data={data} updatedLabel={updatedLabel} />
      </DialogContent>
    </Dialog>
  )
}

export function ScreenshotPhotoPageClient({
  data,
}: {
  data: ScreenshotPhotoViewerPayload
}) {
  const updatedLabel = new Date(data.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card/40 px-4 py-3 backdrop-blur-sm sm:px-6">
        <Button variant="ghost" size="sm" asChild>
          <ScreenshotPhotoNavLink
            href="/dashboard/screenshots"
            scroll={false}
            transitionTypes={["nav-back"]}
          >
            ← Screenshots
          </ScreenshotPhotoNavLink>
        </Button>
      </header>
      <PhotoChrome key={data.id} data={data} updatedLabel={updatedLabel} />
    </div>
  )
}
