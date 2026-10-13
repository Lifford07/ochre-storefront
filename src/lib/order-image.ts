import { promises as fs } from "node:fs"
import path from "node:path"

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024

const FILE_REF = /^file:[a-z0-9-]+\.(jpg|png|webp)$/

export type ImageContentType = "image/jpeg" | "image/png" | "image/webp"

export function uploadsDir() {
  if (process.env.UPLOADS_DIR) return process.env.UPLOADS_DIR
  return path.join(process.cwd(), "data", "uploads")
}

export function sniffImage(bytes: Uint8Array): ImageContentType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg"
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png"
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp"
  }
  return null
}

function extensionFor(type: ImageContentType) {
  if (type === "image/png") return "png"
  if (type === "image/webp") return "webp"
  return "jpg"
}

export function isFileImageRef(value: string) {
  return FILE_REF.test(value)
}

export function isPrivateBlobUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || url.username || url.password) return false
    if (!url.hostname.endsWith(".private.blob.vercel-storage.com")) return false
    const pathname = decodeURIComponent(url.pathname)
    return pathname.startsWith("/orders/") && !pathname.includes("..") && !pathname.includes("\\")
  } catch {
    return false
  }
}

export function contentTypeForRef(ref: string, claimed?: string): ImageContentType {
  if (claimed === "image/jpeg" || claimed === "image/png" || claimed === "image/webp") return claimed
  const pathPart = ref.split("?")[0] ?? ref
  if (pathPart.endsWith(".png")) return "image/png"
  if (pathPart.endsWith(".webp")) return "image/webp"
  return "image/jpeg"
}

export async function saveUploadedFile(bytes: Uint8Array) {
  if (bytes.byteLength === 0) throw new Error("The print file was empty.")
  if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("That file is over 25MB.")
  const contentType = sniffImage(bytes)
  if (!contentType) throw new Error("Use a JPEG, PNG, or WebP.")
  const name = `${crypto.randomUUID()}.${extensionFor(contentType)}`
  const dir = uploadsDir()
  await fs.mkdir(/* turbopackIgnore: true */ dir, { recursive: true })
  await fs.writeFile(path.join(/* turbopackIgnore: true */ dir, name), bytes)
  return { imageUrl: `file:${name}`, imageStore: "file" as const, imageContentType: contentType }
}

export async function readStoredFile(ref: string) {
  if (!isFileImageRef(ref)) return null
  const name = ref.slice("file:".length)
  try {
    const bytes = await fs.readFile(path.join(/* turbopackIgnore: true */ uploadsDir(), name))
    const contentType = sniffImage(bytes)
    if (!contentType) return null
    return { bytes, contentType }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}
