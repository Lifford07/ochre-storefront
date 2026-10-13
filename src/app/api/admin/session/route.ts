import { adminConfigured, adminCookie, adminToken } from "@/lib/admin-auth"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!(await rateLimit(`admin-login:${clientIp(request)}`, 8, 600))) return tooMany()
  if (!adminConfigured()) {
    return Response.json({ error: "Set ADMIN_PASSWORD before the order desk can open." }, { status: 503 })
  }
  let password = ""
  try {
    const body = (await request.json()) as { password?: string }
    password = body.password?.trim() ?? ""
  } catch {
    return Response.json({ error: "The password was not readable." }, { status: 400 })
  }
  if (adminToken(password) !== adminToken()) {
    return Response.json({ error: "That password is not the order desk." }, { status: 401 })
  }
  return Response.json(
    { ok: true },
    { headers: { "set-cookie": adminCookie(password) } },
  )
}
