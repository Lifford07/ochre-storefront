import { publicUser, userFromRequest } from "@/lib/account-auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const user = await userFromRequest(request)
    return Response.json({ user: user ? publicUser(user) : null }, { headers: { "cache-control": "no-store" } })
  } catch {
    return Response.json({ user: null })
  }
}
