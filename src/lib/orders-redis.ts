import { editionWording } from "./edition.ts"
import type { StoredOrder } from "./order-types.ts"
import { redisClient } from "./redis-client.ts"

const INDEX = "ochre:orders"
const UNPAID = "ochre:unpaid"

function orderKey(id: string) {
  return `ochre:order:${id}`
}

function editionKey(slug: string) {
  return `ochre:edition:${slug}`
}

function client() {
  const redis = redisClient()
  if (!redis) throw new Error("Redis is not configured.")
  return redis
}

function asOrder(value: unknown): StoredOrder | null {
  if (!value) return null
  if (typeof value === "string") {
    try {
      return asOrder(JSON.parse(value) as unknown)
    } catch {
      return null
    }
  }
  if (typeof value === "object" && value !== null && typeof (value as StoredOrder).id === "string") {
    return value as StoredOrder
  }
  return null
}

export async function listOrders() {
  const redis = client()
  const ids = await redis.zrange<string[]>(INDEX, 0, -1, { rev: true })
  if (!ids.length) return []
  const values = await redis.mget<(StoredOrder | string | null)[]>(...ids.map(orderKey))
  return values.map(asOrder).filter((order): order is StoredOrder => order !== null)
}

export async function getOrder(id: string) {
  const value = await client().get<StoredOrder | string>(orderKey(id))
  return asOrder(value)
}

export async function saveOrder(order: StoredOrder) {
  const redis = client()
  const score = Date.parse(order.createdAt)
  const pipe = redis.pipeline()
  pipe.set(orderKey(order.id), order)
  pipe.zadd(INDEX, { score: Number.isFinite(score) ? score : Date.now(), member: order.id })
  if (order.status === "awaiting payment") pipe.sadd(UNPAID, order.id)
  await pipe.exec()
  return order
}

export async function countPaid(slug: string) {
  const value = await client().get<number>(editionKey(slug))
  return Number(value ?? 0)
}

export async function listUnpaid() {
  const redis = client()
  const ids = await redis.smembers<string[]>(UNPAID)
  if (!ids.length) return []
  const values = await redis.mget<(StoredOrder | string | null)[]>(...ids.map(orderKey))
  return values.map(asOrder).filter((order): order is StoredOrder => order?.status === "awaiting payment")
}

export async function markPaid(order: StoredOrder) {
  const redis = client()
  const existing = asOrder(await redis.get<StoredOrder | string>(orderKey(order.id)))
  if (existing?.status === "paid, awaiting Ochré check" && existing.editionNumber != null) return existing
  let next = order
  if (next.artworkSlug && next.editionKind === "drop" && next.editionNumber == null) {
    const size = next.editionSize ?? next.editionRun
    const number = await redis.incr(editionKey(next.artworkSlug))
    if (number > size) throw new Error("This edition is complete.")
    next = {
      ...next,
      editionNumber: number,
      editionSize: size,
      editionLabel: editionWording("drop", number, size),
    }
  }
  const score = Date.parse(next.createdAt)
  const pipe = redis.pipeline()
  pipe.set(orderKey(next.id), next)
  pipe.zadd(INDEX, { score: Number.isFinite(score) ? score : Date.now(), member: next.id })
  pipe.srem(UNPAID, next.id)
  await pipe.exec()
  return next
}
