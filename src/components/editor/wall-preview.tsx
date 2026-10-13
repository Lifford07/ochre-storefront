"use client"

import { Component, useEffect, useRef, useState, type ReactNode } from "react"

/**
 * "View on your wall" — a layered 2D canvas mock-up.
 * Read-only: it takes the editor's photo, material and size and draws them. It never writes order state.
 * Every room is drawn here in code (no stock photography) at a known scale in pixels per centimetre.
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
}

type Room = {
  id: string
  label: string
  /** pixels per centimetre at the wall plane */
  pxPerCm: number
  /** wall height of the canvas bottom of the art centre, in px from top */
  hangCentreY: number
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, pxPerCm: number) => void
  note: string
}

const W = 1600
const H = 1000

function wall(ctx: CanvasRenderingContext2D, top: string, bottom: string, floorY: number) {
  const g = ctx.createLinearGradient(0, 0, 0, floorY)
  g.addColorStop(0, top)
  g.addColorStop(1, bottom)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, floorY)
  const light = ctx.createRadialGradient(W * 0.18, H * 0.05, 20, W * 0.18, H * 0.05, W * 0.7)
  light.addColorStop(0, "rgba(255,255,255,0.35)")
  light.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = light
  ctx.fillRect(0, 0, W, floorY)
  ctx.fillStyle = "#f7f3ea"
  ctx.fillRect(0, floorY - 14, W, 14)
}

function floor(ctx: CanvasRenderingContext2D, floorY: number, a: string, b: string, planks: boolean) {
  const g = ctx.createLinearGradient(0, floorY, 0, H)
  g.addColorStop(0, a)
  g.addColorStop(1, b)
  ctx.fillStyle = g
  ctx.fillRect(0, floorY, W, H - floorY)
  if (planks) {
    ctx.strokeStyle = "rgba(60,40,20,0.18)"
    ctx.lineWidth = 2
    for (let x = -400; x < W + 400; x += 130) {
      ctx.beginPath()
      ctx.moveTo(W / 2 + (x - W / 2) * 0.55, floorY)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fillStyle = fill
  ctx.fill()
}

function softShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  const g = ctx.createRadialGradient(x + w / 2, y, 10, x + w / 2, y, w * 0.6)
  g.addColorStop(0, "rgba(0,0,0,0.28)")
  g.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = g
  ctx.fillRect(x - w * 0.1, y - 30, w * 1.2, 60)
}

// Floor line at 82% of the height. 3.2 px per cm → the visible wall is 500 cm wide, 256 cm floor-to-top.
const LIVING: Room = {
  id: "living",
  label: "Living room",
  pxPerCm: 3.2,
  hangCentreY: 0,
  note: "beside a 200 cm sofa",
  draw(ctx, _w, _h, k) {
    const floorY = H * 0.82
    wall(ctx, "#efe7da", "#e2d6c3", floorY)
    floor(ctx, floorY, "#a7835f", "#7b5d41", true)
    const sw = 200 * k
    const x = (W - sw) / 2
    const seatTop = floorY - 45 * k
    const backTop = floorY - 85 * k
    softShadow(ctx, x, floorY + 6, sw)
    roundRect(ctx, x + 8 * k, backTop, sw - 16 * k, 48 * k, 18, "#1d2a4a")
    roundRect(ctx, x, seatTop - 8 * k, sw, 34 * k, 14, "#26365c")
    roundRect(ctx, x - 4 * k, backTop + 24 * k, 16 * k, 58 * k, 12, "#1a2644")
    roundRect(ctx, x + sw - 12 * k, backTop + 24 * k, 16 * k, 58 * k, 12, "#1a2644")
    ctx.save()
    ctx.translate(x + sw * 0.32, backTop + 30 * k)
    ctx.rotate(-0.12)
    roundRect(ctx, 0, 0, 38 * k, 34 * k, 8, "#C6B849")
    ctx.restore()
    ctx.fillStyle = "#3b2d1f"
    ctx.fillRect(x + 14 * k, floorY - 12 * k, 4 * k, 12 * k)
    ctx.fillRect(x + sw - 18 * k, floorY - 12 * k, 4 * k, 12 * k)
    // floor lamp
    ctx.fillStyle = "#2a2a2a"
    ctx.fillRect(x + sw + 30 * k, floorY - 150 * k, 2.5 * k, 150 * k)
    roundRect(ctx, x + sw + 18 * k, floorY - 172 * k, 28 * k, 26 * k, 4, "#efe2b8")
    this.hangCentreY = backTop - 25 * k
  },
}

const BEDROOM: Room = {
  id: "bedroom",
  label: "Bedroom",
  pxPerCm: 3.2,
  hangCentreY: 0,
  note: "above a 160 cm double bed",
  draw(ctx, _w, _h, k) {
    const floorY = H * 0.84
    wall(ctx, "#e9ece9", "#d5dbda", floorY)
    floor(ctx, floorY, "#c3b6a3", "#a39580", false)
    const bw = 160 * k
    const x = (W - bw) / 2
    const head = floorY - 115 * k
    softShadow(ctx, x, floorY + 6, bw)
    roundRect(ctx, x, head, bw, 115 * k, 14, "#c8b597")
    roundRect(ctx, x - 6 * k, floorY - 55 * k, bw + 12 * k, 40 * k, 8, "#f5f2ec")
    roundRect(ctx, x - 6 * k, floorY - 32 * k, bw + 12 * k, 32 * k, 8, "#1d2a4a")
    roundRect(ctx, x + 10 * k, floorY - 72 * k, 62 * k, 22 * k, 10, "#ffffff")
    roundRect(ctx, x + bw - 72 * k, floorY - 72 * k, 62 * k, 22 * k, 10, "#ffffff")
    for (const side of [-1, 1]) {
      const tx = side < 0 ? x - 60 * k : x + bw + 15 * k
      ctx.fillStyle = "#8d6f50"
      ctx.fillRect(tx, floorY - 50 * k, 45 * k, 50 * k)
      roundRect(ctx, tx + 12 * k, floorY - 82 * k, 20 * k, 30 * k, 10, "rgba(198,184,73,0.85)")
    }
    this.hangCentreY = head - 30 * k
  },
}

const HALL: Room = {
  id: "hall",
  label: "Hallway",
  pxPerCm: 3.2,
  hangCentreY: 0,
  note: "above a 120 cm console",
  draw(ctx, _w, _h, k) {
    const floorY = H * 0.86
    wall(ctx, "#0f1a3a", "#0b1430", floorY)
    ctx.fillStyle = "#f3efe7"
    ctx.fillRect(0, floorY - 14, W, 14)
    floor(ctx, floorY, "#2a2f3c", "#161a24", false)
    const cw = 120 * k
    const x = (W - cw) / 2
    const top = floorY - 80 * k
    softShadow(ctx, x, floorY + 6, cw)
    ctx.fillStyle = "#C6B849"
    ctx.fillRect(x, top, cw, 4 * k)
    ctx.fillRect(x + 4 * k, top, 2 * k, 80 * k)
    ctx.fillRect(x + cw - 6 * k, top, 2 * k, 80 * k)
    roundRect(ctx, x + cw * 0.7, top - 34 * k, 16 * k, 34 * k, 6, "#e8e2d4")
    this.hangCentreY = top - 30 * k
  },
}

export const ROOMS = [LIVING, BEDROOM, HALL]

function drawArt(ctx: CanvasRenderingContext2D, img: HTMLImageElement, room: Room, p: Props) {
  const k = room.pxPerCm
  const aw = (p.widthMm / 10) * k
  const ah = (p.heightMm / 10) * k
  const ax = (W - aw) / 2
  // hangCentreY is the line the bottom edge sits on (about 25 cm above the furniture)
  let ay = room.hangCentreY - ah
  if (ay < 20) ay = 20
  const glass = p.materialId === "real-glass"
  const acrylic = p.materialId === "acrylic" || p.materialId === "gallery-bond"
  const canvas = p.materialId === "canvas"
  const depth = canvas ? 2.5 * k : acrylic ? 0.8 * k : 0.5 * k

  // drop shadow
  ctx.save()
  ctx.shadowColor = "rgba(20,14,8,0.45)"
  ctx.shadowBlur = canvas ? 26 : 34
  ctx.shadowOffsetX = canvas ? 10 : 8
  ctx.shadowOffsetY = canvas ? 16 : 20
  ctx.fillStyle = "#000"
  ctx.fillRect(ax, ay, aw, ah)
  ctx.restore()

  // image, cover-cropped to the chosen size
  const ir = img.naturalWidth / img.naturalHeight
  const fr = aw / ah
  let sw = img.naturalWidth
  let sh = img.naturalHeight
  let sx = 0
  let sy = 0
  if (ir > fr) {
    sw = sh * fr
    sx = (img.naturalWidth - sw) / 2
  } else {
    sh = sw / fr
    sy = (img.naturalHeight - sh) / 2
  }
  ctx.save()
  if (p.filter) ctx.filter = p.filter
  ctx.drawImage(img, sx, sy, sw, sh, ax, ay, aw, ah)
  ctx.restore()

  if (canvas) {
    // wrapped side (right) and bottom, mirrored strip of the image, darkened
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(ax + aw, ay)
    ctx.lineTo(ax + aw + depth, ay + depth * 0.6)
    ctx.lineTo(ax + aw + depth, ay + ah + depth * 0.6)
    ctx.lineTo(ax + aw, ay + ah)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, sx + sw * 0.97, sy, sw * 0.03, sh, ax + aw, ay, depth, ah + depth)
    ctx.fillStyle = "rgba(0,0,0,0.35)"
    ctx.fillRect(ax + aw, ay, depth, ah + depth)
    ctx.restore()
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(ax, ay + ah)
    ctx.lineTo(ax + aw, ay + ah)
    ctx.lineTo(ax + aw + depth, ay + ah + depth * 0.6)
    ctx.lineTo(ax + depth, ay + ah + depth * 0.6)
    ctx.closePath()
    ctx.fillStyle = "rgba(40,30,20,0.55)"
    ctx.fill()
    ctx.restore()
    // weave texture, matte
    ctx.save()
    ctx.globalAlpha = 0.09
    ctx.fillStyle = "#000"
    for (let y = ay; y < ay + ah; y += 3) ctx.fillRect(ax, y, aw, 1)
    for (let x = ax; x < ax + aw; x += 3) ctx.fillRect(x, ay, 1, ah)
    ctx.restore()
    ctx.save()
    ctx.globalAlpha = 0.06
    ctx.fillStyle = "#fff"
    ctx.fillRect(ax, ay, aw, ah)
    ctx.restore()
  } else {
    // edge: thin glass edge (greenish) or deep polished acrylic edge (clear, bright)
    ctx.save()
    ctx.fillStyle = glass ? "rgba(150,185,170,0.85)" : "rgba(235,245,250,0.9)"
    ctx.beginPath()
    ctx.moveTo(ax + aw, ay)
    ctx.lineTo(ax + aw + depth, ay + depth)
    ctx.lineTo(ax + aw + depth, ay + ah + depth)
    ctx.lineTo(ax + aw, ay + ah)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = glass ? "rgba(120,160,145,0.85)" : "rgba(200,215,225,0.9)"
    ctx.beginPath()
    ctx.moveTo(ax, ay + ah)
    ctx.lineTo(ax + aw, ay + ah)
    ctx.lineTo(ax + aw + depth, ay + ah + depth)
    ctx.lineTo(ax + depth, ay + ah + depth)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = glass ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.9)"
    ctx.lineWidth = acrylic ? 2.5 : 1.2
    ctx.strokeRect(ax + 0.5, ay + 0.5, aw - 1, ah - 1)
    ctx.restore()
    // glare
    ctx.save()
    ctx.beginPath()
    ctx.rect(ax, ay, aw, ah)
    ctx.clip()
    const g = ctx.createLinearGradient(ax, ay, ax + aw, ay + ah)
    const strong = acrylic ? 0.42 : 0.26
    g.addColorStop(0, `rgba(255,255,255,${strong})`)
    g.addColorStop(0.22, "rgba(255,255,255,0.04)")
    g.addColorStop(0.42, "rgba(255,255,255,0)")
    g.addColorStop(0.6, `rgba(255,255,255,${acrylic ? 0.22 : 0.12})`)
    g.addColorStop(0.66, "rgba(255,255,255,0)")
    ctx.globalCompositeOperation = "screen"
    ctx.fillStyle = g
    ctx.fillRect(ax, ay, aw, ah)
    if (glass) {
      // faint window reflection on real glass
      ctx.globalAlpha = 0.08
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(ax + aw * 0.12, ay - 10, aw * 0.12, ah + 20)
      ctx.fillRect(ax + aw * 0.28, ay - 10, aw * 0.05, ah + 20)
    }
    ctx.restore()
  }
}

type PhotoRoom = { id: string; label: string; src: string; pxPerCm: number; anchor: [number, number]; note: string; credit: string }

/**
 * Photo rooms: CC0 photographs from StockSnap.io (via Openverse), no attribution required, credited anyway.
 * pxPerCm is calibrated on the wall plane of each 960 px wide photo:
 *  - living: the existing canvas above the sofa is about 120 cm wide and 285 px → 2.4 px/cm
 *  - dining: the wall light switch plate (about 7 cm) is 22 px → about 3.0 px/cm
 */
const PHOTO_ROOMS: PhotoRoom[] = [
  { id: "living", label: "Living room", src: "/rooms/living.webp", pxPerCm: 2.4, anchor: [240, 110], note: "above the sofa", credit: "Photo: StockSnap (CC0)" },
  { id: "dining", label: "Dining room", src: "/rooms/dining.webp", pxPerCm: 3.0, anchor: [455, 230], note: "above the dining table", credit: "Photo: StockSnap (CC0)" },
]

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

function drawPiece(ctx: CanvasRenderingContext2D, img: HTMLImageElement, p: Props, ax: number, ay: number, aw: number, ah: number, k: number) {
  const glass = p.materialId === "real-glass"
  const acrylic = p.materialId === "acrylic" || p.materialId === "gallery-bond"
  const canvas = p.materialId === "canvas"
  const depth = canvas ? 2.5 * k : acrylic ? 0.8 * k : 0.4 * k
  // sample the wall colour around the piece for lighting
  const sx0 = Math.max(0, Math.floor(ax - 6))
  const sy0 = Math.max(0, Math.floor(ay + ah / 2))
  const px = ctx.getImageData(sx0, sy0, 1, 1).data
  // contact shadow: tight dark edge + soft wide falloff (light from the upper left)
  ctx.save()
  ctx.shadowColor = "rgba(20,14,8,0.55)"
  ctx.shadowBlur = Math.max(4, k * 1.2)
  ctx.shadowOffsetX = k * 0.6
  ctx.shadowOffsetY = k * 0.9
  ctx.fillStyle = "#000"
  ctx.fillRect(ax, ay, aw + depth, ah + depth)
  ctx.shadowColor = "rgba(20,14,8,0.28)"
  ctx.shadowBlur = Math.max(12, k * 6)
  ctx.shadowOffsetX = k * 2
  ctx.shadowOffsetY = k * 3.5
  ctx.fillRect(ax, ay, aw + depth, ah + depth)
  ctx.restore()
  // image, cover-cropped
  const ir = img.naturalWidth / img.naturalHeight
  const fr = aw / ah
  let sw = img.naturalWidth
  let sh = img.naturalHeight
  let sx = 0
  let sy = 0
  if (ir > fr) {
    sw = sh * fr
    sx = (img.naturalWidth - sw) / 2
  } else {
    sh = sw / fr
    sy = (img.naturalHeight - sh) / 2
  }
  ctx.save()
  if (p.filter) ctx.filter = p.filter
  ctx.drawImage(img, sx, sy, sw, sh, ax, ay, aw, ah)
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
  ctx.fillStyle = `rgb(${px[0]},${px[1]},${px[2]})`
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

function WallCanvas(props: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [roomId, setRoomId] = useState("living")
  const [own, setOwn] = useState<string | null>(null)
  const [ownScale, setOwnScale] = useState(3)
  const [offsets, setOffsets] = useState<Record<string, [number, number]>>({})
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const isOwn = roomId === "own"
  const room = PHOTO_ROOMS.find((r) => r.id === roomId) ?? PHOTO_ROOMS[0]
  const SCALE = 2

  useEffect(() => {
    let alive = true
    const bgSrc = isOwn ? own : room.src
    if (!bgSrc) return
    Promise.all([loadImage(bgSrc), loadImage(props.src)])
      .then(([bg, art]) => {
        const c = ref.current
        if (!alive || !c) return
        const w = Math.min(1920, bg.naturalWidth * SCALE)
        const f = w / bg.naturalWidth
        c.width = Math.round(w)
        c.height = Math.round(bg.naturalHeight * f)
        const ctx = c.getContext("2d", { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(bg, 0, 0, c.width, c.height)
        const k = (isOwn ? ownScale * (bg.naturalWidth / 960) : room.pxPerCm) * f
        const aw = (props.widthMm / 10) * k
        const ah = (props.heightMm / 10) * k
        const [ox, oy] = offsets[roomId] ?? [0, 0]
        const cx = (isOwn ? c.width / 2 : room.anchor[0] * f) + ox
        const cy = (isOwn ? c.height * 0.35 : room.anchor[1] * f) + oy
        drawPiece(ctx, art, props, cx - aw / 2, cy - ah / 2, aw, ah, k)
        setReady(true)
      })
      .catch(() => setFailed(true))
    return () => {
      alive = false
    }
  }, [props, room, isOwn, own, ownScale, offsets, roomId])

  function toCanvas(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = e.currentTarget
    const r = c.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * c.width, ((e.clientY - r.top) / r.height) * c.height] as const
  }

  function download() {
    const url = ref.current?.toDataURL("image/png")
    if (!url) return
    const a = document.createElement("a")
    a.href = url
    a.download = `ochre-on-the-wall-${roomId}.png`
    a.click()
  }

  if (failed) return null
  const tabs = [...PHOTO_ROOMS.map((r) => ({ id: r.id, label: r.label })), { id: "own", label: "Your room" }]
  return (
    <figure className="space-y-3" data-testid="wall-preview">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex border border-[#C6B849]/70 text-[10px] tracking-[0.18em] uppercase" role="group" aria-label="Room">
          {tabs.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={r.id === roomId}
              onClick={() => setRoomId(r.id)}
              className={`px-3 py-1.5 ${r.id === roomId ? "bg-[var(--navy)] text-[#F3EFE7]" : "text-[var(--navy)] hover:bg-[#C6B849]/15"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={download} disabled={!ready || (isOwn && !own)} className="border border-[var(--navy)] px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase disabled:opacity-40" data-testid="wall-download">
          Download PNG
        </button>
      </div>
      {isOwn ? (
        <div className="flex flex-wrap items-center gap-4 border border-[#C6B849]/50 bg-white/40 p-3 text-sm">
          <label className="cursor-pointer border border-[var(--navy)] px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase">
            {own ? "Change wall photo" : "Upload a photo of your wall"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              data-testid="own-room-input"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (own) URL.revokeObjectURL(own)
                setOwn(URL.createObjectURL(file))
              }}
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            Size on your wall
            <input type="range" min={0.6} max={10} step={0.1} value={ownScale} onChange={(e) => setOwnScale(Number(e.target.value))} data-testid="own-room-scale" className="accent-[#C6B849]" />
          </label>
          <span className="text-xs text-[var(--navy)]/60">Stays on your device. Drag the piece to place it.</span>
        </div>
      ) : null}
      {isOwn && !own ? (
        <div className="grid aspect-[3/2] place-items-center border border-dashed border-[#C6B849] bg-white/30 text-sm text-[var(--navy)]/60">Upload a straight-on photo of your wall.</div>
      ) : (
        <canvas
          ref={ref}
          className="block h-auto w-full cursor-grab touch-none bg-[#e9e1d3] active:cursor-grabbing"
          aria-label={`${props.sizeName} ${props.materialName} on a wall`}
          onPointerDown={(e) => {
            const [x, y] = toCanvas(e)
            const [ox, oy] = offsets[roomId] ?? [0, 0]
            drag.current = { x, y, ox, oy }
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (!drag.current) return
            const [x, y] = toCanvas(e)
            const d = drag.current
            setOffsets((o) => ({ ...o, [roomId]: [d.ox + x - d.x, d.oy + y - d.y] }))
          }}
          onPointerUp={() => {
            drag.current = null
          }}
        />
      )}
      <figcaption className="text-xs text-[var(--navy)]/65">
        {props.sizeName} {props.materialName.toLowerCase()}
        {isOwn ? ", sized with the slider on your own photo." : `, to scale ${room.note}. Drag to move it. ${room.credit}.`}
      </figcaption>
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
    return this.state.failed ? null : this.props.children
  }
}

export function WallPanel(props: Props & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(props.defaultOpen))
  return (
    <Boundary>
      <section className="my-6 border border-[#C6B849]/60 bg-[#F3EFE7] p-4 md:p-5" data-testid="wall-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#9a8c2e] uppercase">Live preview · to scale</p>
            <p className="font-display text-2xl">View on your wall</p>
          </div>
          <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="btn-foil px-5 py-2 text-[11px]" data-testid="wall-toggle">
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
