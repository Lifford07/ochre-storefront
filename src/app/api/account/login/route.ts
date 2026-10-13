import { checkPassword, findUserByEmail, publicUser, sessionCookie } from "@/lib/account-auth"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!(await rateLimit(`login:${clientIp(request)}`, 20, 600))) return tooMany()
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const email = String(body.email ?? "")
  const password = String(body.password ?? "")
  try {
    const user = email ? await findUserByEmail(email) : null
    if (!user || !(await checkPassword(password, user.passwordHash))) {
      return Response.json({ error: "That email and password do not match." }, { status: 401 })
    }
    return Response.json({ user: publicUser(user) }, { headers: { "set-cookie": sessionCookie(user.id) } })
  } catch (error) {
    console.error("account-login", error instanceof Error ? error.message : "failed")
    return Response.json({ error: "Sign in is not available just now." }, { status: 503 })
  }
}
