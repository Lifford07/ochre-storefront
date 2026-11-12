import assert from "node:assert/strict"
import test from "node:test"
import type { Size } from "@/config/catalogue"
import { hiddenSizeCount, orientationChoices, sizeFamilies, visibleSizes } from "./size-window.ts"

test("a short size list stays open", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g"]
  assert.deepEqual(visibleSizes(items, 6, false), items)
  assert.equal(hiddenSizeCount(items.length, false), 0)
})

test("a long size list windows, and keeps the chosen size in view", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g", "h", "i"]
  assert.deepEqual(visibleSizes(items, 0, false), ["a", "b", "c", "d", "e", "f"])
  assert.deepEqual(visibleSizes(items, 8, false), ["i", "a", "b", "c", "d", "e"])
  assert.deepEqual(visibleSizes(items, 8, true), items)
  assert.equal(hiddenSizeCount(items.length, false), 3)
  assert.equal(hiddenSizeCount(items.length, true), 0)
})

test("portrait and landscape share one name, and a square does not ask", () => {
  const portrait = size("a4-portrait", "a4", "A4", 210, 297, "portrait")
  const landscape = size("a4-landscape", "a4", "A4", 297, 210, "landscape")
  const squareA = size("sq-portrait", "sq", "30 × 30 cm", 300, 300, "portrait")
  const squareB = size("sq-landscape", "sq", "30 × 30 cm", 300, 300, "landscape")
  const families = sizeFamilies([portrait, landscape, squareA, squareB])
  assert.deepEqual(families.map((family) => family.name), ["A4", "30 × 30 cm"])
  assert.equal(orientationChoices(families[0].sizes).length, 2)
  assert.equal(orientationChoices(families[1].sizes).length, 0)
})

function size(id: string, family: string, name: string, widthMm: number, heightMm: number, orientation: Size["orientation"]): Size {
  return { id, family, name, widthMm, heightMm, orientation, prices: {} }
}
