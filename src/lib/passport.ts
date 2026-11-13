/**
 * Provenance passports for one-of-one pieces.
 * A passport is a public page at /p/<id>. It is not a token.
 */

export const PASSPORT_LINES = ["art", "home", "garms", "jewellery"] as const
export type PassportLine = (typeof PASSPORT_LINES)[number]

export const PASSPORT_STATUSES = ["draft", "verified"] as const
export type PassportStatus = (typeof PASSPORT_STATUSES)[number]

export const EVENT_KINDS = ["recorded", "made", "sold", "transferred"] as const
export type ProvenanceKind = (typeof EVENT_KINDS)[number]

export const PASSPORT_SITE = "https://ochre-storefront.vercel.app"

const ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/
const EVENT_ID_PATTERN = /^[a-zA-Z0-9-]{1,80}$/
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export type Fact = {
  value: string
  placeholder: boolean
}

export type ProvenanceEvent = {
  id: string
  kind: ProvenanceKind
  at: string | null
  note: string
  placeholder: boolean
}

export type PassportMedium = {
  id: string
  kind: "video" | "photo"
  src: string
  poster: string
  caption: string
  placeholder: boolean
}

export type PassportOwner = {
  /** Empty while the piece is still with the house, or not yet made. */
  name: string
  /** When false, and a name is set, the public page says Private collection. */
  public: boolean
}

export type Passport = {
  id: string
  title: string
  editionNumber: number
  editionSize: number
  line: PassportLine
  status: PassportStatus
  maker: string
  makerName: string
  madeOn: Fact
  techniques: Fact
  materials: Fact
  dimensions: Fact
  statement: string
  dedication: string
  media: PassportMedium[]
  owner: PassportOwner
  events: ProvenanceEvent[]
  updatedAt: string
}

export type TransferInput = {
  name: string
  publicName: boolean
  at: string
  note: string
}

export type ParseOk<T> = { ok: true; value: T }
export type ParseFail = { ok: false; error: string }

export function isPassportId(value: string) {
  return ID_PATTERN.test(value)
}

export function passportPath(id: string) {
  return `/p/${id}`
}

export function passportOriginFrom(header: { get(name: string): string | null } | null) {
  const locked = process.env.PASSPORT_ORIGIN?.trim()
  if (locked) return locked.replace(/\/$/, "")
  const host = header?.get("x-forwarded-host") ?? header?.get("host") ?? ""
  const hostname = host.split(",")[0]?.trim() ?? ""
  if (!hostname) return PASSPORT_SITE
  const protoHeader = header?.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const local = hostname.startsWith("localhost") || hostname.startsWith("127.0.0.1")
  const proto = protoHeader || (local ? "http" : "https")
  return `${proto}://${hostname}`
}

export function passportUrl(id: string, origin: string) {
  return `${origin.replace(/\/$/, "")}${passportPath(id)}`
}

export function passportEditionLabel(number: number, size: number) {
  const figures = String(Math.max(1, Math.round(number))).padStart(3, "0")
  if (size <= 1) return `Edition No. ${figures}`
  return `Edition No. ${figures} of ${size}`
}

export function lineLabel(line: PassportLine) {
  if (line === "home") return "Home"
  if (line === "garms") return "Garms"
  if (line === "jewellery") return "Jewellery"
  return "Art"
}

export function verificationLabel(status: PassportStatus) {
  return status === "verified" ? "Verified Ochré original" : "Draft — not yet verified"
}

export function ownerDetail(passport: Pick<Passport, "owner" | "status">) {
  const name = passport.owner.name.trim()
  if (!name) return passport.status === "draft" ? "Not yet issued" : "Ochré studio"
  if (!passport.owner.public) return "Private collection"
  return name
}

export function factDisplay(fact: Fact, empty: string) {
  if (fact.placeholder || !fact.value.trim()) {
    return { placeholder: true as const, text: `Placeholder — ${empty}` }
  }
  if (isIsoDate(fact.value.trim())) {
    return { placeholder: false as const, text: formatRecordDate(fact.value.trim()) }
  }
  return { placeholder: false as const, text: fact.value.trim() }
}

export function eventLabel(kind: ProvenanceKind) {
  if (kind === "recorded") return "Record opened"
  if (kind === "made") return "Made"
  if (kind === "sold") return "First sold"
  return "Ownership transferred"
}

export function formatRecordDate(value: string | null) {
  if (!value) return "Date not recorded"
  const match = DATE_PATTERN.exec(value)
  if (!match) return "Date not recorded"
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function isIsoDate(value: string) {
  const match = DATE_PATTERN.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

/** Direct film files only. Page URLs stay as links, so the passport does not pull in a player. */
export function videoType(src: string) {
  const path = src.split("?")[0]?.toLowerCase() ?? ""
  if (path.endsWith(".mp4") || path.endsWith(".m4v")) return "video/mp4"
  if (path.endsWith(".webm")) return "video/webm"
  return null
}

export function isSafeMediaUrl(value: string) {
  if (!value) return true
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !value.includes(" ")) return true
  try {
    const url = new URL(value)
    return url.protocol === "https:"
  } catch {
    return false
  }
}

export function blankPassport(id: string, now = new Date().toISOString()): Passport {
  return {
    id,
    title: "",
    editionNumber: 1,
    editionSize: 1,
    line: "art",
    status: "draft",
    maker: "Ochré",
    makerName: "Segun Junaid",
    madeOn: { value: "", placeholder: true },
    techniques: { value: "", placeholder: true },
    materials: { value: "", placeholder: true },
    dimensions: { value: "", placeholder: true },
    statement: "",
    dedication: "",
    media: [
      { id: "film", kind: "video", src: "", poster: "", caption: "Making film", placeholder: true },
      { id: "process-1", kind: "photo", src: "", poster: "", caption: "Process", placeholder: true },
      { id: "process-2", kind: "photo", src: "", poster: "", caption: "Process", placeholder: true },
      { id: "process-3", kind: "photo", src: "", poster: "", caption: "Process", placeholder: true },
    ],
    owner: { name: "", public: false },
    events: [
      {
        id: `${id}-opened`,
        kind: "recorded",
        at: null,
        note: "Passport opened. The piece is not yet made.",
        placeholder: false,
      },
      { id: `${id}-made`, kind: "made", at: null, note: "Not yet made.", placeholder: true },
      { id: `${id}-sold`, kind: "sold", at: null, note: "Not yet sold.", placeholder: true },
    ],
    updatedAt: now,
  }
}

export function recordTransfer(passport: Passport, input: TransferInput, eventId: string, now: string): Passport {
  const name = input.name.trim()
  const alreadySold = passport.events.some((event) => event.kind === "sold" && !event.placeholder)
  const kind: ProvenanceKind = alreadySold ? "transferred" : "sold"
  const holder = input.publicName ? name : "a private collection"
  const note = input.note.trim() || (kind === "sold" ? `First sold to ${holder}.` : `Passed to ${holder}.`)
  const events = passport.events.filter((event) => !(event.placeholder && event.kind === kind))
  events.push({ id: eventId, kind, at: input.at, note, placeholder: false })
  return {
    ...passport,
    owner: { name, public: input.publicName },
    events,
    updatedAt: now,
  }
}

export function mergePassports(seed: Passport[], stored: Passport[]) {
  const map = new Map<string, Passport>()
  for (const item of seed) map.set(item.id, item)
  for (const item of stored) map.set(item.id, item)
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id))
}

export function parsePassport(input: unknown): ParseOk<Passport> | ParseFail {
  const source = asRecord(input)
  if (!source) return fail("The passport was not readable.")

  const id = readString(source, "id", 32, "Piece id")
  if (!id.ok) return id
  if (!isPassportId(id.value)) return fail("The piece id uses lowercase letters, numbers, and hyphens. Example: btc-001.")

  const title = readString(source, "title", 80, "Title")
  if (!title.ok) return title
  if (!title.value) return fail("The piece needs a title.")

  const editionNumber = readCount(source.editionNumber, "Edition number")
  if (!editionNumber.ok) return editionNumber
  const editionSize = readCount(source.editionSize, "Edition size")
  if (!editionSize.ok) return editionSize
  if (editionNumber.value > editionSize.value) return fail("The edition number cannot be higher than the edition size.")

  const line = source.line
  if (!isLine(line)) return fail("Choose Art, Home, Garms, or Jewellery.")
  const status = source.status
  if (status !== "draft" && status !== "verified") return fail("The status is draft or verified.")

  const maker = readString(source, "maker", 40, "Maker")
  if (!maker.ok) return maker
  if (!maker.value) return fail("The maker needs a name.")
  const makerName = readString(source, "makerName", 80, "Maker's name")
  if (!makerName.ok) return makerName
  if (!makerName.value) return fail("The maker's name is missing.")

  const madeOn = readFact(source.madeOn, "Date made")
  if (!madeOn.ok) return madeOn
  const techniques = readFact(source.techniques, "Techniques")
  if (!techniques.ok) return techniques
  const materials = readFact(source.materials, "Materials")
  if (!materials.ok) return materials
  const dimensions = readFact(source.dimensions, "Dimensions")
  if (!dimensions.ok) return dimensions

  const statement = readString(source, "statement", 800, "Statement")
  if (!statement.ok) return statement
  const dedication = readString(source, "dedication", 120, "Dedication")
  if (!dedication.ok) return dedication

  const media = readMedia(source.media)
  if (!media.ok) return media
  const owner = readOwner(source.owner)
  if (!owner.ok) return owner
  const events = readEvents(source.events)
  if (!events.ok) return events

  const updatedRaw = source.updatedAt
  const updatedAt =
    typeof updatedRaw === "string" && Number.isFinite(Date.parse(updatedRaw))
      ? new Date(updatedRaw).toISOString()
      : new Date().toISOString()

  return {
    ok: true,
    value: {
      id: id.value,
      title: title.value,
      editionNumber: editionNumber.value,
      editionSize: editionSize.value,
      line,
      status,
      maker: maker.value,
      makerName: makerName.value,
      madeOn: madeOn.value,
      techniques: techniques.value,
      materials: materials.value,
      dimensions: dimensions.value,
      statement: statement.value,
      dedication: dedication.value,
      media: media.value,
      owner: owner.value,
      events: events.value,
      updatedAt,
    },
  }
}

export function parseTransfer(input: unknown): ParseOk<TransferInput> | ParseFail {
  const source = asRecord(input)
  if (!source) return fail("The transfer was not readable.")
  const name = readString(source, "name", 80, "Holder")
  if (!name.ok) return name
  if (name.value.length < 2) return fail("The holder needs a name, even when the public page keeps it private.")
  if (typeof source.publicName !== "boolean") return fail("Say whether the holder's name may be shown.")
  const at = readString(source, "at", 10, "Transfer date")
  if (!at.ok) return at
  if (!isIsoDate(at.value)) return fail("The transfer needs a date, written YYYY-MM-DD.")
  const note = readString(source, "note", 400, "Note")
  if (!note.ok) return note
  if (!source.publicName && note.value.toLowerCase().includes(name.value.toLowerCase())) {
    return fail("That note names the holder, and the holder is private. The timeline is public.")
  }
  return { ok: true, value: { name: name.value, publicName: source.publicName, at: at.value, note: note.value } }
}

export function coercePassports(value: unknown): Passport[] {
  const list = typeof value === "string" ? parseJson(value) : value
  if (!Array.isArray(list)) return []
  const out: Passport[] = []
  for (const item of list) {
    const parsed = parsePassport(item)
    if (parsed.ok) out.push(parsed.value)
  }
  return out
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

function fail(error: string): ParseFail {
  return { ok: false, error }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function readString(
  source: Record<string, unknown>,
  key: string,
  max: number,
  label: string,
): ParseOk<string> | ParseFail {
  const value = source[key]
  if (typeof value !== "string") return fail(`${label} needs text.`)
  const trimmed = value.trim()
  if (trimmed.length > max) return fail(`${label} is too long.`)
  return { ok: true, value: trimmed }
}

function readCount(value: unknown, label: string): ParseOk<number> | ParseFail {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 9999) {
    return fail(`${label} needs a whole number from 1 to 9999.`)
  }
  return { ok: true, value }
}

function isLine(value: unknown): value is PassportLine {
  return typeof value === "string" && (PASSPORT_LINES as readonly string[]).includes(value)
}

function readFact(value: unknown, label: string): ParseOk<Fact> | ParseFail {
  const source = asRecord(value)
  if (!source) return fail(`${label} is missing.`)
  const text = readString(source, "value", 240, label)
  if (!text.ok) return text
  if (typeof source.placeholder !== "boolean") return fail(`${label} needs a placeholder flag.`)
  if (!source.placeholder && text.value && isDateLabel(label) && !isIsoDate(text.value)) {
    return fail(`${label} uses a date, written YYYY-MM-DD, or stays a placeholder.`)
  }
  return { ok: true, value: { value: text.value, placeholder: source.placeholder || text.value.length === 0 } }
}

function isDateLabel(label: string) {
  return label === "Date made"
}

function readOwner(value: unknown): ParseOk<PassportOwner> | ParseFail {
  const source = asRecord(value)
  if (!source) return fail("The holder is missing.")
  const name = readString(source, "name", 80, "Holder")
  if (!name.ok) return name
  if (typeof source.public !== "boolean") return fail("Say whether the holder's name may be shown.")
  return { ok: true, value: { name: name.value, public: name.value.length > 0 && source.public } }
}

function readMedia(value: unknown): ParseOk<PassportMedium[]> | ParseFail {
  if (!Array.isArray(value)) return fail("The making record is missing.")
  if (value.length > 8) return fail("Keep the making record to eight pictures and one film.")
  const media: PassportMedium[] = []
  const ids = new Set<string>()
  let videos = 0
  for (const item of value) {
    const source = asRecord(item)
    if (!source) return fail("A making record entry was not readable.")
    const id = readString(source, "id", 80, "Media id")
    if (!id.ok) return id
    if (!EVENT_ID_PATTERN.test(id.value) || ids.has(id.value)) return fail("Each picture needs its own id.")
    ids.add(id.value)
    if (source.kind !== "video" && source.kind !== "photo") return fail("A making record entry is a film or a photo.")
    if (source.kind === "video") videos += 1
    const src = readString(source, "src", 500, "Media address")
    if (!src.ok) return src
    const poster = readString(source, "poster", 500, "Poster")
    if (!poster.ok) return poster
    const caption = readString(source, "caption", 120, "Caption")
    if (!caption.ok) return caption
    if (typeof source.placeholder !== "boolean") return fail("Each picture needs a placeholder flag.")
    if (src.value && !isSafeMediaUrl(src.value)) return fail("Pictures and film use an https address, or a path on this site.")
    if (poster.value && !isSafeMediaUrl(poster.value)) return fail("The poster uses an https address, or a path on this site.")
    const placeholder = source.placeholder || src.value.length === 0
    if (!placeholder && !src.value) return fail("A finished picture needs an address, or it stays a placeholder.")
    media.push({
      id: id.value,
      kind: source.kind,
      src: src.value,
      poster: poster.value,
      caption: caption.value || (source.kind === "video" ? "Making film" : "Process"),
      placeholder,
    })
  }
  if (videos > 1) return fail("One making film is enough.")
  return { ok: true, value: media }
}

function readEvents(value: unknown): ParseOk<ProvenanceEvent[]> | ParseFail {
  if (!Array.isArray(value)) return fail("The timeline is missing.")
  if (value.length > 40) return fail("The timeline is too long.")
  const events: ProvenanceEvent[] = []
  const ids = new Set<string>()
  for (const item of value) {
    const source = asRecord(item)
    if (!source) return fail("A timeline line was not readable.")
    const id = readString(source, "id", 80, "Timeline id")
    if (!id.ok) return id
    if (!EVENT_ID_PATTERN.test(id.value) || ids.has(id.value)) return fail("Each timeline line needs its own id.")
    ids.add(id.value)
    if (!isKind(source.kind)) return fail("A timeline line has an unknown kind.")
    const note = readString(source, "note", 400, "Timeline note")
    if (!note.ok) return note
    if (typeof source.placeholder !== "boolean") return fail("Each timeline line needs a placeholder flag.")
    const at = source.at
    if (at !== null && typeof at !== "string") return fail("A timeline date was not readable.")
    if (typeof at === "string" && !isIsoDate(at)) return fail("Timeline dates are written YYYY-MM-DD.")
    events.push({
      id: id.value,
      kind: source.kind,
      at,
      note: note.value,
      placeholder: source.placeholder,
    })
  }
  return { ok: true, value: events }
}

function isKind(value: unknown): value is ProvenanceKind {
  return typeof value === "string" && (EVENT_KINDS as readonly string[]).includes(value)
}
