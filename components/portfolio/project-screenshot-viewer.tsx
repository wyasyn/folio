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
import {
  projectScreenshotHref,
  type ProjectScreenshotPhotoPayload,
} from "@/lib/public/project-screenshot-types"
import {
  navigatePhotoWithViewTransition,
  routerBackWithViewTransition,
} from "@/lib/navigate-photo-view-transition"

function screenshotHref(data: ProjectScreenshotPhotoPayload, id: number) {
  return projectScreenshotHref(data.project.slug, id)
}

function PhotoChrome({ data }: { data: ProjectScreenshotPhotoPayload }) {
  const router = useRouter()
  const [failed, setFailed] = useState(!data.url.trim())
  const updatedLabel = new Date(data.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

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
          (href, opts) => router.push(href, opts),
          screenshotHref(data, data.newerId),
          ["nav-back"],
        )
      } else if (e.key === "ArrowRight" && data.olderId != null) {
        e.preventDefault()
        navigatePhotoWithViewTransition(
          (href, opts) => router.push(href, opts),
          screenshotHref(data, data.olderId),
          ["nav-forward"],
        )
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [data, router])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
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
                href={screenshotHref(data, data.newerId)}
                scroll={false}
                transitionTypes={["nav-back"]}
                aria-label="Previous screenshot"
                title="Previous (←)"
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
                href={screenshotHref(data, data.olderId)}
                scroll={false}
                transitionTypes={["nav-forward"]}
                aria-label="Next screenshot"
                title="Next (→)"
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
                style={{ viewTransitionName: `project-screenshot-${data.id}` }}
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
              Updated {updatedLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/projects/${data.project.slug}`}>Back to project</Link>
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

export function ProjectScreenshotDialog({
  data,
}: {
  data: ProjectScreenshotPhotoPayload
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
          Project {data.project.title}. Updated {updatedLabel}.
        </DialogDescription>
        <PhotoChrome key={data.id} data={data} />
      </DialogContent>
    </Dialog>
  )
}

export function ProjectScreenshotPageClient({
  data,
}: {
  data: ProjectScreenshotPhotoPayload
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card/40 px-4 py-3 backdrop-blur-sm sm:px-6">
        <Button variant="ghost" size="sm" asChild>
          <ScreenshotPhotoNavLink
            href={`/projects/${data.project.slug}`}
            scroll={false}
            transitionTypes={["nav-back"]}
          >
            ← {data.project.title}
          </ScreenshotPhotoNavLink>
        </Button>
      </header>
      <PhotoChrome key={data.id} data={data} />
    </div>
  )
}
