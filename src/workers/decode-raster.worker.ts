/// <reference lib="webworker" />

/**
 * Turns a file's bytes into a JPEG in sRGB.
 * JPEG, PNG, and WEBP go through the browser's decoder, which converts colour to sRGB.
 * TIFF is decoded here so a large scan does not lock the page.
 */

type Job = {
  buffer: ArrayBuffer
  kind: "raster" | "tiff"
  mime: string
}

type UtifImage = { width: number; height: number }
type UtifApi = {
  decode: (buffer: ArrayBuffer) => UtifImage[]
  decodeImage: (buffer: ArrayBuffer, image: UtifImage) => void
  toRGBA8: (image: UtifImage) => Uint8Array
}

const scope = self as DedicatedWorkerGlobalScope

scope.onmessage = (event: MessageEvent<Job>) => {
  void run(event.data)
}

async function run(job: Job) {
  try {
    scope.postMessage({ type: "progress", label: "Converting for print…", percent: 45 })
    const decoded =
      job.kind === "tiff" ? await fromTiff(job.buffer) : await fromRaster(job.buffer, job.mime)
    scope.postMessage({
      type: "progress",
      label: job.kind === "tiff" ? "Preparing the TIFF…" : "Setting the colour to sRGB…",
      percent: 80,
    })
    const blob = await decoded.canvas.convertToBlob({ type: "image/jpeg", quality: 0.92 })
    const buffer = await blob.arrayBuffer()
    scope.postMessage(
      { type: "done", buffer, width: decoded.width, height: decoded.height },
      [buffer],
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "unreadable"
    scope.postMessage({ type: "error", message })
  }
}

async function fromRaster(buffer: ArrayBuffer, mime: string) {
  const blob = new Blob([buffer], { type: mime || "image/jpeg" })
  const bitmap = await createImageBitmap(blob, { colorSpaceConversion: "default" })
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const context = canvas.getContext("2d")
  if (!context) throw new Error("no-canvas")
  context.drawImage(bitmap, 0, 0)
  const width = bitmap.width
  const height = bitmap.height
  bitmap.close()
  return { canvas, width, height }
}

async function fromTiff(buffer: ArrayBuffer) {
  const imported = (await import("utif")) as { default?: UtifApi } & Partial<UtifApi>
  const utif = typeof imported.decode === "function" ? (imported as UtifApi) : imported.default
  if (!utif?.decode) throw new Error("tiff")
  const pages = utif.decode(buffer)
  const page = pages[0]
  if (!page) throw new Error("empty-tiff")
  utif.decodeImage(buffer, page)
  const rgba = utif.toRGBA8(page)
  const canvas = new OffscreenCanvas(page.width, page.height)
  const context = canvas.getContext("2d")
  if (!context) throw new Error("no-canvas")
  const pixels = new Uint8ClampedArray(rgba.byteLength)
  pixels.set(rgba)
  context.putImageData(new ImageData(pixels, page.width, page.height), 0, 0)
  return { canvas, width: page.width, height: page.height }
}

export {}
