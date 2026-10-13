import { Redis } from "@upstash/redis"

export type RedisCredentials = { url: string; token: string }

function trimmed(name: string) {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

/** Marketplace Upstash sets KV_*. A direct Upstash integration sets UPSTASH_REDIS_REST_*. */
export function redisCredentials(): RedisCredentials | null {
  const url = trimmed("KV_REST_API_URL") ?? trimmed("UPSTASH_REDIS_REST_URL")
  const token = trimmed("KV_REST_API_TOKEN") ?? trimmed("UPSTASH_REDIS_REST_TOKEN")
  if (!url || !token) return null
  return { url, token }
}

let client: Redis | null = null
let clientKey = ""

export function redisClient(): Redis | null {
  const creds = redisCredentials()
  if (!creds) {
    client = null
    clientKey = ""
    return null
  }
  const key = `${creds.url}\n${creds.token}`
  if (client && clientKey === key) return client
  client = new Redis({ url: creds.url, token: creds.token })
  clientKey = key
  return client
}
