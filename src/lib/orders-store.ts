import * as fileStore from "@/lib/orders-file"
import * as redisStore from "@/lib/orders-redis"
import { orderBackend } from "@/lib/storage-mode"

export type { OrderStatus, StoredOrder } from "@/lib/order-types"

export class OrderStoreError extends Error {
  constructor() {
    super("The order store did not answer.")
    this.name = "OrderStoreError"
  }
}

function backend() {
  return orderBackend() === "redis" ? redisStore : fileStore
}

async function guard<T>(task: () => Promise<T>): Promise<T> {
  try {
    return await task()
  } catch (error) {
    if (error instanceof Error && error.message === "This edition is complete.") throw error
    console.error("order-store", error instanceof Error ? error.message : "failed")
    throw new OrderStoreError()
  }
}

export function listOrders() {
  return guard(() => backend().listOrders())
}

export function getOrder(id: string) {
  return guard(() => backend().getOrder(id))
}

export function saveOrder(order: Parameters<typeof fileStore.saveOrder>[0]) {
  return guard(() => backend().saveOrder(order))
}

export function countPaid(slug: string) {
  return guard(() => backend().countPaid(slug))
}

export function listUnpaid() {
  return guard(() => backend().listUnpaid())
}

export function markPaid(order: Parameters<typeof fileStore.markPaid>[0]) {
  return guard(() => backend().markPaid(order))
}

export function deleteOrder(id: string) {
  return guard(() => backend().deleteOrder(id))
}
