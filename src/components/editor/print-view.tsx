"use client"

import { useRef, type CSSProperties } from "react"
import { cropPixels } from "@/lib/quality"

export type FitMode = "fill" | "fit"

type PrintViewProps = {
  src: string
  imageWidth: number
  imageHeight: number
  widthMm: number
  heightMm: number
  offsetX: number
  offsetY: number
  fit: FitMode
  filter?: string
  /** Canvas side treatment. Mirror is the plain crop. Fold draws the wrap line. Colour insets a solid edge. */
  edge?: "mirror" | "fold" | "colour"
  edgeColour?: string
  interactive?: boolean
  onOffsetChange?: (x: number, y: number) => void
  className?: string
}

export function PrintView({
  src,
  imageWidth,
  imageHeight,
  widthMm,
  heightMm,
  offsetX,
  offsetY,
  fit,
  filter,
  edge = "mirror",
  edgeColour = "#f3eee6",
  interactive = false,
  onOffsetChange,
  className,
}: PrintViewProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const { cropWidth, cropHeight } = cropPixels(imageWidth, imageHeight, widthMm, heightMm)

  let imageStyle: CSSProperties
  if (fit === "fit") {
    const pxPerMm = Math.min(imageWidth / widthMm, imageHeight / heightMm)
    const photoWidthPct = ((imageWidth * pxPerMm) / widthMm) * 100
    const photoHeightPct = ((imageHeight * pxPerMm) / heightMm) * 100
    imageStyle = {
      width: `${photoWidthPct}%`,
      height: `${photoHeightPct}%`,
      left: `${(100 - photoWidthPct) / 2}%`,
      top: `${(100 - photoHeightPct) / 2}%`,
      filter,
    }
  } else {
    imageStyle = {
      width: `${(imageWidth / cropWidth) * 100}%`,
      height: `${(imageHeight / cropHeight) * 100}%`,
      left: `${-(offsetX / cropWidth) * 100}%`,
      top: `${-(offsetY / cropHeight) * 100}%`,
      filter,
    }
  }

  function clamp(nextX: number, nextY: number) {
    return {
      x: Math.min(Math.max(0, nextX), Math.max(0, imageWidth - cropWidth)),
      y: Math.min(Math.max(0, nextY), Math.max(0, imageHeight - cropHeight)),
    }
  }

  return (
    <div
      ref={frameRef}
      className={`relative overflow-hidden bg-[#e7dfd4] ${interactive && fit === "fill" ? "cursor-grab touch-none active:cursor-grabbing" : ""} ${className ?? ""}`}
      style={{ aspectRatio: `${widthMm} / ${heightMm}` }}
      onPointerDown={(event) => {
        if (!interactive || fit !== "fill" || !onOffsetChange) return
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { x: event.clientX, y: event.clientY, ox: offsetX, oy: offsetY }
      }}
      onPointerMove={(event) => {
        if (!drag.current || !frameRef.current || !onOffsetChange) return
        const rect = frameRef.current.getBoundingClientRect()
        const dx = ((event.clientX - drag.current.x) / rect.width) * cropWidth
        const dy = ((event.clientY - drag.current.y) / rect.height) * cropHeight
        const next = clamp(drag.current.ox - dx, drag.current.oy - dy)
        onOffsetChange(next.x, next.y)
      }}
      onPointerUp={() => {
        drag.current = null
      }}
      onPointerCancel={() => {
        drag.current = null
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} className="absolute max-w-none select-none" style={imageStyle} />
      {edge === "fold" ? (
        <div className="pointer-events-none absolute inset-[8%] border border-dashed border-[#1a1814]/70" />
      ) : null}
      {edge === "colour" ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: `inset 0 0 0 8% ${edgeColour}` }}
        />
      ) : null}
    </div>
  )
}

export function centredOffset(
  imageWidth: number,
  imageHeight: number,
  widthMm: number,
  heightMm: number,
) {
  const { cropWidth, cropHeight } = cropPixels(imageWidth, imageHeight, widthMm, heightMm)
  return {
    x: Math.max(0, (imageWidth - cropWidth) / 2),
    y: Math.max(0, (imageHeight - cropHeight) / 2),
  }
}
