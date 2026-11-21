"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import type { MaterialId } from "@/config/catalogue"
import { cropPixels } from "@/lib/quality"
import type { FitMode } from "@/components/editor/print-view"

type Mode = "piece" | "wall"

type Room = {
  id: string
  label: string
  src: string
  w: number
  pxPerCm: number
  anchor: [number, number]
}

/** Calibrated on the 960-wide room photos already in /public/rooms. */
const ROOMS: Room[] = [
  { id: "living", label: "Living room", src: "/rooms/living.webp", w: 960, pxPerCm: 2.4, anchor: [240, 110] },
  { id: "dining", label: "Dining room", src: "/rooms/dining.webp", w: 960, pxPerCm: 3.0, anchor: [455, 230] },
]

/**
 * Close view, in centimetres across. A 20 cm piece reads clearly.
 * If the piece would spill past the frame, the view steps back so it still fits.
 * Sizes stay in proportion for as long as the view does not have to step back.
 */
const CLOSE_CM = 56

const kept = new Map<string, Promise<HTMLImageElement>>()

function loadImage(src: string) {
  let pending = kept.get(src)
  if (!pending) {
    pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.decoding = "async"
      image.onload = () => resolve(image)
      image.onerror = () => {
        kept.delete(src)
        reject(new Error(src))
      }
      image.src = src
    })
    kept.set(src, pending)
  }
  return pending
}

type Piece = {
  materialId: MaterialId
  leaf: boolean
  widthMm: number
  heightMm: number
  fit: FitMode
  filter?: string
  imageWidth?: number
  imageHeight?: number
  offsetX?: number
  offsetY?: number
  edge?: "mirror" | "fold" | "colour"
  edgeColour?: string
}

function depthCm(materialId: MaterialId) {
  if (materialId === "canvas") return 2.5
  if (materialId === "gallery-bond") return 0.9
  if (materialId === "acrylic") return 0.6
  return 0.4
}

function drawPiece(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  piece: Piece,
  x: number,
  y: number,
  w: number,
  h: number,
  pxPerCm: number,
) {
  const depth = Math.max(piece.materialId === "canvas" ? 8 : 4, depthCm(piece.materialId) * pxPerCm)
  const glass = piece.materialId === "real-glass"
  const acrylic = piece.materialId === "acrylic" || piece.materialId === "gallery-bond"
  const canvas = piece.materialId === "canvas"

  ctx.save()
  ctx.shadowColor = "rgba(5, 22, 50, 0.35)"
  ctx.shadowBlur = Math.max(8, pxPerCm * 1.4)
  ctx.shadowOffsetX = pxPerCm * 0.35
  ctx.shadowOffsetY = pxPerCm * 0.7
  ctx.fillStyle = "#051632"
  ctx.fillRect(x, y, w + depth * 0.6, h + depth * 0.6)
  ctx.restore()

  let sx = 0
  let sy = 0
  let sw = img.naturalWidth
  let sh = img.naturalHeight
  ctx.save()
  if (piece.filter) ctx.filter = piece.filter
  if (piece.fit === "fit") {
    ctx.fillStyle = piece.edgeColour ?? "#f4f3ef"
    ctx.fillRect(x, y, w, h)
    const scale = Math.min(w / sw, h / sh)
    ctx.drawImage(img, x + (w - sw * scale) / 2, y + (h - sh * scale) / 2, sw * scale, sh * scale)
  } else {
    const refW = piece.imageWidth || sw
    const refH = piece.imageHeight || sh
    const crop = cropPixels(refW, refH, piece.widthMm, piece.heightMm)
    const fx = sw / refW
    const fy = sh / refH
    sw = crop.cropWidth * fx
    sh = crop.cropHeight * fy
    sx = piece.offsetX != null ? piece.offsetX * fx : (img.naturalWidth - sw) / 2
    sy = piece.offsetY != null ? piece.offsetY * fy : (img.naturalHeight - sh) / 2
    sx = Math.max(0, Math.min(img.naturalWidth - sw, sx))
    sy = Math.max(0, Math.min(img.naturalHeight - sh, sy))
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  }
  ctx.restore()

  if (canvas) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(x + w, y, depth, h)
    ctx.clip()
    ctx.drawImage(img, sx + sw * 0.96, sy, Math.max(1, sw * 0.04), sh, x + w, y, depth, h)
    ctx.fillStyle = "rgba(5, 22, 50, 0.35)"
    ctx.fillRect(x + w, y, depth, h)
    ctx.restore()
    ctx.fillStyle = "rgba(5, 22, 50, 0.45)"
    ctx.fillRect(x, y + h, w + depth, depth * 0.45)
    ctx.save()
    ctx.globalAlpha = 0.07
    ctx.fillStyle = "#051632"
    for (let row = y; row < y + h; row += 3) ctx.fillRect(x, row, w, 0.6)
    ctx.restore()
    if (piece.edge === "fold") {
      ctx.save()
      ctx.strokeStyle = "rgba(5, 22, 50, 0.7)"
      ctx.setLineDash([4, 4])
      ctx.strokeRect(x + w * 0.08, y + h * 0.08, w * 0.84, h * 0.84)
      ctx.restore()
    }
    if (piece.edge === "colour" && piece.edgeColour) {
      ctx.save()
      ctx.strokeStyle = piece.edgeColour
      ctx.lineWidth = Math.max(6, w * 0.06)
      ctx.strokeRect(x + ctx.lineWidth / 2, y + ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth)
      ctx.restore()
    }
  } else {
    ctx.fillStyle = glass ? "rgba(198, 214, 206, 0.95)" : "rgba(236, 242, 246, 0.95)"
    ctx.fillRect(x + w, y + 1, depth, h)
    ctx.fillStyle = glass ? "rgba(150, 168, 160, 0.95)" : "rgba(186, 198, 206, 0.95)"
    ctx.fillRect(x + 1, y + h, w + depth, depth * 0.72)
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    const sheen = ctx.createLinearGradient(x, y, x + w, y + h * 0.8)
    const gloss = acrylic ? 0.5 : 0.34
    sheen.addColorStop(0, `rgba(255,255,255,${gloss})`)
    sheen.addColorStop(0.16, "rgba(255,255,255,0.05)")
    sheen.addColorStop(0.42, "rgba(255,255,255,0)")
    sheen.addColorStop(0.58, `rgba(255,255,255,${acrylic ? 0.22 : 0.12})`)
    sheen.addColorStop(0.7, "rgba(255,255,255,0)")
    ctx.globalCompositeOperation = "screen"
    ctx.fillStyle = sheen
    ctx.fillRect(x, y, w, h)
    ctx.restore()
    ctx.strokeStyle = "rgba(255,255,255,0.75)"
    ctx.lineWidth = acrylic ? 2 : 1
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
  }

  if (piece.leaf && !canvas) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    const gold = ctx.createRadialGradient(x + w * 0.22, y + h * 0.18, 0, x + w * 0.4, y + h * 0.4, Math.max(w, h) * 0.7)
    gold.addColorStop(0, "rgba(230, 215, 162, 0.55)")
    gold.addColorStop(0.45, "rgba(198, 168, 90, 0.18)")
    gold.addColorStop(1, "rgba(168, 127, 53, 0)")
    ctx.globalCompositeOperation = "screen"
    ctx.fillStyle = gold
    ctx.fillRect(x, y, w, h)
    ctx.restore()
    ctx.strokeStyle = "#A87F35"
    ctx.lineWidth = Math.max(1.5, pxPerCm * 0.08)
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)
  }
}

export function ObjectStage({
  src,
  imageWidth,
  imageHeight,
  widthMm,
  heightMm,
  materialId,
  materialName,
  sizeName,
  filter,
  fit,
  offsetX,
  offsetY,
  edge,
  edgeColour,
  interactive,
  onOffset,
  onFit,
}: {
  src: string
  imageWidth: number
  imageHeight: number
  widthMm: number
  heightMm: number
  materialId: MaterialId
  materialName: string
  sizeName: string
  filter?: string
  fit: FitMode
  offsetX: number
  offsetY: number
  edge?: "mirror" | "fold" | "colour"
  edgeColour?: string
  interactive?: boolean
  onOffset?: (x: number, y: number) => void
  onFit?: (fit: FitMode) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLImageElement | null>(null)
  const roomRef = useRef<HTMLImageElement | null>(null)
  const [mode, setMode] = useState<Mode>("piece")
  const [roomId, setRoomId] = useState(ROOMS[0].id)
  const [leaf, setLeaf] = useState(false)
  const [ready, setReady] = useState(0)
  const [boxWidth, setBoxWidth] = useState(0)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const room = ROOMS.find((item) => item.id === roomId) ?? ROOMS[0]

  useEffect(() => {
    let alive = true
    loadImage(src).then((image) => {
      if (!alive) return
      artRef.current = image
      setReady((value) => value + 1)
    }).catch(() => {
      if (alive) artRef.current = null
    })
    return () => {
      alive = false
    }
  }, [src])

  useEffect(() => {
    if (mode !== "wall") return
    let alive = true
    loadImage(room.src).then((image) => {
      if (!alive) return
      roomRef.current = image
      setReady((value) => value + 1)
    }).catch(() => {
      if (alive) roomRef.current = null
    })
    return () => {
      alive = false
    }
  }, [mode, room.src])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const observer = new ResizeObserver(() => setBoxWidth(wrap.clientWidth))
    observer.observe(wrap)
    setBoxWidth(wrap.clientWidth)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const art = artRef.current
    if (!canvas || !wrap || !art) return
    const cssW = wrap.clientWidth || 320
    const cssH = Math.max(220, Math.round(Math.min(cssW * 0.72, mode === "wall" ? 420 : 360)))
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    canvas.style.height = `${cssH}px`
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssW, cssH)

    const longestCm = Math.max(widthMm, heightMm) / 10
    const fieldCm = Math.max(CLOSE_CM, longestCm / 0.78)
    const pxPerCm = cssW / fieldCm
    const pieceW = (widthMm / 10) * pxPerCm
    const pieceH = (heightMm / 10) * pxPerCm
    const piece: Piece = { materialId, leaf, widthMm, heightMm, fit, filter, imageWidth, imageHeight, offsetX, offsetY, edge, edgeColour }

    if (mode === "wall" && roomRef.current) {
      const photo = roomRef.current
      const photoPxPerCm = room.pxPerCm * (photo.naturalWidth / room.w)
      const scale = pxPerCm / photoPxPerCm
      const photoScale = photo.naturalWidth / room.w
      const anchorX = room.anchor[0] * photoScale
      const anchorY = room.anchor[1] * photoScale
      const dx = cssW / 2 - anchorX * scale
      const dy = cssH * 0.42 - anchorY * scale
      ctx.drawImage(photo, dx, dy, photo.naturalWidth * scale, photo.naturalHeight * scale)
      drawPiece(ctx, art, piece, cssW / 2 - pieceW / 2, cssH * 0.42 - pieceH / 2, pieceW, pieceH, pxPerCm)
    } else {
      ctx.fillStyle = "#f4f3ef"
      ctx.fillRect(0, 0, cssW, cssH)
      ctx.fillStyle = "#e0cda8"
      ctx.fillRect(0, cssH - 10, cssW, 10)
      drawPiece(ctx, art, piece, cssW / 2 - pieceW / 2, (cssH - 10) / 2 - pieceH / 2, pieceW, pieceH, pxPerCm)
    }
  }, [ready, boxWidth, mode, room, src, widthMm, heightMm, materialId, leaf, fit, filter, imageWidth, imageHeight, offsetX, offsetY, edge, edgeColour])

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (!interactive || mode !== "piece" || fit !== "fill" || !onOffset) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, ox: offsetX, oy: offsetY }
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drag.current || !onOffset || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const crop = cropPixels(imageWidth, imageHeight, widthMm, heightMm)
    const longestCm = Math.max(widthMm, heightMm) / 10
    const fieldCm = Math.max(CLOSE_CM, longestCm / 0.78)
    const pieceScreenW = rect.width * ((widthMm / 10) / fieldCm)
    const pieceScreenH = pieceScreenW * (heightMm / Math.max(widthMm, 1))
    const dx = ((event.clientX - drag.current.x) / Math.max(pieceScreenW, 1)) * crop.cropWidth
    const dy = ((event.clientY - drag.current.y) / Math.max(pieceScreenH, 1)) * crop.cropHeight
    const x = Math.min(Math.max(0, drag.current.ox - dx), Math.max(0, imageWidth - crop.cropWidth))
    const y = Math.min(Math.max(0, drag.current.oy - dy), Math.max(0, imageHeight - crop.cropHeight))
    onOffset(x, y)
  }

  const leafAllowed = materialId !== "canvas"

  return (
    <figure className="sticky top-0 z-20 bg-[var(--porcelain)] pb-3" data-testid="object-stage">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex border border-[var(--line)]" role="group" aria-label="Preview">
          {(
            [
              ["piece", "The piece"],
              ["wall", "On the wall"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
              className={`min-h-11 px-3 font-mark text-[10px] tracking-[0.14em] uppercase ${mode === id ? "bg-[var(--navy)] text-[var(--porcelain)]" : "text-[var(--navy)]"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === "wall" ? (
          <div className="flex border border-[var(--line)]" role="group" aria-label="Room">
            {ROOMS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={roomId === item.id}
                onClick={() => setRoomId(item.id)}
                className={`min-h-11 px-3 text-[11px] ${roomId === item.id ? "bg-[var(--navy)] text-[var(--porcelain)]" : "text-[var(--navy)]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        {leafAllowed ? (
          <button
            type="button"
            aria-pressed={leaf}
            onClick={() => setLeaf((value) => !value)}
            className={`min-h-11 border px-3 font-mark text-[10px] tracking-[0.14em] uppercase ${leaf ? "border-[var(--antique)] bg-[var(--antique)] text-[var(--porcelain)]" : "border-[var(--line)] text-[var(--navy)]"}`}
          >
            Gold leaf
          </button>
        ) : null}
      </div>
      <div ref={wrapRef} className="relative mt-2">
        <canvas
          ref={canvasRef}
          className={`block w-full touch-none ${interactive && mode === "piece" && fit === "fill" ? "cursor-grab active:cursor-grabbing" : ""}`}
          role="img"
          aria-label={`${sizeName} ${materialName}${leaf && leafAllowed ? ", with a gold-leaf sheen" : ""}. ${mode === "wall" ? "On the wall" : "As the object"}, in proportion.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => {
            drag.current = null
          }}
          onPointerCancel={() => {
            drag.current = null
          }}
        />
      </div>
      <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-2 text-xs text-[var(--navy)]/70">
        <span>
          {sizeName} {materialName.toLowerCase()}
          {leaf && leafAllowed ? " · gold leaf is a preview, not part of the price" : ""}
          {mode === "piece" && interactive && fit === "fill" ? " · drag to move the crop" : ""}
        </span>
        {onFit && mode === "piece" ? (
          <span className="flex gap-2">
            <button type="button" className="min-h-11 underline-offset-4" aria-pressed={fit === "fill"} onClick={() => onFit("fill")}>
              Fill
            </button>
            <button type="button" className="min-h-11 underline-offset-4" aria-pressed={fit === "fit"} onClick={() => onFit("fit")}>
              Fit
            </button>
          </span>
        ) : null}
      </figcaption>
    </figure>
  )
}
