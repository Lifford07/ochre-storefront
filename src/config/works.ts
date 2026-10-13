/**
 * Stand-in works for the house collection.
 * Swap `image` for a real photograph and `artist` for a Superteam artist.
 * Prices on the page come from the catalogue, not from these notes.
 */

export type Motif =
  | "arches"
  | "sweep"
  | "solstice"
  | "moon"
  | "endpaper"
  | "curve"
  | "weave"
  | "tide"
  | "rooms"

export type HouseWork = {
  slug: string
  title: string
  artist: string
  artistSlug: string
  line: "art"
  motif: Motif
  /** Set this to a public path when a real artwork file replaces the drawing. */
  image?: string
  materialId: "real-glass" | "acrylic" | "gallery-bond" | "porcelain" | "card"
  sizeId: string
  editionSize: number
  year: number
  statement: string
}

export type HouseArtist = {
  slug: string
  name: string
  line: string
  example: true
}

export const artists: HouseArtist[] = [
  {
    slug: "example-artist",
    name: "Artist name",
    line: "Painter and printmaker. Warm geometry, arches and sunlight, drawn from West African architecture and South London light.",
    example: true,
  },
]

export const works: HouseWork[] = [
  {
    slug: "three-arches",
    title: "Three Arches",
    artist: "Artist name",
    artistSlug: "example-artist",
    line: "art",
    motif: "arches",
    materialId: "acrylic",
    sizeId: "a3-portrait",
    editionSize: 25,
    year: 2026,
    statement: "Three doorways, three people I come from. The coral is the evening, the gold is the morning after.",
  },
  {
    slug: "sweep-no-4",
    title: "Sweep, No. 4",
    artist: "Artist name",
    artistSlug: "example-artist",
    line: "art",
    motif: "sweep",
    materialId: "gallery-bond",
    sizeId: "50x70-landscape",
    editionSize: 30,
    year: 2026,
    statement: "A single stroke, the way a broom leaves a darker path in dust.",
  },
  {
    slug: "solstice",
    title: "Solstice",
    artist: "Artist name",
    artistSlug: "example-artist",
    line: "art",
    motif: "solstice",
    materialId: "real-glass",
    sizeId: "sq30-square",
    editionSize: 20,
    year: 2026,
    statement: "Rings of the longest day, held under glass.",
  },
  {
    slug: "low-tide-moon",
    title: "Low Tide Moon",
    artist: "Artist name",
    artistSlug: "example-artist",
    line: "art",
    motif: "moon",
    materialId: "real-glass",
    sizeId: "glass-40x60-landscape",
    editionSize: 20,
    year: 2026,
    statement: "The moon sitting on the water after the tide has gone out.",
  },
  {
    slug: "endpaper-study-1",
    title: "Endpaper Study I",
    artist: "Artist name",
    artistSlug: "example-artist",
    line: "art",
    motif: "endpaper",
    materialId: "gallery-bond",
    sizeId: "sq30-square",
    editionSize: 40,
    year: 2026,
    statement: "The lining of the box, printed once as a picture.",
  },
  {
    slug: "harmattan",
    title: "Harmattan",
    artist: "Artist name",
    artistSlug: "example-artist",
    line: "art",
    motif: "curve",
    materialId: "porcelain",
    sizeId: "sq30-square",
    editionSize: 12,
    year: 2026,
    statement: "Dust-light and a low hill. Porcelain, when a studio can fire it.",
  },
  {
    slug: "weave-no-2",
    title: "Weave, No. 2",
    artist: "Artist name",
    artistSlug: "example-artist",
    line: "art",
    motif: "weave",
    materialId: "acrylic",
    sizeId: "a4-portrait",
    editionSize: 25,
    year: 2026,
    statement: "A cloth pattern, flattened into colour.",
  },
  {
    slug: "tide-line",
    title: "Tide Line",
    artist: "Artist name",
    artistSlug: "example-artist",
    line: "art",
    motif: "tide",
    materialId: "acrylic",
    sizeId: "a3-landscape",
    editionSize: 50,
    year: 2026,
    statement: "Where the water stopped. A quiet horizon.",
  },
  {
    slug: "two-rooms",
    title: "Two Rooms",
    artist: "Artist name",
    artistSlug: "example-artist",
    line: "art",
    motif: "rooms",
    materialId: "acrylic",
    sizeId: "a2-landscape",
    editionSize: 15,
    year: 2026,
    statement: "Warm wall, cool wall, and the door between them.",
  },
]

export function workBySlug(slug: string): HouseWork | undefined {
  return works.find((work) => work.slug === slug)
}

export function artistBySlug(slug: string): HouseArtist | undefined {
  return artists.find((artist) => artist.slug === slug)
}

export function worksByArtist(slug: string): HouseWork[] {
  return works.filter((work) => work.artistSlug === slug)
}
