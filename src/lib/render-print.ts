import { cropPixels } from "@/lib/quality"

const MM_PER_INCH = 25.4
const MAX_EDGE = 7000

export type RenderPrintInput = {
  blob: Blob
  imageWidth: number
  imageHeight: number
  widthMm: number
  heightMm: number
  offsetX: number
  offsetY: number
  fit: "fill" | "fit"
  filter?: string
  edge?: "mirror" | "fold" | "colour"
  edgeColour?: string
}

export type RenderedPrint = {
  blob: Blob
  width: number
  height: number
  dpi: number
}

/**
 * Draws the crop, fit and colour filters into a JPEG at the source DPI, capped at 300.
 * It does not enlarge past the pixels in the file. Smoothing from Enhance is not used.
 */
export async function renderPrintFile(input: RenderPrintInput): Promise<RenderedPrint> {
  const bitmap = await createImageBitmap(input.blob)
  try {
    const { cropWidth, cropHeight } = cropPixels(input.imageWidth, input.imageHeight, input.widthMm, input.heightMm)
    const sourceDpi = Math.min(cropWidth / (input.widthMm / MM_PER_INCH), cropHeight / (input.heightMm / MM_PER_INCH))
    if (!Number.isFinite(sourceDpi) || sourceDpi <= 0) throw new Error("The print size could not be measured.")
    const scale = Math.min(1, 300 / sourceDpi)
    let outW = Math.max(1, Math.round(cropWidth * scale))
    let outH = Math.max(1, Math.round(cropHeight * scale))
    const limit = Math.max(outW, outH)
    if (limit > MAX_EDGE) {
      const fitted = MAX_EDGE / limit
      outW = Math.max(1, Math.round(outW * fitted))
      outH = Math.max(1, Math.round(outH * fitted))
    }
    const canvas = document.createElement("canvas")
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("The print file could not be drawn.")
    ctx.fillStyle = input.edge === "colour" ? input.edgeColour || "#f3eee6" : "#f4f0e8"
    ctx.fillRect(0, 0, outW, outH)
    if (input.filter) ctx.filter = input.filter
    if (input.fit === "fit") {
      const scale = Math.min(outW / bitmap.width, outH / bitmap.height)
      const w = bitmap.width * scale
      const h = bitmap.height * scale
      ctx.drawImage(bitmap, (outW - w) / 2, (outH - h) / 2, w, h)
    } else {
      const sx = Math.min(Math.max(0, input.offsetX), Math.max(0, bitmap.width - cropWidth))
      const sy = Math.min(Math.max(0, input.offsetY), Math.max(0, bitmap.height - cropHeight))
      ctx.drawImage(bitmap, sx, sy, cropWidth, cropHeight, 0, 0, outW, outH)
    }
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("The print file could not be saved."))), "image/jpeg", 0.9)
    })
    const outputDpi = Math.round(Math.min(outW / (input.widthMm / MM_PER_INCH), outH / (input.heightMm / MM_PER_INCH)))
    return { blob, width: outW, height: outH, dpi: outputDpi }
  } finally {
    bitmap.close()
  }
}
