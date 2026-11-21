import assert from "node:assert/strict"
import { test } from "node:test"
import { abortOnce, beginOnce, finishOnce } from "./once.ts"

test("a finished key is not run twice, and an aborted key can run again", async () => {
  const key = `test-${Date.now()}`
  assert.equal(await beginOnce(key), "fresh")
  assert.equal(await beginOnce(key), "busy")
  await abortOnce(key)
  assert.equal(await beginOnce(key), "fresh")
  await finishOnce(key)
  assert.equal(await beginOnce(key), "done")
})
