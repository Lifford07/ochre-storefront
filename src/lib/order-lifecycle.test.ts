import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { test } from "node:test"
import type { StoredOrder } from "./order-types.ts"
import { getOrder, markPaid, saveOrder } from "./orders-file.ts"
import { ordersAvailable } from "./storage-mode.ts"
import { decidePayment, firstMatchingPayment } from "./settle-order.ts"

const KEYS = [
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "VERCEL",
  "ORDERS_FILE",
] as const

function snapshot() {
  return Object.fromEntries(KEYS.map((key) => [key, process.env[key]])) as Record<string, string | undefined>
}

function restore(saved: Record<string, string | undefined>) {
  for (const key of KEYS) {
    if (saved[key] === undefined) delete process.env[key]
    else process.env[key] = saved[key]
  }
}

function draft(id: string, createdAt: string): StoredOrder {
  return {
    id,
    createdAt,
    status: "awaiting payment",
    materialId: "acrylic",
    materialName: "Acrylic",
    sizeId: "a4-portrait",
    sizeName: "A4 portrait",
    widthMm: 210,
    heightMm: 297,
    pricePence: 13500,
    usdcAmount: "174.00",
    gbpToUsdc: 1.27,
    fxSource: "test",
    editionRun: 2,
    editionLabel: "Edition of 2. Your number is assigned when the payment clears.",
    editionKind: "drop",
    editionSize: 2,
    artworkSlug: "lifecycle-drop",
    email: "ada@example.com",
    fullName: "Ada Lovelace",
    address: "1 Analytical Street",
    city: "Birmingham",
    postcode: "B1 1AA",
    country: "GB",
    dpi: 300,
    rightsLine: "I own or have permission to use this image.",
    rightsAt: createdAt,
    reference: `ref-${id}`,
    recipient: "recipient",
    mint: "mint",
    cluster: "devnet",
    rpc: "",
    memo: id,
    label: "Ochré",
    message: "Acrylic",
    payUrl: "solana:",
  }
}

test("an underpayment does not block a later full payment, and partials add up", () => {
  const underThenFull = decidePayment(
    [
      { signature: "full", failed: false, amount: "8.26", payer: "payer", newer: 2 },
      { signature: "short", failed: false, amount: "1.00", payer: "payer", newer: 1 },
      { signature: "stray", failed: false, amount: null, payer: null, newer: 3 },
    ],
    "8.26",
  )
  assert.equal(underThenFull.settled, true)
  assert.equal(underThenFull.signature, "full")
  assert.equal(underThenFull.overpaid, true)

  const partials = decidePayment(
    [
      { signature: "a", failed: false, amount: "4.00", payer: "payer-a", newer: 1 },
      { signature: "b", failed: false, amount: "4.26", payer: "payer-b", newer: 2 },
    ],
    "8.26",
  )
  assert.equal(partials.settled, true)
  assert.equal(partials.split, true)
  assert.equal(partials.signature, "b")
  assert.equal(partials.overpaid, false)

  const shortOnly = decidePayment([{ signature: "a", failed: false, amount: "1.00", payer: "payer", newer: 1 }], "8.26")
  assert.equal(shortOnly.settled, false)
  assert.equal(shortOnly.partial, true)

  const twice = decidePayment(
    [
      { signature: "one", failed: false, amount: "8.26", payer: "payer", newer: 1 },
      { signature: "two", failed: false, amount: "8.26", payer: "payer", newer: 2 },
    ],
    "8.26",
  )
  assert.equal(twice.settled, true)
  assert.equal(twice.duplicate, true)
  assert.equal(twice.signature, "one")
})

test("an order is created unpaid, confirmed after the tab is gone, and still there after a reread", async () => {
  const saved = snapshot()
  const dir = await mkdtemp(path.join(os.tmpdir(), "ochre-life-"))
  try {
    for (const key of KEYS) delete process.env[key]
    process.env.ORDERS_FILE = path.join(dir, "orders.json")
    assert.equal(ordersAvailable(), true)

    const opened = await saveOrder(draft("OCH-LIFE0001", "2026-10-04T12:00:00.000Z"))
    assert.equal(opened.status, "awaiting payment")
    assert.equal(opened.editionNumber, undefined)

    const hit = firstMatchingPayment([
      { signature: "failed-sig", failed: true, matches: false, payer: null },
      { signature: "stray-sig", failed: false, matches: false, payer: "stray" },
      { signature: "paid-sig", failed: false, matches: true, payer: "payer-wallet" },
    ])
    assert.equal(hit?.signature, "paid-sig")
    assert.equal(hit?.payer, "payer-wallet")

    const paid = await markPaid({
      ...opened,
      status: "paid, awaiting Ochré check",
      signature: hit?.signature,
      payer: hit?.payer ?? undefined,
      paidAt: "2026-10-04T12:10:00.000Z",
    })
    assert.equal(paid.editionNumber, 1)
    assert.equal(paid.editionLabel, "Edition No. 001 of 2")
    assert.equal(paid.payer, "payer-wallet")

    const secondPass = await markPaid({ ...paid, payer: "other-wallet" })
    assert.equal(secondPass.editionNumber, 1)
    assert.equal(secondPass.payer, "payer-wallet")

    const reread = await getOrder("OCH-LIFE0001")
    assert.equal(reread?.status, "paid, awaiting Ochré check")
    assert.equal(reread?.signature, "paid-sig")
    assert.equal(reread?.editionNumber, 1)

    const second = await saveOrder(draft("OCH-LIFE0002", "2026-10-04T12:20:00.000Z"))
    const paidSecond = await markPaid({ ...second, status: "paid, awaiting Ochré check", signature: "sig-2", payer: "payer-2" })
    assert.equal(paidSecond.editionNumber, 2)
    const third = await saveOrder(draft("OCH-LIFE0003", "2026-10-04T12:30:00.000Z"))
    await assert.rejects(
      () => markPaid({ ...third, status: "paid, awaiting Ochré check", signature: "sig-3" }),
      /edition is complete/,
    )

    process.env.VERCEL = "1"
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
    assert.equal(ordersAvailable(), false)
    process.env.KV_REST_API_URL = "https://example.upstash.io"
    process.env.KV_REST_API_TOKEN = "token"
    assert.equal(ordersAvailable(), true)
  } finally {
    restore(saved)
    await rm(dir, { recursive: true, force: true })
  }
})
