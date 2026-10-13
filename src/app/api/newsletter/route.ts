import { redisClient } from "@/lib/redis-client"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/

export async function POST(request: Request) {
  if (!(await rateLimit(`newsletter:${clientIp(request)}`, 5, 600))) return tooMany()
  const { email } = (await request.json().catch(() => ({}))) as { email?: string }
  const clean = String(email ?? "").trim().toLowerCase()
  if (!EMAIL.test(clean) || clean.length > 254) return Response.json({ error: "Please enter a valid email address." }, { status: 400 })
  const redis = redisClient()
  if (!redis) return Response.json({ error: "Sign-up is paused for a moment. Please try again later." }, { status: 503 })
  await redis.set(`newsletter:${clean}`, { email: clean, at: new Date().toISOString(), source: "footer" }, { nx: true })
  await redis.sadd("newsletter:all", clean)
  return Response.json({ ok: true })
}
