import { adminRequired } from "@/lib/admin-auth"
import { parsePassport } from "@/lib/passport"
import { passportStorage, savePassport } from "@/lib/passports-store"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = adminRequired(request)
  if (denied) return denied
  if (!(await rateLimit(`passport-save:${clientIp(request)}`, 40, 600))) return tooMany()
  if (!passportStorage().writable) {
    return Response.json(
      { error: "Set up Redis before saving passports on the live site. The pieces in the repo still show." },
      { status: 503 },
    )
  }
  const { id } = await params
  const body = await readJson(request)
  if (!body) return Response.json({ error: "The passport was not readable." }, { status: 400 })
  const parsed = parsePassport(body)
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })
  if (parsed.value.id !== id.trim().toLowerCase()) {
    return Response.json({ error: "The piece id in the form does not match the address." }, { status: 400 })
  }
  try {
    const passport = await savePassport({ ...parsed.value, updatedAt: new Date().toISOString() })
    return Response.json({ passport })
  } catch (error) {
    console.error("passport-save", error instanceof Error ? error.message : "failed")
    return Response.json({ error: "The passport was not saved." }, { status: 500 })
  }
}

async function readJson(request: Request) {
  const text = await request.text()
  if (text.length > 100_000) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}
