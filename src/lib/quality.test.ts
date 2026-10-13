import assert from "node:assert/strict"
import { test } from "node:test"
import { bandForDpi, dpiNeedle, isGallerySharp, preferredSizeId, scorePrint, verdictFor } from "./quality.ts"

const wide = 2000
const tall = 2800

test("bands: too small under 150, good to 299, perfect from 300", () => {
  assert.equal(bandForDpi(149.9), "red")
  assert.equal(bandForDpi(150), "amber")
  assert.equal(bandForDpi(299.9), "amber")
  assert.equal(bandForDpi(300), "green")
  assert.equal(verdictFor("red"), "Too small")
  assert.equal(verdictFor("amber"), "Good")
  assert.equal(verdictFor("green"), "Perfect")
  assert.equal(isGallerySharp(299.9), false)
  assert.equal(isGallerySharp(300), true)
})

test("needle: 0, 150, 300, and 600+", () => {
  assert.equal(dpiNeedle(0), 0)
  assert.ok(Math.abs(dpiNeedle(150) - 0.25) < 0.001)
  assert.ok(Math.abs(dpiNeedle(300) - 0.6) < 0.001)
  assert.equal(dpiNeedle(600), 1)
  assert.equal(dpiNeedle(900), 1)
})

test("a 2000×2800 photo is good at A4 and too small at A2", () => {
  const a4 = scorePrint(wide, tall, 210, 297)
  const a2 = scorePrint(wide, tall, 420, 594)
  assert.ok(a4.dpi > 230 && a4.dpi < 250, `A4 dpi was ${a4.dpi}`)
  assert.equal(a4.band, "amber")
  assert.equal(a4.gallerySharp, false)
  assert.equal(a4.message, "Good at this size.")
  assert.ok(a2.dpi >= 100 && a2.dpi < 150, `A2 dpi was ${a2.dpi}`)
  assert.equal(a2.band, "red")
  assert.equal(a2.message, "This size would print soft.")
})

test("the same photo is perfect on a small print and on a card", () => {
  const small = scorePrint(wide, tall, 130, 180)
  const card = scorePrint(wide, tall, 105, 148)
  assert.equal(small.band, "green")
  assert.equal(small.gallerySharp, true)
  assert.ok(card.dpi >= 300)
  assert.equal(card.gallerySharp, true)
})

test("a soft photo defaults to the smallest size, and a sharp one to the largest green size", () => {
  assert.equal(scorePrint(400, 300, 700, 1000).band, "red")
  assert.equal(scorePrint(400, 300, 130, 180).band, "red")
  assert.equal(
    preferredSizeId([
      { id: "70x100", area: 7000, band: "red" },
      { id: "a4", area: 600, band: "red" },
      { id: "small", area: 234, band: "red" },
    ]),
    "small",
  )
  assert.equal(scorePrint(6000, 8000, 700, 1000).band === "green", false)
  assert.equal(
    preferredSizeId([
      { id: "70x100", area: 7000, band: "amber" },
      { id: "a3", area: 1200, band: "green" },
      { id: "small", area: 234, band: "green" },
    ]),
    "a3",
  )
})

test("width and height DPI agree, because the crop matches the print shape", () => {
  const { cropWidth, cropHeight, dpi } = scorePrint(wide, tall, 300, 300)
  const dpiW = cropWidth / (300 / 25.4)
  const dpiH = cropHeight / (300 / 25.4)
  assert.ok(Math.abs(dpiW - dpiH) < 0.01)
  assert.ok(Math.abs(dpi - dpiW) < 0.01)
  assert.equal(scorePrint(wide, tall, 300, 300).band, "amber")
  assert.equal(scorePrint(wide, tall, 300, 300).gallerySharp, false)
})
