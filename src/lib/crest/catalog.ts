import type { BaseId, FontId, PaletteId, ShieldId, SymbolGroupId } from './types'

export const BASES: {
  id: BaseId
  label: string
  blurb: string
  price: number
  comingSoon?: boolean
}[] = [
  {
    id: 'crest-print',
    label: 'Crest print',
    blurb: 'Archival print of your composed shield.',
    price: 95,
  },
  {
    id: 'signet-ring',
    label: 'Signet ring',
    blurb: 'Engraved face on a solid band.',
    price: 320,
  },
  {
    id: 'eglomise-panel',
    label: 'Églomisé panel',
    blurb: 'Gilded glass panel for wall or desk.',
    price: 240,
    comingSoon: true,
  },
]

export const SHIELDS: { id: ShieldId; label: string }[] = [
  { id: 'heater', label: 'Heater' },
  { id: 'round', label: 'Round' },
  { id: 'lozenge', label: 'Lozenge' },
  { id: 'swiss', label: 'Swiss' },
  { id: 'banner', label: 'Banner' },
]

export const PALETTES: {
  id: PaletteId
  label: string
  metal: string
  metalDeep: string
  ink: string
  field: string
}[] = [
  {
    id: 'gold',
    label: 'Gold',
    metal: '#e8c547',
    metalDeep: '#9a7548',
    ink: '#3d2a0a',
    field: '#2a2118',
  },
  {
    id: 'silver',
    label: 'Silver',
    metal: '#d7dde8',
    metalDeep: '#7d8791',
    ink: '#2a3138',
    field: '#1c2228',
  },
  {
    id: 'rose-gold',
    label: 'Rose gold',
    metal: '#e3a899',
    metalDeep: '#8a5246',
    ink: '#3a1f1a',
    field: '#261816',
  },
  {
    id: 'black',
    label: 'Black',
    metal: '#3a3a3a',
    metalDeep: '#111111',
    ink: '#f0e6d8',
    field: '#0d0d0d',
  },
  {
    id: 'ochre',
    label: 'Ochre',
    metal: '#c4a574',
    metalDeep: '#8b5a3c',
    ink: '#2a1c12',
    field: '#1c1410',
  },
]

export const FONTS: { id: FontId; label: string; family: string }[] = [
  { id: 'display', label: 'Display', family: 'var(--font-bodoni), "Bodoni Moda", serif' },
  { id: 'sans', label: 'Sans', family: 'var(--font-inter), Inter, sans-serif' },
  { id: 'mono', label: 'Mono', family: 'var(--font-azeret), ui-monospace, monospace' },
]

export type SymbolDef = {
  id: string
  label: string
  group: SymbolGroupId
  keywords: string[]
}

export const SYMBOL_GROUPS: { id: SymbolGroupId; label: string }[] = [
  { id: 'animals', label: 'Animals' },
  { id: 'nature', label: 'Nature' },
  { id: 'heritage', label: 'Heritage & Culture' },
  { id: 'faith', label: 'Faith' },
  { id: 'objects', label: 'Objects & Trades' },
  { id: 'personal', label: 'Personal' },
]

/** Placeholder marks — swap path art later for Ochré drawings. */
export const SYMBOLS: SymbolDef[] = [
  { id: 'lion', label: 'Lion', group: 'animals', keywords: ['lion', 'beast', 'animal'] },
  { id: 'stag', label: 'Stag', group: 'animals', keywords: ['stag', 'deer', 'animal'] },
  { id: 'eagle', label: 'Eagle', group: 'animals', keywords: ['eagle', 'bird', 'animal'] },
  { id: 'oak', label: 'Oak', group: 'nature', keywords: ['oak', 'tree', 'nature'] },
  { id: 'olive', label: 'Olive branch', group: 'nature', keywords: ['olive', 'peace', 'nature'] },
  { id: 'sun', label: 'Sun', group: 'nature', keywords: ['sun', 'radiant', 'nature'] },
  {
    id: 'benin-coral',
    label: 'Benin coral beads',
    group: 'heritage',
    keywords: ['benin', 'coral', 'beads', 'heritage'],
  },
  {
    id: 'adinkra',
    label: 'Adinkra (Gye Nyame)',
    group: 'heritage',
    keywords: ['adinkra', 'gye', 'nyame', 'heritage'],
  },
  {
    id: 'celtic-knot',
    label: 'Celtic knot',
    group: 'heritage',
    keywords: ['celtic', 'knot', 'heritage'],
  },
  {
    id: 'shamrock',
    label: 'Shamrock',
    group: 'heritage',
    keywords: ['shamrock', 'ireland', 'heritage'],
  },
  {
    id: 'yoruba-crown',
    label: 'Yoruba crown',
    group: 'heritage',
    keywords: ['yoruba', 'crown', 'ade', 'heritage'],
  },
  { id: 'cross', label: 'Cross', group: 'faith', keywords: ['cross', 'faith'] },
  { id: 'crescent', label: 'Crescent', group: 'faith', keywords: ['crescent', 'faith'] },
  { id: 'star-faith', label: 'Star of faith', group: 'faith', keywords: ['star', 'faith'] },
  { id: 'anvil', label: 'Anvil', group: 'objects', keywords: ['anvil', 'trade', 'smith'] },
  { id: 'quill', label: 'Quill', group: 'objects', keywords: ['quill', 'trade', 'writer'] },
  { id: 'key', label: 'Key', group: 'objects', keywords: ['key', 'trade', 'object'] },
  {
    id: 'fingerprint',
    label: 'Fingerprint',
    group: 'personal',
    keywords: ['fingerprint', 'personal'],
  },
  { id: 'initials-mark', label: 'Initials mark', group: 'personal', keywords: ['initials', 'personal'] },
  { id: 'year-mark', label: 'Year mark', group: 'personal', keywords: ['year', 'date', 'personal'] },
]

export const SYMBOL_PRICE = 18
export const UPLOAD_REDRAW_FEE = 45
export const MAX_SYMBOLS = 3

export const BRIEF_HREF = '/jewellery/commission'
export const REQUEST_SYMBOL_HREF = '/jewellery/design#request-a-symbol'
