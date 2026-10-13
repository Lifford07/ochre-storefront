import { checkPassword, findUserByEmail, hashPassword, normaliseEmail, passwordProblem, publicUser, saveUser, userFromRequest, validEmail } from "@/lib/account-auth"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const user = await userFromRequest(request)
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 })
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const firstName = String(body.firstName ?? user.firstName).trim()
  const lastName = String(body.lastName ?? user.lastName).trim()
  const email = normaliseEmail(String(body.email ?? user.email))
  const currentPassword = String(body.currentPassword ?? "")
  const newPassword = String(body.newPassword ?? "")
  if (!firstName || !lastName) return Response.json({ error: "Name cannot be empty." }, { status: 400 })
  if (!validEmail(email)) return Response.json({ error: "Please give a valid email address." }, { status: 400 })
  const changingSensitive = email !== user.email || newPassword
  if (changingSensitive && !(await checkPassword(currentPassword, user.passwordHash))) {
    return Response.json({ error: "Enter your current password to change email or password." }, { status: 401 })
  }
  if (newPassword) {
    const problem = passwordProblem(newPassword)
    if (problem) return Response.json({ error: problem }, { status: 400 })
  }
  if (email !== user.email && (await findUserByEmail(email))) {
    return Response.json({ error: "That email is already used by another account." }, { status: 409 })
  }
  const previousEmail = user.email
  const next = { ...user, firstName, lastName, email, passwordHash: newPassword ? await hashPassword(newPassword) : user.passwordHash }
  await saveUser(next, previousEmail)
  return Response.json({ user: publicUser(next) })
}
