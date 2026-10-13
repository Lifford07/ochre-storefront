"use client"

/**
 * Reads a customer file without locking the page.
 * JPEG, PNG, WEBP, and TIFF are decoded in a worker and saved as sRGB JPEG.
 * HEIC/HEIF (iPhone) and the first page of a PDF are converted first, then
 * sent through the same worker.
 */

const MAX_BYTES = 25 * 1024 * 1024

export type IngestProgress = {
  label: string
  percent: number
}

export type IngestedPhoto = {
  blob: Blob
  width: number
  height: number
  name: string
  note?: string
}

type WorkerEvent =
  | { type: "progress"; label: string; percent: number }
  | { type: "done"; buffer: ArrayBuffer; width: number; height: number }
  | { type: "error"; message: string }

type Kind = "raster" | "tiff" | "heic" | "pdf" | "unknown"

export async function ingestFile(
  file: File,
  onProgress?: (progress: IngestProgress) => void,
): Promise<IngestedPhoto> {
  if (file.size === 0) throw new Error("That file is empty.")
  if (file.size > MAX_BYTES) {
    throw new Error("That file is over 25MB. Export a slightly smaller JPG and try again.")
  }
  const kind = sniff(file)
  if (kind === "unknown") {
    throw new Error("Use a JPG, PNG, WEBP, HEIC, TIFF, or a PDF.")
  }

  onProgress?.({ label: "Reading your file…", percent: 8 })
  const buffer = await readWithProgress(file, (fraction) => {
    onProgress?.({ label: "Reading your file…", percent: Math.round(8 + fraction * 28) })
  })

  let note: string | undefined
  let payload = buffer
  let workerKind: "raster" | "tiff" = kind === "tiff" ? "tiff" : "raster"
  let mime = file.type || "image/jpeg"

  if (kind === "heic") {
    onProgress?.({ label: "Converting the iPhone photo…", percent: 40 })
    const jpeg = await convertHeic(new Blob([buffer], { type: file.type || "image/heic" }))
    payload = await jpeg.arrayBuffer()
    mime = "image/jpeg"
    workerKind = "raster"
  }

  if (kind === "pdf") {
    onProgress?.({ label: "Reading the first page of the PDF…", percent: 40 })
    const jpeg = await convertPdfFirstPage(buffer)
    payload = await jpeg.arrayBuffer()
    mime = "image/jpeg"
    workerKind = "raster"
    note = "We used the first page of the PDF."
  }

  onProgress?.({ label: "Converting for print…", percent: 55 })
  const decoded = await decodeInWorker(payload, workerKind, mime, onProgress)
  return {
    blob: new Blob([decoded.buffer], { type: "image/jpeg" }),
    width: decoded.width,
    height: decoded.height,
    name: file.name,
    note,
  }
}

function sniff(file: File): Kind {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf"
  if (name.endsWith(".heic") || name.endsWith(".heif") || type.includes("heic") || type.includes("heif")) {
    return "heic"
  }
  if (name.endsWith(".tif") || name.endsWith(".tiff") || type.includes("tiff")) return "tiff"
  if (type.startsWith("image/") || /\.(jpe?g|png|webp)$/.test(name)) return "raster"
  return "unknown"
}

async function readWithProgress(file: File, onFraction: (fraction: number) => void) {
  const reader = file.stream().getReader()
  const chunks: Uint8Array[] = []
  let received = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue
    chunks.push(value)
    received += value.byteLength
    onFraction(file.size > 0 ? received / file.size : 1)
  }
  const all = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    all.set(chunk, offset)
    offset += chunk.byteLength
  }
  return all.buffer
}

async function convertHeic(blob: Blob) {
  const heic2any = (await import("heic2any")).default
  const converted = await heic2any({ blob, toType: "image/jpeg", quality: 0.92 })
  const jpeg = Array.isArray(converted) ? converted[0] : converted
  if (!jpeg) throw new Error("That iPhone photo did not convert. Export it as a JPG and try again.")
  return jpeg
}

async function convertPdfFirstPage(buffer: ArrayBuffer) {
  const pdfjs = await import("pdfjs-dist")
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  const page = await pdf.getPage(1)
  const base = page.getViewport({ scale: 1 })
  const longEdge = Math.max(base.width, base.height)
  const scale = 1
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  await page.render({ canvas, viewport }).promise
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("The PDF page did not convert."))),
      "image/jpeg",
      0.92,
    )
  })
  return blob
}

function decodeInWorker(
  buffer: ArrayBuffer,
  kind: "raster" | "tiff",
  mime: string,
  onProgress?: (progress: IngestProgress) => void,
) {
  const worker = new Worker(new URL("../workers/decode-raster.worker.ts", import.meta.url))
  return new Promise<{ buffer: ArrayBuffer; width: number; height: number }>((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<WorkerEvent>) => {
      const message = event.data
      if (message.type === "progress") {
        onProgress?.({ label: message.label, percent: message.percent })
        return
      }
      worker.terminate()
      if (message.type === "error") {
        reject(new Error("We couldn't read that file. Try a JPG, PNG, WEBP, HEIC, TIFF, or a PDF."))
        return
      }
      resolve({ buffer: message.buffer, width: message.width, height: message.height })
    }
    worker.onerror = () => {
      worker.terminate()
      reject(new Error("We couldn't read that file. Try a JPG, PNG, WEBP, HEIC, TIFF, or a PDF."))
    }
    worker.postMessage({ buffer, kind, mime }, [buffer])
  })
}
