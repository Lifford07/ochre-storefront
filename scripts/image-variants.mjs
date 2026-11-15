import { readdirSync, writeFileSync } from "node:fs"

const files = readdirSync("public")
  .filter((name) => name.endsWith("-800.webp"))
  .map((name) => `/${name.replace(/-800\.webp$/, ".webp")}`)
  .sort()

const body = `/** Written by scripts/image-variants.mjs. A phone file is public/<name>-800.webp beside the full file. */
export const scaledArtwork: readonly string[] = ${JSON.stringify(files, null, 2)}
`

writeFileSync("src/config/image-variants.ts", body)
