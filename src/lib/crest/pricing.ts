import { BASES, SYMBOL_PRICE, UPLOAD_REDRAW_FEE } from './catalog'
import type { CrestDesign, PriceBreakdown } from './types'

export function priceDesign(design: CrestDesign): PriceBreakdown {
  const base = BASES.find((b) => b.id === design.baseId)?.price ?? 0
  const symbols = design.symbols.length * SYMBOL_PRICE
  const uploadRedraw = design.upload.ochreRedrawNeeded ? UPLOAD_REDRAW_FEE : 0
  return {
    base,
    symbolCount: design.symbols.length,
    symbols,
    uploadRedraw,
    total: base + symbols + uploadRedraw,
    currency: 'GBP',
  }
}
