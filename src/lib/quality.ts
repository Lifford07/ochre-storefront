/** How tightly a photo's pixels will be packed when printed at a chosen size. */

export type QualityBand = "red" | "amber" | "green"

export type PrintScore = {
  /** Dots per inch on the weaker side of the crop. Higher is sharper. */
  dpi: number
  band: QualityBand
  /** Short line shown next to the meter. */
  message: string
  /** True at 300 DPI and above: the Perfect band. */
  gallerySharp: boolean
  cropWidth: number
  cropHeight: number
}

const MM_PER_INCH = 25.4

export function bandForDpi(dpi: number): QualityBand {
  if (dpi < 150) return "red"
  if (dpi < 300) return "amber"
  return "green"
}

/**
 * Needle position on the semicircle.
 * 0 DPI sits at the left, 150 at a quarter, 300 at 0.6, 600 and above at the right.
 */
export function dpiNeedle(dpi: number): number {
  if (dpi <= 0) return 0
  if (dpi < 150) return (dpi / 150) * 0.25
  if (dpi < 300) return 0.25 + ((dpi - 150) / 150) * 0.35
  if (dpi < 600) return 0.6 + ((dpi - 300) / 300) * 0.4
  return 1
}

export function verdictFor(band: QualityBand): "Too small" | "Good" | "Perfect" {
  if (band === "red") return "Too small"
  if (band === "amber") return "Good"
  return "Perfect"
}

export function isGallerySharp(dpi: number): boolean {
  return dpi >= 300
}

export function messageFor(band: QualityBand): string {
  if (band === "green") return "Sharp at this size."
  if (band === "amber") return "Good at this size."
  return "This size would print soft."
}

/**
 * The rectangle of the photo that fills this print.
 * Extra pixels on the long side are cropped away. The tight side uses the whole edge.
 */
export function cropPixels(
  imageWidth: number,
  imageHeight: number,
  widthMm: number,
  heightMm: number,
) {
  const frameAspect = widthMm / heightMm
  const imageAspect = imageWidth / imageHeight
  if (imageAspect > frameAspect) {
    const cropHeight = imageHeight
    const cropWidth = imageHeight * frameAspect
    return { cropWidth, cropHeight }
  }
  const cropWidth = imageWidth
  const cropHeight = imageWidth / frameAspect
  return { cropWidth, cropHeight }
}

/**
 * Score the cropped photo against the print size.
 * DPI is pixels on that side divided by the print size in inches.
 * Both sides match when the crop has the print's shape, so the score is that number.
 */
/**
 * Largest size that is already sharp. If none are sharp, the smallest size,
 * so a small photo does not open on the biggest print.
 */
export function preferredSizeId(
  options: { id: string; area: number; band: QualityBand }[],
): string | null {
  if (options.length === 0) return null
  const green = options.filter((option) => option.band === "green")
  const pool = green.length > 0 ? green : options
  const ranked = [...pool].sort((a, b) => (green.length > 0 ? b.area - a.area : a.area - b.area))
  return ranked[0]?.id ?? null
}

export function scorePrint(
  imageWidth: number,
  imageHeight: number,
  widthMm: number,
  heightMm: number,
): PrintScore {
  const { cropWidth, cropHeight } = cropPixels(imageWidth, imageHeight, widthMm, heightMm)
  const dpiW = cropWidth / (widthMm / MM_PER_INCH)
  const dpiH = cropHeight / (heightMm / MM_PER_INCH)
  const dpi = Math.min(dpiW, dpiH)
  const band = bandForDpi(dpi)
  return {
    dpi,
    band,
    message: messageFor(band),
    gallerySharp: isGallerySharp(dpi),
    cropWidth,
    cropHeight,
  }
}
