import { randomBytes } from "node:crypto"
import { accountsEnabled, createUser, findUserByEmail, sessionCookie } from "@/lib/account-auth"
import { googleConfigured, googleRedirectUri } from "@/lib/google-auth"

export const dynamic = "force-dynamic"

function stateCookie(request: Request) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [name, ...rest] = part.trim().split("=")
    if (name === "ochre_oauth_state") return rest.join("=")
  }
  return ""
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const fail = (why: string) => Response.redirect(`${url.origin}/account?google=${why}`, 302)
  if (!googleConfigured() || !accountsEnabled()) return fail("unavailable")
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  if (!code || !state || state !== stateCookie(request)) return fail("failed")
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
        client_secret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
        redirect_uri: googleRedirectUri(request),
        grant_type: "authorization_code",
      }),
    })
    if (!tokenRes.ok) return fail("failed")
    const { access_token } = (await tokenRes.json()) as { access_token?: string }
    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${access_token}` } })
    if (!infoRes.ok) return fail("failed")
    const info = (await infoRes.json()) as { email?: string; email_verified?: boolean; given_name?: string; family_name?: string; name?: string }
    if (!info.email || !info.email_verified) return fail("unverified")
    let user = await findUserByEmail(info.email)
    if (!user) {
      user = await createUser({
        email: info.email,
        firstName: info.given_name || info.name?.split(" ")[0] || "Collector",
        lastName: info.family_name || "-",
        // Random password: Google users can set one later via reset.
        password: `${randomBytes(24).toString("base64url")}a1`,
      })
    }
    const headers = new Headers({ location: `${url.origin}/account` })
    headers.append("set-cookie", sessionCookie(user.id))
    headers.append("set-cookie", "ochre_oauth_state=; HttpOnly; Path=/; Max-Age=0")
    return new Response(null, { status: 302, headers })
  } catch (error) {
    console.error("google-auth", error instanceof Error ? error.message : "failed")
    return fail("failed")
  }
}
