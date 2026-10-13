import { redisClient } from "./redis-client.ts"

const memory = new Map<string, { n: number; reset: number }>()

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || request.headers.get("x-real-ip")?.trim() || "local"
}

function remember(key: string, limit: number, windowSec: number) {
  const now = Date.now()
  const row = memory.get(key)
  if (!row || row.reset < now) {
    memory.set(key, { n: 1, reset: now + windowSec * 1000 })
    return true
  }
  row.n += 1
  return row.n <= limit
}

export async function rateLimit(key: string, limit: number, windowSec: number) {
  const redis = redisClient()
  if (redis) {
    try {
      const name = `ochre:rl:${key}`
      const count = await redis.incr(name)
      if (count === 1) await redis.expire(name, windowSec)
      return count <= limit
    } catch (error) {
      console.error("rate-limit", error instanceof Error ? error.message : "failed")
    }
  }
  return remember(key, limit, windowSec)
}

export function tooMany() {
  return Response.json({ error: "Too many requests. Wait a little, then try again." }, { status: 429 })
}
