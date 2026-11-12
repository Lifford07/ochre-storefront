import type { Size } from "@/config/catalogue"

/** Show every format while the list is still short. Past this, open on a window. */
export const SIZE_WINDOW_CAP = 8
export const SIZE_WINDOW = 6

export function visibleSizes<T>(items: T[], selectedIndex: number, open: boolean): T[] {
  if (open || items.length <= SIZE_WINDOW_CAP) return items
  const head = items.slice(0, SIZE_WINDOW)
  if (selectedIndex < 0 || selectedIndex < SIZE_WINDOW) return head
  return [items[selectedIndex], ...head.slice(0, SIZE_WINDOW - 1)]
}

export function hiddenSizeCount(total: number, open: boolean): number {
  if (open || total <= SIZE_WINDOW_CAP) return 0
  return total - SIZE_WINDOW
}

export function sizeFamilies(options: Size[]): { name: string; sizes: Size[] }[] {
  const order: string[] = []
  const grouped = new Map<string, Size[]>()
  for (const size of options) {
    const found = grouped.get(size.family)
    if (found) found.push(size)
    else {
      order.push(size.family)
      grouped.set(size.family, [size])
    }
  }
  return order.map((family) => {
    const sizes = grouped.get(family) ?? []
    return { name: sizes[0]?.name ?? family, sizes }
  })
}

/** Portrait and landscape, once the two are actually different. A square stays one choice. */
export function orientationChoices(sizes: Size[]): Size[] {
  const unique: Size[] = []
  for (const size of sizes) {
    if (unique.some((item) => item.widthMm === size.widthMm && item.heightMm === size.heightMm)) continue
    unique.push(size)
  }
  return unique.length > 1 ? unique : []
}
