import { type Passport, parsePassport } from "../lib/passport.ts"

/**
 * Pieces that ship with the repo. The desk at /admin/passports can replace any of these
 * without a code change. Once an id is saved there, that copy is the one the site shows.
 *
 * btc-001 is a draft. The piece is not made. Do not fill the placeholder facts with guesses.
 */
const bitcoinDraft: Passport = {
  id: "btc-001",
  title: "Bitcoin",
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
  statement:
    "A one-of-one gold piece, dedicated to my crypto people. Gold and Bitcoin are the symbols — wealth, and transformation — with a gold heart.",
  dedication: "For my crypto people",
  media: [
    { id: "film", kind: "video", src: "", poster: "", caption: "Making film", placeholder: true },
    { id: "process-1", kind: "photo", src: "", poster: "", caption: "Process", placeholder: true },
    { id: "process-2", kind: "photo", src: "", poster: "", caption: "Process", placeholder: true },
    { id: "process-3", kind: "photo", src: "", poster: "", caption: "Process", placeholder: true },
  ],
  owner: { name: "", public: false },
  events: [
    {
      id: "btc-001-opened",
      kind: "recorded",
      at: null,
      note: "The passport was opened before the piece is made. Dates, materials, dimensions, and the film are still placeholders.",
      placeholder: false,
    },
    { id: "btc-001-made", kind: "made", at: null, note: "Not yet made.", placeholder: true },
    { id: "btc-001-sold", kind: "sold", at: null, note: "Not yet sold.", placeholder: true },
  ],
  updatedAt: "2026-11-09T00:00:00.000Z",
}

function checked(input: Passport): Passport {
  const parsed = parsePassport(input)
  if (!parsed.ok) throw new Error(parsed.error)
  return parsed.value
}

export const seedPassports: Passport[] = [checked(bitcoinDraft)]
