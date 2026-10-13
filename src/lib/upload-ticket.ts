import { promises as fs } from "node:fs"
import path from "node:path"
import { redisClient } from "./redis-client.ts"

const TICKET_TTL_SECONDS = 900
const TICKET_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function ticketKey(token: string) {
  return `ochre:ticket:${token}`
}

function ticketFile() {
  if (process.env.UPLOAD_TICKETS_FILE) return process.env.UPLOAD_TICKETS_FILE
  if (process.env.VERCEL) return "/tmp/ochre-upload-tickets.json"
  return path.join(process.cwd(), "data", "upload-tickets.json")
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

async function readTickets(): Promise<Record<string, number>> {
  try {
    const raw = await fs.readFile(/* turbopackIgnore: true */ ticketFile(), "utf8")
    const parsed = JSON.parse(raw) as Record<string, number>
    const now = Date.now()
    const live: Record<string, number> = {}
    for (const [token, expiry] of Object.entries(parsed)) {
      if (TICKET_ID.test(token) && typeof expiry === "number" && expiry > now) live[token] = expiry
    }
    return live
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {}
    throw error
  }
}

async function writeTickets(tickets: Record<string, number>) {
  const target = ticketFile()
  await fs.mkdir(/* turbopackIgnore: true */ path.dirname(target), { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  await fs.writeFile(/* turbopackIgnore: true */ temporary, JSON.stringify(tickets))
  await fs.rename(/* turbopackIgnore: true */ temporary, target)
}

export async function issueTicket() {
  const token = crypto.randomUUID()
  const redis = redisClient()
  if (redis) {
    await redis.set(ticketKey(token), "1", { ex: TICKET_TTL_SECONDS })
    return token
  }
  await locked(async () => {
    const tickets = await readTickets()
    tickets[token] = Date.now() + TICKET_TTL_SECONDS * 1000
    await writeTickets(tickets)
  })
  return token
}

export async function consumeTicket(token: string) {
  if (!TICKET_ID.test(token)) return false
  const redis = redisClient()
  if (redis) {
    const value = await redis.getdel<string | number>(ticketKey(token))
    return value === "1" || value === 1
  }
  return locked(async () => {
    const tickets = await readTickets()
    const expiry = tickets[token]
    if (!expiry || expiry <= Date.now()) return false
    delete tickets[token]
    await writeTickets(tickets)
    return true
  })
}
