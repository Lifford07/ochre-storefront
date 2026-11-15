"use client"

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { cropPixels } from "@/lib/quality"

/**
 * "View on your wall": the customer's piece on a photo of a room, at true scale.
 * Read-only: it takes the editor's photo, crop, material and size and draws them. It never writes order state.
 *
 * - The room photo and the picture are loaded once per source and kept, so dragging only repaints.
 * - Only the piece takes the drag (touch-action: none on the piece alone), so the page still scrolls on a phone.
 * - The piece is kept on the photo, and "Put it back" resets it.
 * - If an image fails, a message and "Try again" are shown instead of the preview vanishing.
 */

type Material = "real-glass" | "acrylic" | "canvas" | string

type Props = {
  src: string
  widthMm: number
  heightMm: number
  materialId: Material
  materialName: string
  sizeName: string
  filter?: string
  /** The crop placed in the editor, in source pixels (top-left). Centred when left out. */
  imageWidth?: number
  imageHeight?: number
  offsetX?: number
  offsetY?: number
  fit?: "fill" | "fit"
}

type PhotoRoom = {
  id: string
  label: string
  src: string
  /** natural width of the photo the scale was measured on */
  w: number
  pxPerCm: number
  anchor: [number, number]
  note: string
  credit: string
}

/**
 * Photo rooms: CC0 photographs from StockSnap.io (via Openverse), no attribution required, credited anyway.
 * pxPerCm is calibrated on the wall plane of each 960 px wide photo:
 *  - living: the existing canvas above the sofa is about 120 cm wide and 285 px → 2.4 px/cm
 *  - dining: the wall light switch plate (about 7 cm) is 22 px → about 3.0 px/cm
 */
const PHOTO_ROOMS: PhotoRoom[] = [
  { id: "living", label: "Living room", src: "/rooms/living.webp", w: 960, pxPerCm: 2.4, anchor: [240, 110], note: "above the sofa", credit: "Photo: StockSnap (CC0)" },
  { id: "dining", label: "Dining room", src: "/rooms/dining.webp", w: 960, pxPerCm: 3.0, anchor: [455, 230], note: "above the dining table", credit: "Photo: StockSnap (CC0)" },
]

const kept = new Map<string, Promise<HTMLImageElement>>()
function loadImage(src: string) {
  let p = kept.get(src)
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.decoding = "async"
      img.onload = () => resolve(img)
      img.onerror = () => {
        kept.delete(src)
        reject(new Error(src))
      }
      img.src = src
    })
    kept.set(src, p)
  }
  return p
}

function wallTone(bg: HTMLImageElement, x: number, y: number) {
  try {
    const c = document.createElement("canvas")
    c.width = c.height = 1
    const ctx = c.getContext("2d", { willReadFrequently: true })
    if (!ctx) return "rgb(226,216,200)"
    ctx.drawImage(bg, Math.max(0, Math.min(bg.naturalWidth - 1, x)), Math.max(0, Math.min(bg.naturalHeight - 1, y)), 1, 1, 0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return `rgb(${d[0]},${d[1]},${d[2]})`
  } catch {
    return "rgb(226,216,200)"
  }
}

type Piece = Pick<Props, "materialId" | "filter" | "imageWidth" | "imageHeight" | "offsetX" | "offsetY" | "fit" | "widthMm" | "heightMm">

function drawPiece(ctx: CanvasRenderingContext2D, img: HTMLImageElement, p: Piece, ax: number, ay: number, aw: number, ah: number, k: number, tone: string) {
  const glass = p.materialId === "real-glass"
  const acrylic = p.materialId === "acrylic" || p.materialId === "gallery-bond"
  const canvas = p.materialId === "canvas"
  const depth = canvas ? 2.5 * k : acrylic ? 0.8 * k : 0.4 * k
  // contact shadow: tight dark edge + soft wide falloff (light from the upper left)
  ctx.save()
  ctx.fillStyle = "#000"
  ctx.shadowColor = "rgba(20,14,8,0.55)"
  ctx.shadowBlur = Math.max(4, k * 1.2)
  ctx.shadowOffsetX = k * 0.6
  ctx.shadowOffsetY = k * 0.9
  ctx.fillRect(ax, ay, aw + depth, ah + depth)
  ctx.shadowColor = "rgba(20,14,8,0.28)"
  ctx.shadowBlur = Math.max(12, k * 6)
  ctx.shadowOffsetX = k * 2
  ctx.shadowOffsetY = k * 3.5
  ctx.fillRect(ax, ay, aw + depth, ah + depth)
  ctx.restore()

  // the picture, cropped exactly as placed in the editor
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  let sx = 0
  let sy = 0
  let sw = iw
  let sh = ih
  ctx.save()
  if (p.filter) ctx.filter = p.filter
  if (p.fit === "fit") {
    ctx.fillStyle = "#f3eee6"
    ctx.fillRect(ax, ay, aw, ah)
    const s = Math.min(aw / iw, ah / ih)
    ctx.drawImage(img, ax + (aw - iw * s) / 2, ay + (ah - ih * s) / 2, iw * s, ih * s)
  } else {
    // offsets are in the editor's source pixels; scale them if the preview image has a different size
    const ref = p.imageWidth && p.imageHeight ? { w: p.imageWidth, h: p.imageHeight } : { w: iw, h: ih }
    const crop = cropPixels(ref.w, ref.h, p.widthMm, p.heightMm)
    const fx = iw / ref.w
    const fy = ih / ref.h
    sw = crop.cropWidth * fx
    sh = crop.cropHeight * fy
    sx = p.offsetX != null ? p.offsetX * fx : (iw - sw) / 2
    sy = p.offsetY != null ? p.offsetY * fy : (ih - sh) / 2
    sx = Math.max(0, Math.min(iw - sw, sx))
    sy = Math.max(0, Math.min(ih - sh, sy))
    ctx.drawImage(img, sx, sy, sw, sh, ax, ay, aw, ah)
  }
  ctx.restore()

  if (canvas) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(ax + aw, ay, depth, ah + depth)
    ctx.clip()
    ctx.drawImage(img, sx + sw * 0.97, sy, sw * 0.03, sh, ax + aw, ay, depth, ah)
    ctx.fillStyle = "rgba(0,0,0,0.38)"
    ctx.fillRect(ax + aw, ay, depth, ah + depth)
    ctx.restore()
    ctx.fillStyle = "rgba(30,22,14,0.5)"
    ctx.fillRect(ax, ay + ah, aw + depth, depth * 0.6)
    ctx.save()
    ctx.globalAlpha = 0.08
    ctx.fillStyle = "#000"
    for (let y = ay; y < ay + ah; y += 2) ctx.fillRect(ax, y, aw, 0.6)
    for (let x = ax; x < ax + aw; x += 2) ctx.fillRect(x, ay, 0.6, ah)
    ctx.restore()
  } else {
    ctx.save()
    ctx.fillStyle = glass ? "rgba(150,185,170,0.9)" : "rgba(235,245,250,0.95)"
    ctx.fillRect(ax + aw, ay + 1, depth, ah)
    ctx.fillStyle = glass ? "rgba(120,160,145,0.9)" : "rgba(200,215,225,0.95)"
    ctx.fillRect(ax + 1, ay + ah, aw + depth - 1, depth)
    ctx.strokeStyle = glass ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.85)"
    ctx.lineWidth = acrylic ? 2 : 1
    ctx.strokeRect(ax + 0.5, ay + 0.5, aw - 1, ah - 1)
    ctx.beginPath()
    ctx.rect(ax, ay, aw, ah)
    ctx.clip()
    const g = ctx.createLinearGradient(ax, ay, ax + aw, ay + ah)
    const strong = acrylic ? 0.4 : 0.24
    g.addColorStop(0, `rgba(255,255,255,${strong})`)
    g.addColorStop(0.25, "rgba(255,255,255,0.03)")
    g.addColorStop(0.55, "rgba(255,255,255,0)")
    g.addColorStop(0.62, `rgba(255,255,255,${acrylic ? 0.2 : 0.1})`)
    g.addColorStop(0.7, "rgba(255,255,255,0)")
    ctx.globalCompositeOperation = "screen"
    ctx.fillStyle = g
    ctx.fillRect(ax, ay, aw, ah)
    ctx.restore()
  }
  // room light: multiply with the wall colour, plus a soft falloff from the upper left
  ctx.save()
  ctx.globalCompositeOperation = "multiply"
  ctx.globalAlpha = 0.22
  ctx.fillStyle = tone
  ctx.fillRect(ax, ay, aw + depth, ah + depth)
  ctx.globalAlpha = 1
  const fall = ctx.createLinearGradient(ax, ay, ax + aw, ay + ah)
  fall.addColorStop(0, "rgba(255,255,255,1)")
  fall.addColorStop(1, "rgba(200,190,175,1)")
  ctx.fillStyle = fall
  ctx.globalAlpha = 0.35
  ctx.fillRect(ax, ay, aw + depth, ah + depth)
  ctx.restore()
}

type Box = { left: number; top: number; width: number; height: number }

function WallCanvas(props: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [roomId, setRoomId] = useState("living")
  const [own, setOwn] = useState<string | null>(null)
  const [ownScale, setOwnScale] = useState(3)
  const [offsets, setOffsets] = useState<Record<string, [number, number]>>({})
  const [images, setImages] = useState<{ bg: HTMLImageElement; art: HTMLImageElement; bgSrc: string; artSrc: string } | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [box, setBox] = useState<Box | null>(null)
  const geo = useRef({ f: 1, cssPerNatural: 1, clamped: [0, 0] as [number, number] })
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const ownRef = useRef<string | null>(null)
  const isOwn = roomId === "own"
  const room = PHOTO_ROOMS.find((r) => r.id === roomId) ?? PHOTO_ROOMS[0]
  const bgSrc = isOwn ? own : room.src
  const { src, widthMm, heightMm, materialId, filter, imageWidth, imageHeight, offsetX, offsetY, fit } = props

  // load the room and the picture: only when a source changes, never on a drag move
  useEffect(() => {
    let alive = true
    if (!bgSrc) return
    Promise.all([loadImage(bgSrc), loadImage(src)])
      .then(([bg, art]) => {
        if (alive) setImages({ bg, art, bgSrc, artSrc: src })
      })
      .catch((error: Error) => {
        if (alive) setFailure({ key: `${bgSrc}|${src}|${attempt}`, message: error.message === bgSrc ? "The room photo did not load." : "This picture could not be placed on the wall." })
      })
    return () => {
      alive = false
    }
  }, [bgSrc, src, attempt])

  // paint: cheap, runs on every change of placement, size or material
  useEffect(() => {
    const c = ref.current
    if (!c || !images || images.bgSrc !== bgSrc || images.artSrc !== src) return
    const { bg, art } = images
    const nw = bg.naturalWidth
    const nh = bg.naturalHeight
    const cssW = c.parentElement?.clientWidth || nw
    const w = Math.min(1920, Math.round(cssW * Math.min(2, window.devicePixelRatio || 1)), nw * 2)
    const f = w / nw
    const h = Math.round(nh * f)
    if (c.width !== w || c.height !== h) {
      c.width = w
      c.height = h
    }
    const ctx = c.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(bg, 0, 0, w, h)
    const k = (isOwn ? ownScale * (nw / 960) : room.pxPerCm * (nw / room.w)) * f
    const aw = (widthMm / 10) * k
    const ah = (heightMm / 10) * k
    const [ox, oy] = offsets[roomId] ?? [0, 0]
    const pad = 4 * f
    let cx = (isOwn ? w / 2 : room.anchor[0] * f) + ox * f
    let cy = (isOwn ? h * 0.38 : room.anchor[1] * f) + oy * f
    cx = aw + pad * 2 < w ? Math.max(aw / 2 + pad, Math.min(w - aw / 2 - pad, cx)) : w / 2
    cy = ah + pad * 2 < h ? Math.max(ah / 2 + pad, Math.min(h - ah / 2 - pad, cy)) : h / 2
    geo.current = { f, cssPerNatural: cssW / nw, clamped: [cx / f - (isOwn ? nw / 2 : room.anchor[0]), cy / f - (isOwn ? nh * 0.38 : room.anchor[1])] }
    const tone = wallTone(bg, (cx - aw / 2) / f - 4, cy / f)
    drawPiece(ctx, art, { materialId, filter, imageWidth, imageHeight, offsetX, offsetY, fit, widthMm, heightMm }, cx - aw / 2, cy - ah / 2, aw, ah, k, tone)
    setBox({ left: (cx / w) * 100, top: (cy / h) * 100, width: (aw / w) * 100, height: (ah / h) * 100 })
  }, [images, bgSrc, src, isOwn, ownScale, room, roomId, offsets, widthMm, heightMm, materialId, filter, imageWidth, imageHeight, offsetX, offsetY, fit])

  // release the customer's own wall photo when it is replaced or the preview closes
  useEffect(() => () => {
    if (ownRef.current) URL.revokeObjectURL(ownRef.current)
  }, [])

  const move = useCallback(
    (dx: number, dy: number) => setOffsets((o) => {
      const [x, y] = o[roomId] ? geo.current.clamped : [0, 0]
      return { ...o, [roomId]: [x + dx, y + dy] }
    }),
    [roomId],
  )

  function download() {
    const c = ref.current
    if (!c) return
    try {
      c.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `ochre-on-the-wall-${roomId}.png`
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 4000)
      }, "image/png")
    } catch {}
  }

  const failed = failure && failure.key === `${bgSrc}|${src}|${attempt}` ? failure.message : null
  const ready = Boolean(images && box && !failed && (!isOwn || own))
  const tabs = [...PHOTO_ROOMS.map((r) => ({ id: r.id, label: r.label })), { id: "own", label: "Your room" }]
  return (
    <figure className="space-y-3" data-testid="wall-preview">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full border border-[#C6B849]/70 text-[10px] tracking-[0.14em] uppercase sm:inline-flex sm:w-auto" role="group" aria-label="Room">
          {tabs.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={r.id === roomId}
              onClick={() => setRoomId(r.id)}
              className={`min-h-11 flex-1 px-3 sm:flex-none ${r.id === roomId ? "bg-[var(--navy)] text-[#F3EFE7]" : "text-[var(--navy)] hover:bg-[#C6B849]/15"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {isOwn ? (
        <div className="grid gap-3 border border-[#C6B849]/50 bg-white/40 p-3 text-sm sm:flex sm:flex-wrap sm:items-center sm:gap-4">
          <label className="flex min-h-11 cursor-pointer items-center justify-center border border-[var(--navy)] px-3 text-[10px] tracking-[0.18em] uppercase">
            {own ? "Change wall photo" : "Upload a photo of your wall"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              data-testid="own-room-input"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (ownRef.current) {
                  kept.delete(ownRef.current)
                  URL.revokeObjectURL(ownRef.current)
                }
                const url = URL.createObjectURL(file)
                ownRef.current = url
                setOwn(url)
                setOffsets((o) => ({ ...o, own: [0, 0] }))
              }}
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            Size on your wall
            <input type="range" min={0.6} max={10} step={0.1} value={ownScale} onChange={(e) => setOwnScale(Number(e.target.value))} data-testid="own-room-scale" className="min-h-8 flex-1 accent-[#C6B849]" />
          </label>
          <span className="text-xs text-[var(--navy)]/60">Stays on your device. Drag the piece to place it.</span>
        </div>
      ) : null}
      {isOwn && !own ? (
        <div className="grid aspect-[3/2] place-items-center border border-dashed border-[#C6B849] bg-white/30 p-4 text-center text-sm text-[var(--navy)]/60">Upload a straight-on photo of your wall.</div>
      ) : failed ? (
        <div className="grid aspect-[3/2] place-items-center gap-2 border border-dashed border-[#C6B849] bg-white/30 p-4 text-center text-sm text-[var(--navy)]/70" role="status" data-testid="wall-failed">
          <p>{failed}</p>
          <button type="button" className="min-h-11 text-xs tracking-[0.14em] uppercase underline underline-offset-4" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </button>
        </div>
      ) : (
        <div className="relative bg-[#e9e1d3]">
          <canvas ref={ref} className="block h-auto w-full" role="img" aria-label={`${props.sizeName} ${props.materialName} on a wall`} />
          {box ? (
            <button
              type="button"
              data-testid="wall-piece"
              aria-label="The piece on the wall. Drag it, or use the arrow keys, to move it."
              className="absolute min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#C6B849] active:cursor-grabbing"
              style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }}
              onPointerDown={(e) => {
                const [ox, oy] = offsets[roomId] ? geo.current.clamped : [0, 0]
                drag.current = { x: e.clientX, y: e.clientY, ox, oy }
                e.currentTarget.setPointerCapture(e.pointerId)
                e.preventDefault()
              }}
              onPointerMove={(e) => {
                const d = drag.current
                if (!d) return
                const s = geo.current.cssPerNatural || 1
                setOffsets((o) => ({ ...o, [roomId]: [d.ox + (e.clientX - d.x) / s, d.oy + (e.clientY - d.y) / s] }))
              }}
              onPointerUp={() => {
                drag.current = null
              }}
              onPointerCancel={() => {
                drag.current = null
              }}
              onKeyDown={(e) => {
                const step = 5
                const m: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
                const v = m[e.key]
                if (!v) return
                e.preventDefault()
                move(v[0], v[1])
              }}
            />
          ) : null}
        </div>
      )}
      <figcaption className="text-xs text-[var(--navy)]/65">
        {props.sizeName} {props.materialName.toLowerCase()}
        {isOwn ? ", sized with the slider on your own photo." : `, to scale ${room.note}. Drag the piece to move it. ${room.credit}.`}
      </figcaption>
      <div className="flex flex-wrap gap-5">
        {offsets[roomId] ? (
          <button type="button" className="min-h-11 text-[10px] tracking-[0.18em] uppercase underline underline-offset-4" onClick={() => setOffsets((o) => { const n = { ...o }; delete n[roomId]; return n })} data-testid="wall-reset">
            Put it back
          </button>
        ) : null}
        <button type="button" onClick={download} disabled={!ready} className="min-h-11 text-[10px] tracking-[0.18em] uppercase underline underline-offset-4 disabled:opacity-40" data-testid="wall-download">
          Save this view
        </button>
      </div>
    </figure>
  )
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? (
      <p className="my-6 text-sm text-[var(--navy)]/70">The wall preview could not open on this device. Your piece and its price are unchanged.</p>
    ) : (
      this.props.children
    )
  }
}

export function WallPanel(props: Props & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(props.defaultOpen))
  return (
    <Boundary>
      <section className="my-6 border border-[#C6B849]/60 bg-[#F3EFE7] p-4 md:p-5" data-testid="wall-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#8A7E2B] uppercase">Live preview · to scale</p>
            <p className="font-display text-2xl">View on your wall</p>
          </div>
          <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="btn-foil min-h-11 px-5 py-2 text-[11px]" data-testid="wall-toggle">
            {open ? "Hide" : "View on your wall"}
          </button>
        </div>
        {open ? (
          <div className="mt-4">
            <WallCanvas {...props} />
          </div>
        ) : null}
      </section>
    </Boundary>
  )
}
