"use client"

import { useEffect } from "react"
import Lightbox from "yet-another-react-lightbox"
import Captions from "yet-another-react-lightbox/plugins/captions"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/captions.css"
import { useOverlayLock } from "@/components/gallery/overlay-lock"

export type InspectSlide = {
  src: string
  alt: string
  title: string
  description: string
}

export function ArtworkLightbox({
  open,
  index,
  slides,
  onClose,
  onIndex,
}: {
  open: boolean
  index: number
  slides: InspectSlide[]
  onClose: () => void
  onIndex: (index: number) => void
}) {
  useOverlayLock(open)
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    return () => {
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [open])

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides.map((slide) => ({
        src: slide.src,
        alt: slide.alt,
        title: slide.title,
        description: slide.description,
      }))}
      plugins={[Zoom, Captions]}
      zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      captions={{ showToggle: false, descriptionTextAlign: "center", descriptionMaxLines: 4 }}
      carousel={{ finite: true }}
      controller={{ closeOnBackdropClick: true }}
      className="ochre-lightbox"
      on={{ view: ({ index: next }) => onIndex(next) }}
      render={{
        buttonPrev: slides.length < 2 ? () => null : undefined,
        buttonNext: slides.length < 2 ? () => null : undefined,
      }}
      labels={{
        Close: "Close inspection",
        Previous: "Previous view",
        Next: "Next view",
        "Zoom in": "Zoom in",
        "Zoom out": "Zoom out",
      }}
    />
  )
}
