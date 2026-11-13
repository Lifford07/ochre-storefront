import assert from "node:assert/strict"
import test from "node:test"
import { basketTotal, editionProblem, MAX_PIECES, pieceCount, readLines } from "./basket-rules.ts"

test("readLines merges the same piece and rejects bad input", () => {
  const got = readLines([
    { slug: "a", materialId: "m", sizeId: "s", qty: 1 },
    { slug: "a", materialId: "m", sizeId: "s", qty: 2 },
    { slug: "b", materialId: "m", sizeId: "s", qty: 1 },
  ])
  assert.ok("lines" in got)
  assert.equal(got.lines.length, 2)
  assert.equal(pieceCount(got.lines), 4)
  assert.ok("error" in readLines([]))
  assert.ok("error" in readLines([{ slug: "a", materialId: "m", sizeId: "s", qty: 0 }]))
  assert.ok("error" in readLines([{ slug: "a", materialId: "m", sizeId: "s", qty: 1.5 }]))
  assert.ok("error" in readLines([{ slug: "a", materialId: "m", sizeId: "s", qty: MAX_PIECES + 1 }]))
})

test("basketTotal adds every unit", () => {
  assert.equal(basketTotal([{ qty: 2, unitPence: 18500 }, { qty: 1, unitPence: 9900 }]), 46900)
})

test("editionProblem counts the same work across lines", () => {
  const work = (slug: string) => (slug === "a" ? { title: "A", editionSize: 3 } : undefined)
  const lines = [
    { slug: "a", materialId: "m1", sizeId: "s", qty: 1 },
    { slug: "a", materialId: "m2", sizeId: "s", qty: 1 },
  ]
  assert.equal(editionProblem(lines, work, { a: 1 }), null)
  assert.match(editionProblem(lines, work, { a: 2 }) ?? "", /Only 1/)
  assert.match(editionProblem(lines, work, { a: 3 }) ?? "", /sold out/)
  assert.match(editionProblem([{ slug: "x", materialId: "m", sizeId: "s", qty: 1 }], work, {}) ?? "", /not in the house/)
})
