import { seedPassports } from "../config/passports.ts"
import { mergePassports, type Passport } from "./passport.ts"
import * as fileStore from "./passports-file.ts"
import * as redisStore from "./passports-redis.ts"
import { orderBackend } from "./storage-mode.ts"

function backend() {
  return orderBackend() === "redis" ? redisStore : fileStore
}

/** Live deploys keep desk edits in Redis, the same store as orders. A laptop uses a file. */
export function passportStorage() {
  const storage = orderBackend()
  return {
    storage,
    writable: !(process.env.VERCEL && storage !== "redis"),
  }
}

async function readOverrides() {
  return backend().readOverrides()
}

export async function listPassports(): Promise<Passport[]> {
  try {
    return mergePassports(seedPassports, await readOverrides())
  } catch (error) {
    console.error("passport-store", error instanceof Error ? error.message : "failed")
    return seedPassports
  }
}

export async function getPassport(id: string): Promise<Passport | null> {
  const clean = id.trim().toLowerCase()
  try {
    const stored = await readOverrides()
    const hit = stored.find((item) => item.id === clean)
    if (hit) return hit
  } catch (error) {
    console.error("passport-store", error instanceof Error ? error.message : "failed")
  }
  return seedPassports.find((item) => item.id === clean) ?? null
}

export async function savePassport(passport: Passport) {
  const items = await readOverrides()
  const index = items.findIndex((item) => item.id === passport.id)
  if (index >= 0) items[index] = passport
  else items.unshift(passport)
  await backend().writeOverrides(items)
  return passport
}
