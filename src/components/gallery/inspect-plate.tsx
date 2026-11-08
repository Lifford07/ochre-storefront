"use client"

import dynamic from "next/dynamic"
import { useState, type ReactNode } from "react"
import type { InspectSlide } from "@/components/gallery/artwork-lightbox"

const ArtworkLightbox = dynamic(
  () => import("@/components/gallery/artwork-lightbox").then((mod) => mod.ArtworkLightbox),
  { ssr: false },
)

export function InspectPlate({
  slides,
  children,
}: {
  slides: InspectSlide[]
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  if (slides.length === 0) return <>{children}</>
  const title = slides[0]?.title ?? "this work"

  return (
    <>
      <button
        type="button"
        className="inspect-plate"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Inspect ${title}`}
        onClick={() => {
          setIndex(0)
          setOpen(true)
        }}
      >
        {children}
        <span className="inspect-hint">Inspect</span>
      </button>
      {open ? (
        <ArtworkLightbox open index={index} slides={slides} onClose={() => setOpen(false)} onIndex={setIndex} />
      ) : null}
    </>
  )
}
