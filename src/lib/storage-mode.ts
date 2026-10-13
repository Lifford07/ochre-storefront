import { redisCredentials } from "./redis-client.ts"

export type OrderBackend = "redis" | "file"
export type ImageBackend = "blob" | "file" | "unavailable"

export function orderBackend(): OrderBackend {
  return redisCredentials() ? "redis" : "file"
}

/** Production refuses orders when Redis is missing. Local dev still uses the file. */
export function ordersAvailable() {
  if (process.env.VERCEL && orderBackend() !== "redis") return false
  return true
}

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

/**
 * Local dev with no env vars keeps print files on disk.
 * On Vercel a print file needs both Redis (the one-time upload ticket) and Blob
 * (the file). A missing store refuses the photo instead of writing it to /tmp.
 */
export function imageBackend(): ImageBackend {
  const blob = blobConfigured()
  const redis = orderBackend() === "redis"
  if (process.env.VERCEL) {
    if (blob && redis) return "blob"
    return "unavailable"
  }
  if (blob) return "blob"
  return "file"
}

export function storageMode() {
  return { orders: orderBackend(), images: imageBackend() }
}

export function imageUnavailableMessage() {
  if (imageBackend() !== "unavailable") return null
  if (orderBackend() !== "redis" || !blobConfigured()) {
    console.error("print-store-missing", orderBackend(), blobConfigured() ? "blob" : "no-blob")
  }
  return "This shop cannot keep the photo yet. Nothing was charged."
}
