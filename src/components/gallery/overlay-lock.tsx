"use client"

import { useEffect } from "react"

/** Counts open dialogs so gallery smooth-scroll can yield to native modal scrolling. */
export function useOverlayLock(open: boolean) {
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const next = Number(root.dataset.ochreOverlayCount ?? "0") + 1
    root.dataset.ochreOverlayCount = String(next)
    root.setAttribute("data-ochre-overlay", "")
    return () => {
      const left = Math.max(0, Number(root.dataset.ochreOverlayCount ?? "1") - 1)
      if (left === 0) {
        delete root.dataset.ochreOverlayCount
        root.removeAttribute("data-ochre-overlay")
      } else {
        root.dataset.ochreOverlayCount = String(left)
      }
    }
  }, [open])
}
