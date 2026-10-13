import { promises as fs } from "node:fs"
import path from "node:path"
import { editionWording } from "./edition.ts"
import type { StoredOrder } from "./order-types.ts"

function filePath() {
  if (process.env.ORDERS_FILE) return process.env.ORDERS_FILE
  if (process.env.VERCEL) return "/tmp/ochre-orders.json"
  return path.join(process.cwd(), "data", "orders.json")
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

async function readAll(): Promise<StoredOrder[]> {
  try {
    const raw = await fs.readFile(/* turbopackIgnore: true */ filePath(), "utf8")
    const parsed = JSON.parse(raw) as StoredOrder[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
}

async function writeAll(orders: StoredOrder[]) {
  const target = filePath()
  await fs.mkdir(/* turbopackIgnore: true */ path.dirname(target), { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  await fs.writeFile(/* turbopackIgnore: true */ temporary, JSON.stringify(orders, null, 2))
  await fs.rename(/* turbopackIgnore: true */ temporary, target)
}

export function listOrders() {
  return locked(() => readAll())
}

export function getOrder(id: string) {
  return locked(async () => (await readAll()).find((order) => order.id === id) ?? null)
}

export function saveOrder(order: StoredOrder) {
  return locked(async () => {
    const orders = await readAll()
    const index = orders.findIndex((item) => item.id === order.id)
    if (index >= 0) orders[index] = order
    else orders.unshift(order)
    await writeAll(orders)
    return order
  })
}

export function countPaid(slug: string) {
  return locked(async () =>
    (await readAll()).filter((order) => order.artworkSlug === slug && order.status === "paid, awaiting Ochré check").length,
  )
}

export function listUnpaid() {
  return locked(async () => (await readAll()).filter((order) => order.status === "awaiting payment"))
}

/** Edition numbers are taken here, when the payment is accepted, and only then. */
export function markPaid(order: StoredOrder) {
  return locked(async () => {
    const orders = await readAll()
    const index = orders.findIndex((item) => item.id === order.id)
    const previous = index >= 0 ? orders[index] : null
    if (previous?.status === "paid, awaiting Ochré check" && previous.editionNumber != null) {
      return previous
    }
    let next = order
    if (next.artworkSlug && next.editionKind === "drop" && next.editionNumber == null) {
      const taken = orders.filter(
        (item) => item.artworkSlug === next.artworkSlug && item.status === "paid, awaiting Ochré check",
      ).length
      const size = next.editionSize ?? next.editionRun
      const number = taken + 1
      if (number > size) throw new Error("This edition is complete.")
      next = {
        ...next,
        editionNumber: number,
        editionSize: size,
        editionLabel: editionWording("drop", number, size),
      }
    }
    if (index >= 0) orders[index] = next
    else orders.unshift(next)
    await writeAll(orders)
    return next
  })
}

export function deleteOrder(id: string) {
  return locked(async () => {
    await writeAll((await readAll()).filter((order) => order.id !== id))
  })
}
