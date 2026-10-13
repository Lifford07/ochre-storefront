import assert from "node:assert/strict"
import { test } from "node:test"
import { rateFromPyth, usdcFromPence } from "./usdc.ts"

test("pence convert to USDC with a small FX buffer", () => {
  // 106 * 1.27 * 1.015 = 136.6393
  assert.equal(usdcFromPence(10600, 1.27), "136.64")
  // 6.50 * 1.27 * 1.015 = 8.378825
  assert.equal(usdcFromPence(650, 1.27), "8.38")
})

test("half pennies round half up after the buffer", () => {
  assert.equal(usdcFromPence(100, 1), "1.02")
  assert.equal(usdcFromPence(100, 0.99), "1.00")
})

test("a Pyth GBP price becomes a rate", () => {
  assert.equal(rateFromPyth("127450000", -8), 1.2745)
})
