/// <reference lib="webworker" />

/**
 * Browser stand-in for a trained upscaler.
 * Redraws the photo at 2× or 4× with smoothing, then a light contrast pass.
 * Replace the caller in src/lib/enhance.ts to use a server model later.
 */

type Job = {
  buffer: ArrayBuffer
  mime: string
  factor: 2 | 4
}

const scope = self as DedicatedWorkerGlobalScope

scope.onmessage = (event: MessageEvent<Job>) => {
  void run(event.data)
}

async function run(job: Job) {
  try {
    scope.postMessage({ type: "progress", label: "Enhancing resolution…", percent: 25 })
    const blob = new Blob([job.buffer], { type: job.mime || "image/jpeg" })
    const bitmap = await createImageBitmap(blob)
    const width = bitmap.width * job.factor
    const height = bitmap.height * job.factor
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext("2d")
    if (!context) throw new Error("no-canvas")
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"
    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    scope.postMessage({ type: "progress", label: "Sharpening the enlargement…", percent: 70 })
    const enlarged = await createImageBitmap(canvas)
    context.filter = "contrast(1.08)"
    context.drawImage(enlarged, 0, 0)
    context.filter = "none"
    enlarged.close()

    const outBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.92 })
    const buffer = await outBlob.arrayBuffer()
    scope.postMessage({ type: "done", buffer, width, height, factor: job.factor }, [buffer])
  } catch (error) {
    const message = error instanceof Error ? error.message : "enhance-failed"
    scope.postMessage({ type: "error", message })
  }
}

export {}
