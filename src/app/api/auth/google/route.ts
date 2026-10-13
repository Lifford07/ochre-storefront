import { randomBytes } from "node:crypto"
import { accountsEnabled } from "@/lib/account-auth"
import { googleConfigured, googleRedirectUri } from "@/lib/google-auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  if (!googleConfigured() || !accountsEnabled()) return Response.redirect(`${origin}/account?google=unavailable`, 302)
  const state = randomBytes(24).toString("base64url")
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
    redirect_uri: googleRedirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  })
  const secure = process.env.VERCEL ? "; Secure" : ""
  return new Response(null, {
    status: 302,
    headers: {
      location: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      "set-cookie": `ochre_oauth_state=${state}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600${secure}`,
    },
  })
}
