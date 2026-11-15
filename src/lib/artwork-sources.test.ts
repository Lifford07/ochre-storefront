import assert from "node:assert/strict"
import test from "node:test"
import { artworkSources } from "./artwork-sources.ts"

test("a listed artwork offers the phone file, and a new file does not invent one", () => {
  const scaled = ["/fela-the-goat.webp"]
  assert.deepEqual(artworkSources("/fela-the-goat.webp", scaled), {
    src: "/fela-the-goat-800.webp",
    srcSet: "/fela-the-goat-800.webp 800w, /fela-the-goat.webp 1200w",
  })
  assert.deepEqual(artworkSources("/new-work.webp", scaled), { src: "/new-work.webp" })
})
