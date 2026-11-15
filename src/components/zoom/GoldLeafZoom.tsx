'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type TouchEvent,
} from 'react'
import type { ZoomTier } from '@/lib/jewellery/pieces'

type Props = {
  alt: string
  width: number
  height: number
  tiers: ZoomTier[]
  className?: string
}

const MIN_SCALE = 1
const MAX_SCALE = 10

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function pickTier(tiers: ZoomTier[], scale: number): ZoomTier {
  const sorted = [...tiers].sort((a, b) => a.maxScale - b.maxScale)
  return sorted.find((t) => scale <= t.maxScale) ?? sorted[sorted.length - 1]!
}

/**
 * Progressive deep zoom (Sotheby's-style technique, Ochré imagery).
 * Starts on a small WebP; loads sharper tiers as zoom rises. Pan with drag;
 * zoom with wheel, pinch, buttons, or keyboard.
 */
export function GoldLeafZoom({ alt, width, height, tiers, className = '' }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null)
  const scaleRef = useRef(scale)
  scaleRef.current = scale

  const active = useMemo(() => pickTier(tiers, scale), [tiers, scale])
  const nextTier = useMemo(() => {
    const sorted = [...tiers].sort((a, b) => a.maxScale - b.maxScale)
    const idx = sorted.findIndex((t) => t.src === active.src)
    return idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null
  }, [tiers, active.src])

  // Preload the next sharper tier so zoom stays smooth.
  useEffect(() => {
    if (!nextTier) return
    const img = new Image()
    img.decoding = 'async'
    img.src = nextTier.src
  }, [nextTier])

  const aspect = height / width

  const zoomAt = useCallback((nextScale: number, cx: number, cy: number) => {
    const el = viewportRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = cx - rect.left - rect.width / 2
    const py = cy - rect.top - rect.height / 2
    setScale((prev) => {
      const s = clamp(nextScale, MIN_SCALE, MAX_SCALE)
      const ratio = s / prev
      setTx((x) => x * ratio + px * (1 - ratio))
      setTy((y) => y * ratio + py * (1 - ratio))
      return s
    })
  }, [])

  const reset = useCallback(() => {
    setScale(1)
    setTx(0)
    setTy(0)
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
      zoomAt(scaleRef.current * factor, e.clientX, e.clientY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    setDragging(true)
    dragOrigin.current = { x: e.clientX, y: e.clientY, tx, ty }
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging || !dragOrigin.current) return
    const dx = e.clientX - dragOrigin.current.x
    const dy = e.clientY - dragOrigin.current.y
    setTx(dragOrigin.current.tx + dx)
    setTy(dragOrigin.current.ty + dy)
  }

  function onPointerUp() {
    setDragging(false)
    dragOrigin.current = null
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0]!, e.touches[1]!]
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      pinchRef.current = { dist, scale: scaleRef.current }
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault()
      const [a, b] = [e.touches[0]!, e.touches[1]!]
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      const midX = (a.clientX + b.clientX) / 2
      const midY = (a.clientY + b.clientY) / 2
      const next = pinchRef.current.scale * (dist / pinchRef.current.dist)
      zoomAt(next, midX, midY)
    }
  }

  function onTouchEnd() {
    pinchRef.current = null
  }

  function onKeyDown(e: KeyboardEvent) {
    const el = viewportRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    if (e.key === '+' || e.key === '=') {
      e.preventDefault()
      zoomAt(scale * 1.2, cx, cy)
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault()
      zoomAt(scale / 1.2, cx, cy)
    } else if (e.key === '0') {
      e.preventDefault()
      reset()
    } else if (e.key === 'ArrowLeft') {
      setTx((x) => x + 40)
    } else if (e.key === 'ArrowRight') {
      setTx((x) => x - 40)
    } else if (e.key === 'ArrowUp') {
      setTy((y) => y + 40)
    } else if (e.key === 'ArrowDown') {
      setTy((y) => y - 40)
    }
  }

  return (
    <div className={`gold-zoom ${className}`}>
      <div
        ref={viewportRef}
        className="gold-zoom-stage relative w-full overflow-hidden rounded-sm border border-[color:var(--gallery-line)] bg-[color:var(--gallery-panel)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[color:var(--gallery-ochre)]"
        style={{ aspectRatio: `${width} / ${height}`, touchAction: 'none', minHeight: '280px' }}
        role="region"
        aria-label={`${alt}. Deep zoom viewer. Use scroll or pinch to zoom, drag to pan, plus and minus keys to zoom, arrows to pan, zero to reset.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="gold-leaf-shimmer pointer-events-none absolute inset-0 z-[1] opacity-20" aria-hidden />
        <div
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={{
            width: '100%',
            paddingBottom: `${aspect * 100}%`,
            height: 0,
            transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: 'center center',
            cursor: dragging ? 'grabbing' : 'grab',
          }}
        >
          <img
            src={active.src}
            alt={alt}
            width={active.width}
            height={active.height}
            draggable={false}
            decoding="async"
            loading="eager"
            className="absolute inset-0 h-full w-full select-none object-contain"
            style={{ imageRendering: scale > 4 ? 'auto' : 'auto' }}
          />
        </div>
        <p className="pointer-events-none absolute bottom-3 left-3 z-[2] text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--gallery-muted)]">
          Zoom {scale.toFixed(1)}× · {active.width}px tier
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-secondary"
          aria-label="Zoom in"
          onClick={() => {
            const el = viewportRef.current
            if (!el) return
            const r = el.getBoundingClientRect()
            zoomAt(scale * 1.35, r.left + r.width / 2, r.top + r.height / 2)
          }}
        >
          Zoom in
        </button>
        <button
          type="button"
          className="btn-secondary"
          aria-label="Zoom out"
          onClick={() => {
            const el = viewportRef.current
            if (!el) return
            const r = el.getBoundingClientRect()
            zoomAt(scale / 1.35, r.left + r.width / 2, r.top + r.height / 2)
          }}
        >
          Zoom out
        </button>
        <button type="button" className="btn-secondary" aria-label="Reset zoom" onClick={reset}>
          Reset
        </button>
        <span className="text-xs text-[color:var(--gallery-muted)]">
          Scroll, pinch, or keys + / − · drag to pan
        </span>
      </div>
    </div>
  )
}
