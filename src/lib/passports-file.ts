import { promises as fs } from "node:fs"
import path from "node:path"
import { coercePassports, type Passport } from "./passport.ts"

function filePath() {
  if (process.env.PASSPORTS_FILE) return process.env.PASSPORTS_FILE
  if (process.env.VERCEL) return "/tmp/ochre-passports.json"
  return path.join(process.cwd(), "data", "passports.json")
}

let chain: Promise<unknown> = Promise.resolve()

function locked<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task)
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function readAll(): Promise<Passport[]> {
  try {
    const raw = await fs.readFile(/* turbopackIgnore: true */ filePath(), "utf8")
    return coercePassports(raw)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
}

async function writeAll(items: Passport[]) {
  const target = filePath()
  await fs.mkdir(/* turbopackIgnore: true */ path.dirname(target), { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  await fs.writeFile(/* turbopackIgnore: true */ temporary, JSON.stringify(items, null, 2))
  await fs.rename(/* turbopackIgnore: true */ temporary, target)
}

export function readOverrides() {
  return locked(() => readAll())
}

export function writeOverrides(items: Passport[]) {
  return locked(() => writeAll(items))
}
