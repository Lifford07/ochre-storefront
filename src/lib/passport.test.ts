import assert from "node:assert/strict"
import { test } from "node:test"
import { seedPassports } from "../config/passports.ts"
import {
  blankPassport,
  factDisplay,
  mergePassports,
  ownerDetail,
  parsePassport,
  parseTransfer,
  passportEditionLabel,
  passportUrl,
  recordTransfer,
  verificationLabel,
  videoType,
} from "./passport.ts"

const bitcoin = seedPassports[0]
if (!bitcoin) throw new Error("The Bitcoin draft is missing.")

test("one-of-one passports read Edition No. 001", () => {
  assert.equal(passportEditionLabel(1, 1), "Edition No. 001")
  assert.equal(passportEditionLabel(2, 10), "Edition No. 002 of 10")
})

test("the Bitcoin seed is a draft and does not invent facts", () => {
  assert.equal(bitcoin.id, "btc-001")
  assert.equal(bitcoin.status, "draft")
  assert.equal(bitcoin.title, "Bitcoin")
  assert.equal(bitcoin.maker, "Ochré")
  assert.equal(bitcoin.makerName, "Segun Junaid")
  assert.equal(bitcoin.dedication, "For my crypto people")
  assert.equal(factDisplay(bitcoin.madeOn, "not yet recorded").text, "Placeholder — not yet recorded")
  assert.equal(factDisplay(bitcoin.materials, "not yet recorded").placeholder, true)
  assert.equal(factDisplay(bitcoin.dimensions, "not yet recorded").placeholder, true)
  assert.equal(factDisplay(bitcoin.techniques, "not yet recorded").placeholder, true)
  assert.ok(bitcoin.media.every((item) => item.placeholder && item.src === ""))
  assert.equal(bitcoin.owner.name, "")
  assert.equal(ownerDetail(bitcoin), "Not yet issued")
  assert.equal(verificationLabel(bitcoin.status), "Draft — not yet verified")
  assert.doesNotMatch(`${bitcoin.statement} ${bitcoin.dedication}`, /never die|to the moon|guaranteed|invest/i)
})

test("a holder is named only when they opt in", () => {
  assert.equal(ownerDetail({ status: "verified", owner: { name: "", public: false } }), "Ochré studio")
  assert.equal(ownerDetail({ status: "verified", owner: { name: "Ama Owusu", public: false } }), "Private collection")
  assert.equal(ownerDetail({ status: "verified", owner: { name: "Ama Owusu", public: true } }), "Ama Owusu")
  assert.equal(verificationLabel("verified"), "Verified Ochré original")
})

test("a private transfer does not put the name on the public timeline", () => {
  const parsed = parseTransfer({ name: "Ama Owusu", publicName: false, at: "2026-12-01", note: "" })
  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  const next = recordTransfer(bitcoin, parsed.value, "sold-1", "2026-12-01T00:00:00.000Z")
  assert.equal(next.owner.name, "Ama Owusu")
  assert.equal(next.owner.public, false)
  const sold = next.events.find((event) => event.kind === "sold" && !event.placeholder)
  assert.ok(sold)
  assert.equal(sold?.note, "First sold to a private collection.")
  assert.equal(sold?.at, "2026-12-01")
  assert.equal(
    next.events.some((event) => event.placeholder && event.kind === "sold"),
    false,
  )
  assert.doesNotMatch(JSON.stringify(next.events), /Ama Owusu/)
})

test("a later transfer is a transfer, and a public name can be shown", () => {
  const first = parseTransfer({ name: "Ama Owusu", publicName: true, at: "2026-12-01", note: "" })
  const second = parseTransfer({ name: "I. Okonkwo", publicName: true, at: "2027-03-02", note: "Passed by hand." })
  assert.equal(first.ok && second.ok, true)
  if (!first.ok || !second.ok) return
  const sold = recordTransfer(bitcoin, first.value, "sold-1", "2026-12-01T00:00:00.000Z")
  const moved = recordTransfer(sold, second.value, "move-1", "2027-03-02T00:00:00.000Z")
  assert.equal(moved.owner.name, "I. Okonkwo")
  assert.equal(moved.events.filter((event) => event.kind === "sold" && !event.placeholder).length, 1)
  const transfer = moved.events.find((event) => event.kind === "transferred")
  assert.equal(transfer?.note, "Passed by hand.")
  assert.equal(ownerDetail(moved), "I. Okonkwo")
})

test("a private note that names the holder is refused", () => {
  const parsed = parseTransfer({
    name: "Ama Owusu",
    publicName: false,
    at: "2026-12-01",
    note: "Sold to Ama Owusu in Birmingham.",
  })
  assert.equal(parsed.ok, false)
})

test("media addresses stay on https or this site", () => {
  const bad = parsePassport({
    ...bitcoin,
    media: [{ id: "film", kind: "video", src: "javascript:alert(1)", poster: "", caption: "Film", placeholder: false }],
  })
  assert.equal(bad.ok, false)
  const page = parsePassport({
    ...bitcoin,
    media: [
      {
        id: "film",
        kind: "video",
        src: "https://example.com/watch",
        poster: "",
        caption: "Film",
        placeholder: false,
      },
    ],
  })
  assert.equal(page.ok, true)
  assert.equal(videoType("https://example.com/watch"), null)
  assert.equal(videoType("https://example.com/making.mp4"), "video/mp4")
})

test("a saved copy replaces the seed, and a new id can start blank", () => {
  const edited = { ...bitcoin, title: "Bitcoin, gold heart" }
  const merged = mergePassports(seedPassports, [edited])
  assert.equal(merged.find((item) => item.id === "btc-001")?.title, "Bitcoin, gold heart")
  assert.equal(blankPassport("heart-002").status, "draft")
  assert.equal(passportUrl("btc-001", "https://ochre-storefront.vercel.app"), "https://ochre-storefront.vercel.app/p/btc-001")
})
