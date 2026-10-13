import { randomBytes } from "node:crypto"
import { userFromRequest } from "@/lib/account-auth"
import { getJSON, putBytes, putJSON } from "@/lib/account-store"
import { sniffImage } from "@/lib/order-image"

export const dynamic = "force-dynamic"

export type AccountImage = { id: string; name: string; width: number; height: number; createdAt: string }

export async function GET(request: Request) {
  const user = await userFromRequest(request)
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 })
  const images = (await getJSON<AccountImage[]>(`images/${user.id}/index.json`)) ?? []
  return Response.json({ images })
}

export async function POST(request: Request) {
  const user = await userFromRequest(request)
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 })
  const form = await request.formData().catch(() => null)
  const file = form?.get("file")
  if (!(file instanceof File)) return Response.json({ error: "No image." }, { status: 400 })
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (bytes.byteLength > 4_000_000) return Response.json({ error: "Too large." }, { status: 413 })
  if (sniffImage(bytes) !== "image/jpeg") return Response.json({ error: "JPEG only." }, { status: 400 })
  const image: AccountImage = {
    id: randomBytes(12).toString("hex"),
    name: String(form?.get("name") ?? "Image").slice(0, 120),
    width: Number(form?.get("width")) || 0,
    height: Number(form?.get("height")) || 0,
    createdAt: new Date().toISOString(),
  }
  await putBytes(`images/${user.id}/${image.id}.jpg`, bytes, "image/jpeg")
  const index = (await getJSON<AccountImage[]>(`images/${user.id}/index.json`)) ?? []
  await putJSON(`images/${user.id}/index.json`, [image, ...index].slice(0, 200))
  return Response.json({ image }, { status: 201 })
}
