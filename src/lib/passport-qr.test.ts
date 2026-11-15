import QRCode from "qrcode"
import assert from "node:assert/strict"
import { test } from "node:test"
import { passportQrPng } from "./passport-qr.ts"

test("a passport QR is a PNG of the public URL", async () => {
  const url = "https://ochre-storefront.vercel.app/p/btc-001"
  const png = await passportQrPng(url)
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a")
  assert.ok(png.length > 500)
  const read = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "H" })
  assert.match(read, /<svg/)
})
