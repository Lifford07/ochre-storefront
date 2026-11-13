import { promises as fs } from "node:fs"
import path from "node:path"
import type { StoredBasket } from "./order-types.ts"
import { redisClient } from "./redis-client.ts"
import { orderBackend } from "./storage-mode.ts"

/** Baskets live next to orders: Redis in production, a JSON file on a laptop. */

const UNPAID = "ochre:unpaid-baskets"
const key = (id: string) => `ochre:basket:${id}`
const lockKey = (id: string) => `ochre:basket-lock:${id}`

export class BasketStoreError extends Error {
  constructor() {
    super("The order store did not answer.")
    this.name = "BasketStoreError"
  }
}

function redis() {
  if (orderBackend() !== "redis") return null
  const client = redisClient()
  if (!client) throw new Error("Redis is not configured.")
  return client
}

function asBasket(value: unknown): StoredBasket | null {
  if (!value) return null
  if (typeof value === "string") {
    try {
      return asBasket(JSON.parse(value) as unknown)
    } catch {
      return null
    }
  }
  return typeof value === "object" && typeof (value as StoredBasket).id === "string" ? (value as StoredBasket) : null
}

function filePath() {
  if (process.env.BASKETS_FILE) return process.env.BASKETS_FILE
  if (process.env.ORDERS_FILE) return process.env.ORDERS_FILE.replace(/\.json$/, "") + ".baskets.json"
  if (process.env.VERCEL) return "/tmp/ochre-baskets.json"
  return path.join(process.cwd(), "data", "baskets.json")
}

let chain: Promise<unknown> = Promise.resolve()
function locked<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task)
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function readAll(): Promise<StoredBasket[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(/* turbopackIgnore: true */ filePath(), "utf8")) as StoredBasket[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
}

async function writeAll(baskets: StoredBasket[]) {
  const target = filePath()
  await fs.mkdir(/* turbopackIgnore: true */ path.dirname(target), { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  await fs.writeFile(/* turbopackIgnore: true */ temporary, JSON.stringify(baskets, null, 2))
  await fs.rename(/* turbopackIgnore: true */ temporary, target)
}

async function guard<T>(task: () => Promise<T>): Promise<T> {
  try {
    return await task()
  } catch (error) {
    console.error("basket-store", error instanceof Error ? error.message : "failed")
    throw new BasketStoreError()
  }
}

export function getBasket(id: string) {
  return guard(async () => {
    const client = redis()
    if (client) return asBasket(await client.get(key(id)))
    return locked(async () => (await readAll()).find((basket) => basket.id === id) ?? null)
  })
}

export function saveBasket(basket: StoredBasket) {
  return guard(async () => {
    const client = redis()
    if (client) {
      const pipe = client.pipeline()
      pipe.set(key(basket.id), basket)
      if (basket.status === "awaiting payment") pipe.sadd(UNPAID, basket.id)
      else pipe.srem(UNPAID, basket.id)
      await pipe.exec()
      return basket
    }
    return locked(async () => {
      const all = await readAll()
      const index = all.findIndex((item) => item.id === basket.id)
      if (index >= 0) all[index] = basket
      else all.unshift(basket)
      await writeAll(all)
      return basket
    })
  })
}

export function listUnpaidBaskets() {
  return guard(async () => {
    const client = redis()
    if (client) {
      const ids = await client.smembers<string[]>(UNPAID)
      if (!ids.length) return []
      const values = await client.mget<unknown[]>(...ids.map(key))
      return values.map(asBasket).filter((basket): basket is StoredBasket => basket?.status === "awaiting payment")
    }
    return locked(async () => (await readAll()).filter((basket) => basket.status === "awaiting payment"))
  })
}

/**
 * Only one settle may run for a basket at a time, so two callers (the webhook and the
 * return page, say) cannot number the same pieces twice. The lock expires on its own.
 */
export async function claimSettle(id: string): Promise<boolean> {
  const client = redis()
  if (!client) return true
  const got = await client.set(lockKey(id), "1", { nx: true, ex: 120 })
  return got === "OK"
}

export async function releaseSettle(id: string) {
  const client = redis()
  if (client) await client.del(lockKey(id))
}
