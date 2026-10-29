import type { ShieldId } from './types'

/** Distinct silhouettes in viewBox space ~40–160 x, ~34–214 y. */
export function shieldPath(id: ShieldId): string {
  switch (id) {
    case 'heater':
      return 'M42 38 H158 V112 C158 170 130 200 100 218 C70 200 42 170 42 112 Z'
    case 'round':
      return 'M100 48 m-58 0 a58 58 0 1 0 116 0 a58 58 0 1 0 -116 0'
    case 'lozenge':
      return 'M100 36 L168 120 L100 204 L32 120 Z'
    case 'swiss':
      return 'M55 40 H145 V125 C145 172 122 198 100 212 C78 198 55 172 55 125 Z'
    case 'banner':
      return 'M34 50 H166 V155 L150 140 L134 155 L118 140 L100 155 L82 140 L66 155 L50 140 L34 155 Z'
  }
}

export function shieldLabel(id: ShieldId): string {
  switch (id) {
    case 'heater':
      return 'Heater'
    case 'round':
      return 'Round'
    case 'lozenge':
      return 'Lozenge'
    case 'swiss':
      return 'Swiss'
    case 'banner':
      return 'Banner'
  }
}
