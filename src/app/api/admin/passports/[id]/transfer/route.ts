import { adminRequired } from "@/lib/admin-auth"
import { parsePassport, parseTransfer, recordTransfer } from "@/lib/passport"
import { passportStorage, savePassport } from "@/lib/passports-store"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = adminRequired(request)
  if (denied) return denied
  if (!(await rateLimit(`passport-transfer:${clientIp(request)}`, 30, 600))) return tooMany()
  if (!passportStorage().writable) {
    return Response.json(
      { error: "Set up Redis before recording a transfer on the live site." },
      { status: 503 },
    )
  }
  const { id } = await params
  const body = await readJson(request)
  const record = body && typeof body === "object" ? (body as { passport?: unknown; transfer?: unknown }) : null
  if (!record) return Response.json({ error: "The transfer was not readable." }, { status: 400 })
  const parsed = parsePassport(record.passport)
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })
  if (parsed.value.id !== id.trim().toLowerCase()) {
    return Response.json({ error: "The piece id in the form does not match the address." }, { status: 400 })
  }
  const transfer = parseTransfer(record.transfer)
  if (!transfer.ok) return Response.json({ error: transfer.error }, { status: 400 })
  const eventId = `transfer-${crypto.randomUUID()}`
  const next = recordTransfer(parsed.value, transfer.value, eventId, new Date().toISOString())
  try {
    const passport = await savePassport(next)
    return Response.json({ passport })
  } catch (error) {
    console.error("passport-transfer", error instanceof Error ? error.message : "failed")
    return Response.json({ error: "The transfer was not saved." }, { status: 500 })
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
