export const CARE_PROMISE = "Every piece is checked by eye before print"

export const EDITION_RUNS = [1, 10, 25, 50] as const

export type EditionRun = (typeof EDITION_RUNS)[number]

export type Look = "original" | "bw" | "sepia"

export function lookLabel(look: Look) {
  if (look === "bw") return "Black & White"
  if (look === "sepia") return "Sepia"
  return "Original"
}

/** Preview filter. Black and white is applied on its own so colour boost does not fight it. */
export function previewFilter(colour: boolean, look: Look) {
  if (look === "bw") return "grayscale(1) contrast(1.05)"
  const parts: string[] = []
  if (look === "sepia") parts.push("sepia(0.75) contrast(1.04)")
  if (colour) parts.push("saturate(1.18) contrast(1.06)")
  return parts.length > 0 ? parts.join(" ") : undefined
}

export function editionSentence(run: EditionRun) {
  if (run === 1) return "This image will be made once."
  return `Made ${run} times. The number is assigned when the payment clears.`
}
