import { get } from "@vercel/blob"
import { isAdminRequest } from "@/lib/admin-auth"
import { contentTypeForRef, isPrivateBlobUrl, readStoredFile } from "@/lib/order-image"
import { getOrder, OrderStoreError } from "@/lib/orders-store"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

function imageHeaders(request: Request, contentType: string, id: string) {
  const download = new URL(request.url).searchParams.get("download") === "1"
  return {
    "content-type": contentType,
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
    ...(download ? { "content-disposition": `attachment; filename="${id}.jpg"` } : {}),
  }
}

function allowed(request: Request, viewToken: string | undefined) {
  if (isAdminRequest(request)) return true
  const token = new URL(request.url).searchParams.get("t")
  return Boolean(token && viewToken && token === viewToken)
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await rateLimit(`image:${clientIp(request)}`, 60, 600))) return tooMany()
  const token = new URL(request.url).searchParams.get("t")
  if (!isAdminRequest(request) && !token) {
    return Response.json({ error: "The print file is locked." }, { status: 401 })
  }
  const { id } = await context.params
  let order
  try {
    order = await getOrder(id)
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: "The order store did not answer." }, { status: 503 })
    }
    throw error
  }
  if (!order || !allowed(request, order.viewToken)) {
    return Response.json({ error: "The print file is locked." }, { status: 401 })
  }
  if (!order.imageUrl || !order.imageStore) {
    return Response.json({ error: "No print file on this order." }, { status: 404 })
  }

  if (order.imageStore === "file") {
    const stored = await readStoredFile(order.imageUrl)
    if (!stored) return Response.json({ error: "The print file is missing." }, { status: 404 })
    return new Response(stored.bytes, { headers: imageHeaders(request, stored.contentType, order.id) })
  }

  if (order.imageStore !== "blob" || !isPrivateBlobUrl(order.imageUrl)) {
    return Response.json({ error: "The print file is not in the shop's store." }, { status: 404 })
  }

  try {
    const result = await get(order.imageUrl, { access: "private" })
    if (!result || result.statusCode !== 200 || !result.stream) {
      return Response.json({ error: "The print file is missing." }, { status: 404 })
    }
    const contentType = result.blob.contentType || contentTypeForRef(order.imageUrl, order.imageContentType)
    return new Response(result.stream, { headers: imageHeaders(request, contentType, order.id) })
  } catch {
    return Response.json({ error: "The print file could not be read." }, { status: 502 })
  }
}
