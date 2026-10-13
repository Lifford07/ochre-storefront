import assert from "node:assert/strict"
import { test } from "node:test"
import { galleryPence, landedGbp, markupFor, shelfPence } from "./landed-price.ts"

test("A4 acrylic in the UK shelves at £135, the gallery ending at or above 3× landed", () => {
  // 34.99 * 0.86 + £6 packaging + £8 UK ship = 44.0914; × 3 = 132.2742 → £135
  assert.equal(landedGbp(34.99, "UK"), 34.99 * 0.86 + 14)
  assert.equal(shelfPence(34.99, "UK", 3), 13500)
  assert.equal(markupFor("acrylic", false), 3)
  assert.equal(markupFor("acrylic", true), 4)
  assert.equal(markupFor("real-glass", false), 4)
})

test("gallery endings step up to a pound that ends in 5 or 8", () => {
  assert.equal(galleryPence(66), 6800)
  assert.equal(galleryPence(90), 9500)
  assert.equal(galleryPence(125), 12500)
  assert.equal(galleryPence(195), 19500)
})

test("the shelf price stays at or above the markup, and US shipping costs more than UK", () => {
  const landed = landedGbp(45.99, "EU")
  const pence = shelfPence(45.99, "EU", 4)
  assert.ok(pence / 100 >= landed * 4 - 0.001)
  assert.ok(shelfPence(34.99, "US", 3) > shelfPence(34.99, "UK", 3))
})
