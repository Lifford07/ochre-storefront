import type { CrestDesign } from './types'

export function createDefaultDesign(): CrestDesign {
  return {
    version: 1,
    baseId: 'signet-ring',
    shieldId: 'heater',
    paletteId: 'ochre',
    symbols: [],
    upload: {
      fileName: null,
      mimeType: null,
      dataUrl: null,
      attestedOwnCrest: false,
      ochreRedrawNeeded: false,
    },
    initials: '',
    motto: '',
    fontId: 'display',
    createdAt: new Date().toISOString(),
  }
}
