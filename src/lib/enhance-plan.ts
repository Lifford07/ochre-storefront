/**
 * How far to enlarge a soft photo so the meter can reach green (150 DPI).
 * The long edge is capped so a 4× pass cannot build a canvas the browser will drop.
 */

const MAX_LONG_EDGE = 6000

export function enhanceFactorFor(
  dpi: number,
  width: number,
  height: number,
): 2 | 4 | null {
  if (dpi >= 150 || dpi <= 0) return null
  const needed = 150 / dpi
  const factor: 2 | 4 = needed <= 2 ? 2 : 4
  const longEdge = Math.max(width, height)
  if (longEdge * factor > MAX_LONG_EDGE) {
    if (factor === 4 && longEdge * 2 <= MAX_LONG_EDGE) return 2
    return null
  }
  return factor
}
