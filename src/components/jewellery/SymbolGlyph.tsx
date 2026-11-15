'use client'

/** Placeholder marks — swap for Ochré drawings by id. */

type Props = {
  symbolId: string
  stroke: string
  size?: number
  /** When true, render a <g> for nesting inside another SVG (no nested <svg>). */
  asGroup?: boolean
}

function MarkPaths({ symbolId, stroke }: { symbolId: string; stroke: string }) {
  const s = {
    fill: 'none' as const,
    stroke,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (symbolId) {
    case 'lion':
      return (
        <>
          <circle {...s} cx="16" cy="14" r="6" />
          <path {...s} d="M10 14 L6 8 M22 14 L26 8 M12 20 Q16 26 20 20" />
        </>
      )
    case 'stag':
      return (
        <>
          <path {...s} d="M16 26 C10 20 10 12 16 10 C22 12 22 20 16 26" />
          <path {...s} d="M12 10 L8 4 M12 10 L10 2 M20 10 L24 4 M20 10 L22 2" />
        </>
      )
    case 'eagle':
      return <path {...s} d="M16 8 L16 22 M16 12 L6 18 M16 12 L26 18 M10 22 L22 22" />
    case 'oak':
      return (
        <>
          <path {...s} d="M16 28 V12" />
          <path {...s} d="M16 12 C8 8 6 18 12 20 C6 24 14 28 16 24 C18 28 26 24 20 20 C26 18 24 8 16 12" />
        </>
      )
    case 'olive':
      return (
        <>
          <path {...s} d="M6 22 Q16 6 26 22" />
          <path {...s} d="M10 18 Q16 10 22 18" />
        </>
      )
    case 'sun':
      return (
        <>
          <circle {...s} cx="16" cy="16" r="5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
            const r = (d * Math.PI) / 180
            return (
              <line
                key={d}
                {...s}
                x1={16 + Math.cos(r) * 8}
                y1={16 + Math.sin(r) * 8}
                x2={16 + Math.cos(r) * 13}
                y2={16 + Math.sin(r) * 13}
              />
            )
          })}
        </>
      )
    case 'benin-coral':
      return (
        <>
          <circle {...s} cx="10" cy="16" r="3" />
          <circle {...s} cx="16" cy="16" r="3" />
          <circle {...s} cx="22" cy="16" r="3" />
          <path {...s} d="M7 16 H25" />
        </>
      )
    case 'adinkra':
      return (
        <>
          <circle {...s} cx="16" cy="16" r="10" />
          <path {...s} d="M16 8 V24 M8 16 H24 M11 11 L21 21 M21 11 L11 21" />
        </>
      )
    case 'celtic-knot':
      return (
        <>
          <path {...s} d="M10 10 L22 10 L22 22 L10 22 Z" />
          <path {...s} d="M10 16 H22 M16 10 V22" />
        </>
      )
    case 'shamrock':
      return (
        <>
          <circle {...s} cx="16" cy="11" r="4" />
          <circle {...s} cx="11" cy="17" r="4" />
          <circle {...s} cx="21" cy="17" r="4" />
          <path {...s} d="M16 18 V26" />
        </>
      )
    case 'yoruba-crown':
      return <path {...s} d="M6 22 H26 L24 12 L19 16 L16 8 L13 16 L8 12 Z" />
    case 'cross':
      return <path {...s} d="M16 6 V26 M8 12 H24" />
    case 'crescent':
      return <path {...s} d="M20 8 A9 9 0 1 0 20 24 A6 6 0 1 1 20 8" />
    case 'star-faith':
      return <path {...s} d="M16 6 L18 13 H25 L19 17 L21 24 L16 20 L11 24 L13 17 L7 13 H14 Z" />
    case 'anvil':
      return <path {...s} d="M6 14 H26 V18 H20 V24 H12 V18 H6 Z" />
    case 'quill':
      return <path {...s} d="M8 24 L22 8 L26 10 L12 26 Z" />
    case 'key':
      return (
        <>
          <circle {...s} cx="11" cy="16" r="5" />
          <path {...s} d="M16 16 H26 M22 16 V20 M25 16 V19" />
        </>
      )
    case 'fingerprint':
      return (
        <>
          <path {...s} d="M10 22 C10 12 22 12 22 22" />
          <path {...s} d="M12 22 C12 14 20 14 20 22" />
          <path {...s} d="M14 22 C14 16 18 16 18 22" />
        </>
      )
    case 'initials-mark':
      return (
        <>
          <rect {...s} x="7" y="7" width="18" height="18" rx="2" />
          <path {...s} d="M12 20 V12 H16 M18 12 V20" />
        </>
      )
    case 'year-mark':
      return (
        <>
          <rect {...s} x="6" y="8" width="20" height="16" rx="2" />
          <path {...s} d="M10 16 H22 M16 12 V20" />
        </>
      )
    default:
      return <circle {...s} cx="16" cy="16" r="8" />
  }
}

export function SymbolGlyph({ symbolId, stroke, size = 24, asGroup = false }: Props) {
  if (asGroup) {
    return (
      <g transform="translate(-16 -16)" aria-hidden>
        <MarkPaths symbolId={symbolId} stroke={stroke} />
      </g>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="pointer-events-none">
      <MarkPaths symbolId={symbolId} stroke={stroke} />
    </svg>
  )
}
