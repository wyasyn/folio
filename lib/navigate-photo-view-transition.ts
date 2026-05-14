"use client"

import type { MouseEvent } from "react"
import { flushSync } from "react-dom"

export type PhotoNavTransitionType = "nav-forward" | "nav-back"

type PushFn = (href: string, options?: { scroll?: boolean }) => void

type DocWithVT = Document & {
  startViewTransition?: (arg: unknown) => { finished: Promise<void> }
}

function runViewTransition(update: () => void, types?: PhotoNavTransitionType[]) {
  const doc = document as DocWithVT
  const fn = doc.startViewTransition
  if (typeof fn !== "function") {
    update()
    return
  }
  if (types?.length) {
    try {
      fn.call(doc, { update, types })
      return
    } catch {
      // Older engines: object form with `types` unsupported
    }
  }
  fn.call(doc, update)
}

/** Client navigations for admin photo routes with View Transitions when available. */
export function navigatePhotoWithViewTransition(
  push: PushFn,
  href: string,
  transitionTypes?: PhotoNavTransitionType[],
) {
  runViewTransition(
    () => {
      flushSync(() => {
        push(href, { scroll: false })
      })
    },
    transitionTypes,
  )
}

export function routerBackWithViewTransition(back: () => void, types?: PhotoNavTransitionType[]) {
  runViewTransition(
    () => {
      flushSync(() => {
        back()
      })
    },
    types,
  )
}

export function shouldInterceptPhotoLinkClick(
  e: MouseEvent<HTMLAnchorElement>,
): boolean {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false
  if (e.button !== 0) return false
  const t = e.currentTarget.getAttribute("target")
  if (t && t !== "_self") return false
  return typeof (document as DocWithVT).startViewTransition === "function"
}
