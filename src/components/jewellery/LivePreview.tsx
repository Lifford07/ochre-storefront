'use client'

import { useId, useMemo } from 'react'
import { FONTS, PALETTES, SYMBOLS } from '@/lib/crest/catalog'
import { shieldLabel, shieldPath } from '@/lib/crest/shieldPaths'
import type { CrestDesign } from '@/lib/crest/types'
import { SymbolGlyph } from '@/components/jewellery/SymbolGlyph'

type Props = {
  design: CrestDesign
  selectedInstanceId: string | null
  onSelectInstance: (id: string | null) => void
  onMoveSymbol: (id: string, x: number, y: number) => void
  onScaleSymbol: (id: string, scale: number) => void
}

export function LivePreview({
  design,
  selectedInstanceId,
  onSelectInstance,
  onMoveSymbol,
  onScaleSymbol,
}: Props) {
  const uid = useId().replace(/:/g, '')
  const palette = PALETTES.find((p) => p.id === design.paletteId)!
  const font = FONTS.find((f) => f.id === design.fontId)!
  const path = useMemo(() => shieldPath(design.shieldId), [design.shieldId])
  const clipId = `clip-${uid}`
  const gradId = `metal-${uid}`
  const softId = `soft-${uid}`

  const baseLabel =
    design.baseId === 'crest-print'
      ? 'Crest print'
      : design.baseId === 'signet-ring'
        ? 'Signet ring'
        : 'Églomisé panel'

  const initials = (design.initials || '—').toUpperCase()
  const motto = (design.motto.trim() || 'Your motto').toUpperCase()

  function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    return pt.matrixTransform(ctm.inverse())
  }

  return (
    <div
      className="preview-stage relative overflow-hidden rounded-sm border border-[color:var(--gallery-line)] bg-[color:var(--gallery-panel)] p-4 sm:p-6"
      data-testid="live-preview"
      data-shield={design.shieldId}
      data-palette={design.paletteId}
      data-base={design.baseId}
      data-symbol-count={design.symbols.length}
    >
      <div className="mb-3 flex items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.22em] text-[color:var(--gallery-muted)]">
        <span>Live preview</span>
        <span data-testid="preview-base-label">{baseLabel}</span>
      </div>

      <div className="relative">
        {/* Shimmer behind the SVG so colours stay readable and clicks hit the art */}
        <div className="gold-leaf-shimmer pointer-events-none absolute inset-0 z-0 opacity-30" aria-hidden />
        <svg
          viewBox="0 0 200 260"
          className="relative z-[1] mx-auto block h-auto w-full max-w-[420px]"
          role="img"
          aria-label={`Crest preview on ${baseLabel}, ${shieldLabel(design.shieldId)} shield, ${palette.label}`}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onSelectInstance(null)
          }}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={path} />
            </clipPath>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
              <stop offset="40%" stopColor={palette.metal} />
              <stop offset="100%" stopColor={palette.metalDeep} />
            </linearGradient>
            <filter id={softId}>
              <feDropShadow dx="0" dy="6" stdDeviation="4" floodOpacity="0.35" />
            </filter>
          </defs>

          {design.baseId === 'signet-ring' ? (
            <>
              <ellipse cx="100" cy="238" rx="46" ry="10" fill={`url(#${gradId})`} opacity="0.85" />
              <path
                d="M56 212 C56 244 144 244 144 212"
                fill="none"
                stroke={palette.metalDeep}
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.7"
              />
            </>
          ) : null}
          {design.baseId === 'eglomise-panel' ? (
            <rect
              x="18"
              y="14"
              width="164"
              height="200"
              rx="2"
              fill="#0a0a0a"
              stroke={palette.metal}
              strokeWidth="2.5"
              filter={`url(#${softId})`}
            />
          ) : null}
          {design.baseId === 'crest-print' ? (
            <rect
              x="22"
              y="18"
              width="156"
              height="190"
              fill="#14110e"
              stroke={palette.metalDeep}
              strokeWidth="1.5"
            />
          ) : null}

          <path
            key={design.shieldId}
            d={path}
            fill={palette.field}
            stroke={`url(#${gradId})`}
            strokeWidth="3"
            filter={`url(#${softId})`}
            data-testid="preview-shield"
          />

          <g clipPath={`url(#${clipId})`}>
            {/* Field wash so palette shifts are obvious */}
            <path d={path} fill={palette.metal} opacity="0.12" />
            {design.upload.dataUrl ? (
              <image
                href={design.upload.dataUrl}
                x="50"
                y="50"
                width="100"
                height="120"
                preserveAspectRatio="xMidYMid meet"
                opacity="0.85"
                aria-label={
                  design.upload.fileName
                    ? `Uploaded crest reference: ${design.upload.fileName}`
                    : 'Uploaded crest reference'
                }
              >
                <title>
                  {design.upload.fileName
                    ? `Uploaded crest reference: ${design.upload.fileName}`
                    : 'Uploaded crest reference'}
                </title>
              </image>
            ) : null}

            {design.symbols.map((sym) => {
              const def = SYMBOLS.find((s) => s.id === sym.symbolId)
              const selected = sym.instanceId === selectedInstanceId
              return (
                <g
                  key={sym.instanceId}
                  transform={`translate(${sym.x} ${sym.y}) scale(${sym.scale})`}
                  style={{ cursor: 'grab' }}
                  data-testid={`placed-symbol-${sym.symbolId}`}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    onSelectInstance(sym.instanceId)
                    const svg = e.currentTarget.ownerSVGElement
                    if (!svg) return
                    const start = clientToSvg(svg, e.clientX, e.clientY)
                    const originX = sym.x
                    const originY = sym.y
                    const move = (ev: PointerEvent) => {
                      const local = clientToSvg(svg, ev.clientX, ev.clientY)
                      onMoveSymbol(
                        sym.instanceId,
                        originX + (local.x - start.x),
                        originY + (local.y - start.y),
                      )
                    }
                    const up = () => {
                      window.removeEventListener('pointermove', move)
                      window.removeEventListener('pointerup', up)
                    }
                    window.addEventListener('pointermove', move)
                    window.addEventListener('pointerup', up)
                  }}
                >
                  <SymbolGlyph symbolId={sym.symbolId} stroke={palette.metal} asGroup />
                  {selected ? (
                    <rect
                      x="-18"
                      y="-18"
                      width="36"
                      height="36"
                      fill="none"
                      stroke={palette.metal}
                      strokeDasharray="3 2"
                      strokeWidth="0.8"
                    />
                  ) : null}
                  <title>{def?.label ?? sym.symbolId}</title>
                </g>
              )
            })}
          </g>

          {/* Banner: initials + motto both on the ribbon */}
          <g transform="translate(0 200)">
            <path
              d="M28 4 H172 L164 36 H36 Z"
              fill={`url(#${gradId})`}
              stroke={palette.metalDeep}
              strokeWidth="1"
            />
            <text
              x="100"
              y="16"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={palette.ink}
              data-testid="preview-initials"
              style={{ fontFamily: font.family, fontSize: 10, letterSpacing: '0.16em' }}
            >
              {initials}
            </text>
            <text
              x="100"
              y="28"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={palette.ink}
              opacity="0.85"
              data-testid="preview-motto"
              style={{ fontFamily: font.family, fontSize: 6.5, letterSpacing: '0.1em' }}
            >
              {motto}
            </text>
          </g>
        </svg>
      </div>

      <p
        className="mt-3 text-xs leading-relaxed text-[color:var(--gallery-muted)]"
        data-testid="preview-readout"
        aria-live="polite"
      >
        {shieldLabel(design.shieldId)} · {palette.label} · {design.symbols.length}/3 symbols
        {design.motto.trim() ? ` · “${design.motto.trim()}”` : ''}
        {design.initials.trim() ? ` · ${design.initials.trim().toUpperCase()}` : ''}
      </p>

      {selectedInstanceId ? (
        <label className="mt-3 flex items-center gap-3 text-xs text-[color:var(--gallery-muted)]">
          <span>Symbol scale</span>
          <input
            type="range"
            min={0.6}
            max={2.2}
            step={0.05}
            value={design.symbols.find((s) => s.instanceId === selectedInstanceId)?.scale ?? 1}
            onChange={(e) => onScaleSymbol(selectedInstanceId, Number(e.target.value))}
            className="flex-1 accent-[color:var(--gallery-ochre)]"
          />
        </label>
      ) : (
        <p className="mt-2 text-xs text-[color:var(--gallery-muted)]">
          Drag symbols inside the shield. Select one to resize.
        </p>
      )}
    </div>
  )
}
