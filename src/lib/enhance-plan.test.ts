import assert from "node:assert/strict"
import { test } from "node:test"
import { enhanceFactorFor } from "./enhance-plan.ts"

test("enlarge just enough to reach 150 DPI, and stop if the canvas would be too big", () => {
  assert.equal(enhanceFactorFor(120, 2000, 2800), 2)
  assert.equal(enhanceFactorFor(80, 2000, 2800), 2)
  assert.equal(enhanceFactorFor(70, 1000, 1400), 4)
  assert.equal(enhanceFactorFor(160, 2000, 2800), null)
  assert.equal(enhanceFactorFor(40, 2500, 2500), 2)
  assert.equal(enhanceFactorFor(40, 4000, 4000), null)
})
