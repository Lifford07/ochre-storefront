/**
 * Rules for paying for a whole basket at once. Pure, so they can be tested without a store.
 * Prices are never taken from the browser: the server prices every line again.
 */

export const MAX_PIECES = 10

export type BasketRequestLine = { slug: string; materialId: string; sizeId: string; qty: number }

/** Reads the lines sent by the browser. Same work, material and size are merged into one line. */
export function readLines(raw: unknown): { lines: BasketRequestLine[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) return { error: "The basket is empty." }
  if (raw.length > MAX_PIECES) return { error: `A basket can hold up to ${MAX_PIECES} pieces.` }
  const merged = new Map<string, BasketRequestLine>()
  for (const item of raw) {
    if (!item || typeof item !== "object") return { error: "A basket line was not readable." }
    const { slug, materialId, sizeId, qty } = item as Record<string, unknown>
    if (typeof slug !== "string" || typeof materialId !== "string" || typeof sizeId !== "string" || !slug || !materialId || !sizeId) {
      return { error: "A basket line was not readable." }
    }
    const count = Number(qty)
    if (!Number.isInteger(count) || count < 1) return { error: "A basket line has no quantity." }
    const key = `${slug}:${materialId}:${sizeId}`
    const have = merged.get(key)
    if (have) have.qty += count
    else merged.set(key, { slug, materialId, sizeId, qty: count })
  }
  const lines = [...merged.values()]
  if (pieceCount(lines) > MAX_PIECES) return { error: `A basket can hold up to ${MAX_PIECES} pieces.` }
  return { lines }
}

export function pieceCount(lines: Array<{ qty: number }>) {
  return lines.reduce((sum, line) => sum + line.qty, 0)
}

export function basketTotal(lines: Array<{ qty: number; unitPence: number }>) {
  return lines.reduce((sum, line) => sum + line.qty * line.unitPence, 0)
}

/**
 * Checks that every edition still has room for what is asked, counting the same work across lines.
 * Returns the first problem, or null.
 */
export function editionProblem(
  lines: BasketRequestLine[],
  work: (slug: string) => { title: string; editionSize: number } | undefined,
  paid: Record<string, number>,
): string | null {
  const wanted = new Map<string, number>()
  for (const line of lines) wanted.set(line.slug, (wanted.get(line.slug) ?? 0) + line.qty)
  for (const [slug, qty] of wanted) {
    const found = work(slug)
    if (!found) return "A work in the basket is not in the house."
    const left = Math.max(0, found.editionSize - (paid[slug] ?? 0))
    if (left === 0) return `${found.title} has sold out.`
    if (qty > left) return `Only ${left} of ${found.title} ${left === 1 ? "is" : "are"} left.`
  }
  return null
}
