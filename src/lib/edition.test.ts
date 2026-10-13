import assert from "node:assert/strict"
import { test } from "node:test"
import { editionFigures, editionWording } from "./edition.ts"

test("one-off uploads read Edition 1/1", () => {
  assert.equal(editionWording("upload", 1, 1), "Edition 1/1")
  assert.equal(editionFigures(1, 1), "1 / 1")
})

test("numbered drops read Edition No. 001 of N", () => {
  assert.equal(editionWording("drop", 7, 50), "Edition No. 007 of 50")
  assert.equal(editionFigures(7, 50), "07 / 50")
  assert.equal(editionWording("drop", 1, 25), "Edition No. 001 of 25")
})
