import { accountsEnabled, createUser, findUserByEmail, passwordProblem, publicUser, sessionCookie, validEmail } from "@/lib/account-auth"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!accountsEnabled()) return Response.json({ error: "Accounts are not open yet." }, { status: 503 })
  if (!(await rateLimit(`register:${clientIp(request)}`, 10, 600))) return tooMany()
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const firstName = String(body.firstName ?? "").trim()
  const lastName = String(body.lastName ?? "").trim()
  const email = String(body.email ?? "").trim()
  const password = String(body.password ?? "")
  if (!firstName || !lastName) return Response.json({ error: "Please give your first and last name." }, { status: 400 })
  if (!validEmail(email)) return Response.json({ error: "Please give a valid email address." }, { status: 400 })
  const problem = passwordProblem(password)
  if (problem) return Response.json({ error: problem }, { status: 400 })
  try {
    if (await findUserByEmail(email)) {
      return Response.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 })
    }
    const user = await createUser({ email, firstName, lastName, password })
    return Response.json({ user: publicUser(user) }, { status: 201, headers: { "set-cookie": sessionCookie(user.id) } })
  } catch (error) {
    console.error("account-register", error instanceof Error ? error.message : "failed")
    return Response.json({ error: "Your account could not be created just now." }, { status: 503 })
  }
}
