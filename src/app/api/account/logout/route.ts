import { clearedCookie } from "@/lib/account-auth"

export async function POST() {
  return Response.json({ ok: true }, { headers: { "set-cookie": clearedCookie() } })
}
