export type BaseId = 'crest-print' | 'signet-ring' | 'eglomise-panel'
export type ShieldId = 'heater' | 'round' | 'lozenge' | 'swiss' | 'banner'
export type PaletteId = 'gold' | 'silver' | 'rose-gold' | 'black' | 'ochre'
/** Storefront font tokens only — Bodoni / Inter / Azeret (no second font stack). */
export type FontId = 'display' | 'sans' | 'mono'
export type SymbolGroupId =
  | 'animals'
  | 'nature'
  | 'heritage'
  | 'faith'
  | 'objects'
  | 'personal'

export type PlacedSymbol = {
  instanceId: string
  symbolId: string
  x: number
  y: number
  scale: number
}

export type CrestDesign = {
  version: 1
  baseId: BaseId
  shieldId: ShieldId
  paletteId: PaletteId
  symbols: PlacedSymbol[]
  upload: {
    fileName: string | null
    mimeType: string | null
    dataUrl: string | null
    attestedOwnCrest: boolean
    ochreRedrawNeeded: boolean
  }
  initials: string
  motto: string
  fontId: FontId
  createdAt: string
}

export type PriceBreakdown = {
  base: number
  symbolCount: number
  symbols: number
  uploadRedraw: number
  total: number
  currency: 'GBP'
}
