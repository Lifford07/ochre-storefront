import { createHash, randomBytes } from "node:crypto"
import { findUserByEmail, validEmail } from "@/lib/account-auth"
import { putJSON } from "@/lib/account-store"
import { mailEnabled, sendMail } from "@/lib/mail"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!mailEnabled()) {
    return Response.json({ sent: false, disabled: true, message: "Email reset is not switched on yet. Please write to us and we will reset it for you." })
  }
  if (!(await rateLimit(`forgot:${clientIp(request)}`, 5, 900))) return tooMany()
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const email = String(body.email ?? "").trim()
  const generic = { sent: true, message: "If that email has an Ochré account, a reset link is on its way." }
  if (!validEmail(email)) return Response.json(generic)
  try {
    const user = await findUserByEmail(email)
    if (user) {
      const token = randomBytes(32).toString("base64url")
      const key = createHash("sha256").update(token).digest("hex")
      await putJSON(`resets/${key}.json`, { id: user.id, exp: Date.now() + 60 * 60 * 1000 })
      const origin = new URL(request.url).origin
      await sendMail({
        to: user.email,
        subject: "Reset your Ochré password",
        text: [
          `Hello ${user.firstName},`,
          "Someone asked to reset the password on your Ochré account. If it was you, open this link within one hour:",
          `${origin}/account/reset?token=${token}`,
          "If it was not you, you can ignore this email.",
        ].join("\n\n"),
      })
    }
  } catch (error) {
    console.error("account-forgot", error instanceof Error ? error.message : "failed")
  }
  return Response.json(generic)
}
