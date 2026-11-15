import { adminRequired } from "@/lib/admin-auth"
import { passportStorage, listPassports } from "@/lib/passports-store"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const denied = adminRequired(request)
  if (denied) return denied
  const passports = await listPassports()
  return Response.json({ passports, ...passportStorage() })
}
