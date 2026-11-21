import { redisClient } from "./redis-client.ts"

const done = new Set<string>()
const busy = new Set<string>()

export type OnceState = "fresh" | "done" | "busy"

/**
 * One winner per key. Redis keeps it across servers. Without Redis, this process remembers.
 * "done" means a previous attempt finished. "busy" means one is in progress. "fresh" means this caller should do the work.
 */
export async function beginOnce(key: string): Promise<OnceState> {
  const redis = redisClient()
  if (!redis) {
    if (done.has(key)) return "done"
    if (busy.has(key)) return "busy"
    busy.add(key)
    return "fresh"
  }
  if (await redis.get(`ochre:done:${key}`)) return "done"
  const lock = await redis.set(`ochre:lock:${key}`, "1", { nx: true, ex: 60 })
  if (lock !== "OK") return "busy"
  return "fresh"
}

export async function finishOnce(key: string) {
  const redis = redisClient()
  if (!redis) {
    busy.delete(key)
    done.add(key)
    return
  }
  await redis.set(`ochre:done:${key}`, "1", { ex: 60 * 60 * 24 * 45 })
  await redis.del(`ochre:lock:${key}`)
}

export async function abortOnce(key: string) {
  const redis = redisClient()
  if (!redis) {
    busy.delete(key)
    return
  }
  await redis.del(`ochre:lock:${key}`)
}
