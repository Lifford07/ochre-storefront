import { createHash } from "node:crypto"
import { getUser, hashPassword, passwordProblem, saveUser, sessionCookie } from "@/lib/account-auth"
import { getJSON, remove } from "@/lib/account-store"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const token = String(body.token ?? "")
  const password = String(body.password ?? "")
  const problem = passwordProblem(password)
  if (problem) return Response.json({ error: problem }, { status: 400 })
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return Response.json({ error: "That reset link is not valid." }, { status: 400 })
  const key = `resets/${createHash("sha256").update(token).digest("hex")}.json`
  const entry = await getJSON<{ id: string; exp: number }>(key)
  if (!entry || entry.exp < Date.now()) return Response.json({ error: "That reset link has expired. Ask for a new one." }, { status: 400 })
  const user = await getUser(entry.id)
  if (!user) return Response.json({ error: "That reset link is not valid." }, { status: 400 })
  await saveUser({ ...user, passwordHash: await hashPassword(password) })
  await remove(key)
  return Response.json({ ok: true }, { headers: { "set-cookie": sessionCookie(user.id) } })
}
