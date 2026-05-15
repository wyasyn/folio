"use client"

import type { MouseEvent } from "react"
import { flushSync } from "react-dom"

export type PageNavTransitionType = "page-forward" | "page-back"

type PushFn = (href: string, options?: { scroll?: boolean }) => void

type DocWithVT = Document & {
  startViewTransition?: (arg: unknown) => { finished: Promise<void> }
}

function runViewTransition(update: () => void, types?: PageNavTransitionType[]) {
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

export function navigatePageWithViewTransition(
  push: PushFn,
  href: string,
  transitionTypes?: PageNavTransitionType[],
) {
  runViewTransition(
    () => {
      flushSync(() => {
        push(href, { scroll: true })
      })
    },
    transitionTypes,
  )
}

export function shouldInterceptPageLinkClick(
  e: MouseEvent<HTMLAnchorElement>,
): boolean {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false
  if (e.button !== 0) return false
  const t = e.currentTarget.getAttribute("target")
  if (t && t !== "_self") return false
  return typeof (document as DocWithVT).startViewTransition === "function"
}
