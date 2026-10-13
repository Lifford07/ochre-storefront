import { userFromRequest } from "@/lib/account-auth"
import { getBytes } from "@/lib/account-store"

export const dynamic = "force-dynamic"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await userFromRequest(request)
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 })
  const { id } = await context.params
  if (!/^[a-f0-9]{24}$/.test(id)) return Response.json({ error: "Not found." }, { status: 404 })
  const found = await getBytes(`images/${user.id}/${id}.jpg`)
  if (!found) return Response.json({ error: "Not found." }, { status: 404 })
  return new Response(new Uint8Array(found.bytes), { headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=3600" } })
}
