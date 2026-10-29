import type { CrestDesign } from './types'
import { priceDesign } from './pricing'

export type SavedDesignPayload = {
  design: CrestDesign
  price: ReturnType<typeof priceDesign>
  exportedAt: string
}

export function toSavedPayload(design: CrestDesign): SavedDesignPayload {
  return {
    design,
    price: priceDesign(design),
    exportedAt: new Date().toISOString(),
  }
}

export function downloadDesignJson(design: CrestDesign, filename = 'ochre-crest-design.json') {
  const payload = toSavedPayload(design)
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return payload
}

export function designFromJson(raw: unknown): CrestDesign | null {
  if (!raw || typeof raw !== 'object') return null
  const root = raw as Record<string, unknown>
  const design = (root.design ?? root) as CrestDesign
  if (design.version !== 1 || !design.baseId || !design.shieldId) return null
  return design
}
