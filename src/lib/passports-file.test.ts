import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { test } from "node:test"
import { seedPassports } from "../config/passports.ts"
import { readOverrides, writeOverrides } from "./passports-file.ts"

test("the passport file keeps a desk edit and leaves the seed file alone", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "ochre-passports-"))
  const previous = process.env.PASSPORTS_FILE
  process.env.PASSPORTS_FILE = path.join(dir, "passports.json")
  try {
    assert.deepEqual(await readOverrides(), [])
    const bitcoin = seedPassports[0]
    if (!bitcoin) throw new Error("missing seed")
    const edited = { ...bitcoin, materials: { value: "To be written when the leaf is chosen.", placeholder: true } }
    await writeOverrides([edited])
    const stored = await readOverrides()
    assert.equal(stored.length, 1)
    assert.equal(stored[0]?.id, "btc-001")
    assert.equal(stored[0]?.materials.placeholder, true)
    assert.equal(seedPassports[0]?.materials.value, "")
  } finally {
    if (previous === undefined) delete process.env.PASSPORTS_FILE
    else process.env.PASSPORTS_FILE = previous
    await rm(dir, { recursive: true, force: true })
  }
})
