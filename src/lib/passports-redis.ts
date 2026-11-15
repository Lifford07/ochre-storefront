import { coercePassports, type Passport } from "./passport.ts"
import { redisClient } from "./redis-client.ts"

const KEY = "ochre:passports"

function client() {
  const redis = redisClient()
  if (!redis) throw new Error("Redis is not configured.")
  return redis
}

export async function readOverrides() {
  const value = await client().get<unknown>(KEY)
  return coercePassports(value)
}

export async function writeOverrides(items: Passport[]) {
  await client().set(KEY, items)
}
