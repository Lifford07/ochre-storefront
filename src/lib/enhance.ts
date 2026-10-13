/**
 * Swap point for resolution enhancement.
 *
 * Today this runs in the browser: the photo is redrawn at 2× or 4× with
 * high-quality smoothing, then a light sharpen. It does not invent detail
 * the way a trained model can. The meter is then scored again on the new
 * pixel size, so it cannot pretend a soft file became sharp.
 *
 * Later, replace the body of `enhanceResolution` with a server call
 * (for example Real-ESRGAN via Replicate). Keep the same arguments and
 * the same return shape.
 */

export type EnhanceFactor = 2 | 4

export type EnhanceResult = {
  blob: Blob
  width: number
  height: number
  factor: EnhanceFactor
  /** Identifies the engine, so a later server model is obvious in the order. */
  engine: "canvas-resample"
}

type WorkerEvent =
  | { type: "progress"; label: string; percent: number }
  | { type: "done"; buffer: ArrayBuffer; width: number; height: number; factor: EnhanceFactor }
  | { type: "error"; message: string }

export async function enhanceResolution(
  blob: Blob,
  factor: EnhanceFactor,
  onProgress?: (label: string, percent: number) => void,
): Promise<EnhanceResult> {
  const buffer = await blob.arrayBuffer()
  const worker = new Worker(new URL("../workers/enhance.worker.ts", import.meta.url))
  try {
    const result = await new Promise<EnhanceResult>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<WorkerEvent>) => {
        const message = event.data
        if (message.type === "progress") {
          onProgress?.(message.label, message.percent)
          return
        }
        if (message.type === "error") {
          reject(new Error(message.message))
          return
        }
        resolve({
          blob: new Blob([message.buffer], { type: "image/jpeg" }),
          width: message.width,
          height: message.height,
          factor: message.factor,
          engine: "canvas-resample",
        })
      }
      worker.onerror = () => reject(new Error("enhance-failed"))
      worker.postMessage({ buffer, mime: blob.type || "image/jpeg", factor }, [buffer])
    })
    return result
  } finally {
    worker.terminate()
  }
}
