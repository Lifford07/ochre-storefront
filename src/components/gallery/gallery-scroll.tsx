"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import "lenis/dist/lenis.css"

const galleryRoute = /^\/(?:$|collection(?:\/|$)|artists(?:\/|$))/

function nativeScrollTarget(node: HTMLElement) {
  return (
    node.classList.contains("yarl__root") ||
    node.classList.contains("yarl__container") ||
    node.getAttribute("role") === "dialog" ||
    node.hasAttribute("data-lenis-prevent")
  )
}

/** Slow wheel scrolling on exhibition routes. Touch, reduced motion, and dialogs stay native. */
export function GalleryScroll() {
  const pathname = usePathname()
  const enabled = galleryRoute.test(pathname ?? "")

  useEffect(() => {
    if (!enabled) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduce.matches) return

    let cancelled = false
    let lenis: { stop: () => void; start: () => void; destroy: () => void } | null = null

    const sync = () => {
      if (!lenis) return
      const blocked =
        document.documentElement.hasAttribute("data-ochre-overlay") ||
        document.querySelector(".yarl__portal, .yarl__root") !== null
      if (blocked) lenis.stop()
      else lenis.start()
    }

    const observer = new MutationObserver(sync)

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled || reduce.matches) return
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.075,
        duration: 1.15,
        smoothWheel: true,
        syncTouch: false,
        prevent: nativeScrollTarget,
      })
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-ochre-overlay"],
      })
      observer.observe(document.body, { childList: true })
      sync()
    })

    const onPreference = () => {
      if (!reduce.matches) return
      lenis?.destroy()
      lenis = null
    }
    reduce.addEventListener("change", onPreference)

    return () => {
      cancelled = true
      reduce.removeEventListener("change", onPreference)
      observer.disconnect()
      lenis?.destroy()
    }
  }, [enabled])

  return null
}
