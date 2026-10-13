import { promises as fs } from "node:fs"
import path from "node:path"
import { get, list, put, del } from "@vercel/blob"
import { blobConfigured } from "./storage-mode.ts"

/** Account data: private Vercel Blob when configured, else a local folder (dev). */
const ROOT = "accounts/"

function blobMode() {
  return blobConfigured()
}

function localDir() {
  if (process.env.VERCEL) return "/tmp/ochre-accounts"
  return path.join(process.cwd(), "data", "accounts")
}

function safeKey(key: string) {
  if (!/^[a-z0-9/_.-]+$/i.test(key) || key.includes("..")) throw new Error("bad key")
  return key
}

export async function putBytes(key: string, bytes: Uint8Array | string, contentType: string) {
  safeKey(key)
  if (blobMode()) {
    await put(ROOT + key, Buffer.from(bytes), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
    })
    return
  }
  const file = path.join(/* turbopackIgnore: true */ localDir(), key)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, bytes)
}

export async function getBytes(key: string): Promise<{ bytes: Buffer; contentType: string } | null> {
  safeKey(key)
  if (blobMode()) {
    try {
      const result = await get(ROOT + key, { access: "private", useCache: false })
      if (!result || result.statusCode !== 200 || !result.stream) return null
      const buf = Buffer.from(await new Response(result.stream).arrayBuffer())
      return { bytes: buf, contentType: result.blob.contentType || "application/octet-stream" }
    } catch {
      return null
    }
  }
  try {
    const bytes = await fs.readFile(path.join(/* turbopackIgnore: true */ localDir(), key))
    return { bytes, contentType: key.endsWith(".json") ? "application/json" : "image/jpeg" }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const found = await getBytes(key)
  if (!found) return null
  return JSON.parse(found.bytes.toString("utf8")) as T
}

export function putJSON(key: string, value: unknown) {
  return putBytes(key, JSON.stringify(value), "application/json")
}

export async function remove(key: string) {
  safeKey(key)
  if (blobMode()) {
    const { blobs } = await list({ prefix: ROOT + key, limit: 1 })
    if (blobs[0]) await del(blobs[0].url)
    return
  }
  await fs.rm(path.join(/* turbopackIgnore: true */ localDir(), key), { force: true })
}

export async function listKeys(prefix: string): Promise<string[]> {
  safeKey(prefix)
  if (blobMode()) {
    const { blobs } = await list({ prefix: ROOT + prefix, limit: 1000 })
    return blobs.map((b) => b.pathname.slice(ROOT.length))
  }
  try {
    const names = await fs.readdir(path.join(/* turbopackIgnore: true */ localDir(), prefix))
    return names.map((n) => prefix + n)
  } catch {
    return []
  }
}
