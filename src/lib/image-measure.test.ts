import assert from "node:assert/strict"
import { test } from "node:test"
import { measureImage } from "./image-measure.ts"

test("a PNG header reports its real pixel size", () => {
  const png = new Uint8Array(24)
  png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52])
  png[16] = 0
  png[17] = 0
  png[18] = 1
  png[19] = 0x90
  png[20] = 0
  png[21] = 0
  png[22] = 1
  png[23] = 0x2c
  assert.deepEqual(measureImage(png), { width: 400, height: 300 })
  assert.equal(measureImage(Uint8Array.from([1, 2, 3])), null)
})
