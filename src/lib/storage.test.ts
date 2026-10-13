import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { test } from "node:test"
import { isFileImageRef, isPrivateBlobUrl, saveUploadedFile, sniffImage } from "./order-image.ts"
import { getOrder, listOrders, markPaid, saveOrder } from "./orders-file.ts"
import { imageBackend, orderBackend, ordersAvailable } from "./storage-mode.ts"
import { consumeTicket, issueTicket } from "./upload-ticket.ts"
import type { StoredOrder } from "./order-types.ts"

const STORAGE_KEYS = [
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "BLOB_READ_WRITE_TOKEN",
  "VERCEL",
  "ORDERS_FILE",
  "UPLOAD_TICKETS_FILE",
  "UPLOADS_DIR",
] as const

function snapshotEnv() {
  return Object.fromEntries(STORAGE_KEYS.map((key) => [key, process.env[key]])) as Record<string, string | undefined>
}

function restoreEnv(saved: Record<string, string | undefined>) {
  for (const key of STORAGE_KEYS) {
    if (saved[key] === undefined) delete process.env[key]
    else process.env[key] = saved[key]
  }
}

function clearStorageEnv() {
  for (const key of STORAGE_KEYS) delete process.env[key]
}

function sample(id: string, extra: Partial<StoredOrder> = {}): StoredOrder {
  return {
    id,
    createdAt: "2026-10-04T12:00:00.000Z",
    status: "awaiting payment",
    materialId: "card",
    materialName: "Card",
    sizeId: "a6",
    sizeName: "A6",
    widthMm: 105,
    heightMm: 148,
    pricePence: 800,
    usdcAmount: "10.16",
    gbpToUsdc: 1.27,
    fxSource: "test",
    editionRun: 2,
    editionLabel: "Edition No. 001 of 2",
    editionKind: "drop",
    editionSize: 2,
    artworkSlug: "storage-test-work",
    email: "ada@example.com",
    fullName: "Ada Lovelace",
    address: "1 Analytical Street",
    postcode: "B1 1AA",
    dpi: 300,
    rightsLine: "I own or have permission to use this image.",
    rightsAt: "2026-10-04T12:00:00.000Z",
    reference: "ref",
    recipient: "recipient",
    mint: "mint",
    cluster: "devnet",
    rpc: "https://api.devnet.solana.com",
    memo: id,
    label: "Ochré",
    message: "Card",
    payUrl: "solana:",
    ...extra,
  }
}

test("storage falls back to files and keeps orders and print files", async () => {
  const saved = snapshotEnv()
  const dir = await mkdtemp(path.join(os.tmpdir(), "ochre-storage-"))
  try {
    clearStorageEnv()
    assert.equal(orderBackend(), "file")
    assert.equal(imageBackend(), "file")

    process.env.KV_REST_API_URL = "https://example.upstash.io"
    process.env.KV_REST_API_TOKEN = "token"
    assert.equal(orderBackend(), "redis")
    assert.equal(imageBackend(), "file")
    process.env.BLOB_READ_WRITE_TOKEN = "blob-token"
    assert.equal(imageBackend(), "blob")
    clearStorageEnv()

    process.env.VERCEL = "1"
    assert.equal(orderBackend(), "file")
    assert.equal(ordersAvailable(), false)
    assert.equal(imageBackend(), "unavailable")
    process.env.KV_REST_API_URL = "https://example.upstash.io"
    process.env.KV_REST_API_TOKEN = "token"
    assert.equal(imageBackend(), "unavailable")
    process.env.BLOB_READ_WRITE_TOKEN = "blob-token"
    assert.equal(orderBackend(), "redis")
    assert.equal(ordersAvailable(), true)
    assert.equal(imageBackend(), "blob")
    clearStorageEnv()

    process.env.ORDERS_FILE = path.join(dir, "orders.json")
    process.env.UPLOAD_TICKETS_FILE = path.join(dir, "tickets.json")
    process.env.UPLOADS_DIR = path.join(dir, "uploads")
    const first = await saveOrder(sample("OCH-FILE00001"))
    assert.equal(first.editionNumber, undefined)
    const paid = await markPaid({ ...first, status: "paid, awaiting Ochré check", signature: "sig-1" })
    assert.equal(paid.editionNumber, 1)
    assert.equal(paid.editionLabel, "Edition No. 001 of 2")
    const again = await markPaid({ ...paid, fullName: "Someone else" })
    assert.equal(again.editionNumber, 1)
    assert.equal(again.fullName, "Ada Lovelace")
    const second = await saveOrder(sample("OCH-FILE00002", { createdAt: "2026-10-04T12:05:00.000Z" }))
    const paidSecond = await markPaid({ ...second, status: "paid, awaiting Ochré check", signature: "sig-2" })
    assert.equal(paidSecond.editionNumber, 2)
    const third = await saveOrder(sample("OCH-FILE00003", { createdAt: "2026-10-04T12:06:00.000Z" }))
    await assert.rejects(() => markPaid({ ...third, status: "paid, awaiting Ochré check" }), /edition is complete/)
    const listed = await listOrders()
    assert.deepEqual(listed.map((order) => order.id), ["OCH-FILE00003", "OCH-FILE00002", "OCH-FILE00001"])
    const loaded = await getOrder("OCH-FILE00001")
    assert.equal(loaded?.email, "ada@example.com")
    assert.equal(loaded?.address, "1 Analytical Street")
    assert.equal(loaded?.status, "paid, awaiting Ochré check")

    const ticket = await issueTicket()
    assert.equal(await consumeTicket(ticket), true)
    assert.equal(await consumeTicket(ticket), false)
    assert.equal(await consumeTicket("not-a-ticket"), false)

    const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9])
    assert.equal(sniffImage(jpeg), "image/jpeg")
    assert.equal(sniffImage(Uint8Array.from([1, 2, 3])), null)
    const savedFile = await saveUploadedFile(jpeg)
    assert.equal(isFileImageRef(savedFile.imageUrl), true)
    assert.equal(savedFile.imageStore, "file")
    assert.equal(isPrivateBlobUrl("https://store.private.blob.vercel-storage.com/orders/print-abc.jpg"), true)
    assert.equal(isPrivateBlobUrl("https://store.public.blob.vercel-storage.com/orders/print.jpg"), false)
    assert.equal(isPrivateBlobUrl("https://example.com/orders/print.jpg"), false)
    assert.equal(isPrivateBlobUrl("https://store.private.blob.vercel-storage.com/other/print.jpg"), false)
  } finally {
    restoreEnv(saved)
    await rm(dir, { recursive: true, force: true })
  }
})
