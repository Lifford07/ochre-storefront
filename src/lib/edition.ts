export type EditionKind = "upload" | "drop"

/** Customer one-offs read Edition 1/1. Numbered drops read Edition No. 001 of N. */
export function editionWording(kind: EditionKind, number: number, size: number): string {
  if (kind === "upload" || size <= 1) return "Edition 1/1"
  const safe = Math.max(1, Math.round(number))
  return `Edition No. ${String(safe).padStart(3, "0")} of ${size}`
}

/** Large numerals on the certificate. */
export function editionFigures(number: number, size: number): string {
  if (size <= 1) return "1 / 1"
  return `${String(Math.max(1, Math.round(number))).padStart(2, "0")} / ${size}`
}
