/** Words from the redesign preview (content.js). Prices stay in the live catalogue. */

export const house = {
  line: "A heritage house for people who never had a crest.",
  manifesto: "Ochré turns personal and cultural history into pieces people want to own and keep.",
  promise: "One photo becomes one made-to-order piece.",
  quote: "Everything I make is about culture, art and heritage.",
  legal: "Ochre Store Ltd, trading as Ochré · England & Wales · No. 15837574",
  delivered: "100+ numbered pieces delivered",
  countries: "UK · Ireland · Germany · Canada · US",
}

export const pathNames = ["Idea", "Material", "Size", "Preview", "Checkout", "Certificate"] as const

export const pathNotes = [
  "A photograph, a name, a family story. Or a work by SJ.",
  "Real glass, acrylic or canvas.",
  "Every size, with its price beside it.",
  "On the wall at true scale. A meter shows how sharp your photo will print.",
  "One total, with delivery included.",
  "Numbered, with a certificate of authenticity. A digital version if you want one.",
]

export const starts = [
  { line: "art", title: "A photograph", text: "One photo becomes one made-to-order piece. Edition 1/1.", href: "/make", go: "Choose a photo" },
  { line: "art", title: "A work by SJ", text: "Numbered editions, made to order on real glass, acrylic and canvas.", href: "/collection", go: "See the collection" },
  { line: "art", title: "A name", text: "Fingerprint of God, Christian Edition, with your name beneath it.", href: "/collection/fingerprint-of-god-christian", go: "Add your name" },
  { line: "jewellery", title: "A family story", text: "A crest of your own, drawn for the first time.", href: "/commission/jewellery", go: "Send the idea" },
  { line: "home", title: "A room", text: "The Fingerprint clock. The Secret print. The crest headboard.", href: "/commission/home", go: "Send the idea" },
  { line: "garms", title: "Something to wear", text: "Evening shirts with jewellery for buttons. Formal first.", href: "/commission/garms", go: "Send the idea" },
]

export type HouseLine = {
  id: "art" | "jewellery" | "home" | "garms"
  no: string
  name: string
  text: string
  material: string
  href: string
  concepts: [string, string][]
  ask: string
  picks: { label: string; choices: string[]; many?: boolean }[]
  fields?: string[]
  note?: string
}

export const lines: HouseLine[] = [
  {
    id: "art",
    no: "I",
    name: "Art",
    text: "Signature works by SJ, and your own image, made on real glass, acrylic and canvas.",
    material: "Material",
    href: "/collection",
    concepts: [],
    ask: "A photograph, a fingerprint of words, a family story. Say what it is and who it is for.",
    picks: [{ label: "Starting from", choices: ["A photograph", "A name", "A verse", "A family story"] }],
  },
  {
    id: "jewellery",
    no: "II",
    name: "Jewellery",
    text: "Crest signets and pendants in the house marks. A crest of your own, drawn for the first time.",
    material: "Metal",
    href: "/lines/jewellery",
    concepts: [
      ["Crest signet ring", "Builder in progress"],
      ["Crest print", "Builder in progress"],
      ["Gold on glass shield", "From 2027"],
      ["House-mark pendants", "In design"],
    ],
    ask: "A crest begins with what matters to your family. Choose a piece, pick the symbols that belong to you, and say why.",
    picks: [
      { label: "Piece", choices: ["Crest print", "Signet ring", "Pendant", "Not sure yet"] },
      {
        label: "Symbols that matter",
        many: true,
        choices: ["Lion", "Stag", "Eagle", "Oak", "Olive", "Sun", "Benin coral beads", "Adinkra Gye Nyame", "Celtic knot", "Shamrock", "Yoruba crown", "Cross", "Crescent", "Star", "Anvil", "Quill", "Key", "Fingerprint"],
      },
    ],
    fields: ["Initials", "Motto"],
    note: "Signet rings and gilded glass are still being learned, so they are not offered yet. Ideas are read now.",
  },
  {
    id: "home",
    no: "III",
    name: "Home",
    text: "The Fingerprint clock. The Secret print, with its hidden drawer. The crest headboard.",
    material: "Finish",
    href: "/lines/home",
    concepts: [
      ["The Fingerprint clock", "First to come"],
      ["The Secret print", "In design"],
      ["Crest headboard", "In design"],
      ["Ochré TV tray", "In design"],
    ],
    ask: "Say which piece, the room it is for, and what it should carry: a fingerprint, a crest, a colour.",
    picks: [{ label: "Piece", choices: ["The Fingerprint clock", "The Secret print", "Crest headboard", "Ochré TV tray", "Something else"] }],
    note: "Home is in design. Nothing here is on sale yet, and no dates are promised.",
  },
  {
    id: "garms",
    no: "IV",
    name: "Garms",
    text: "Evening shirts with jewellery for buttons. Formal first. The Knot, as a blind deboss.",
    material: "Cloth",
    href: "/lines/garms",
    concepts: [
      ["Jewellery-button evening shirt", "In design"],
      ["Leather tank, Knot deboss", "In design"],
      ["Cherub crest tee", "In design"],
      ["Unisex crest belt", "In design"],
    ],
    ask: "Say which piece, the occasion, and how you would wear it.",
    picks: [{ label: "Piece", choices: ["Jewellery-button evening shirt", "Leather tank, Knot deboss", "Cherub crest tee", "Unisex crest belt", "Something else"] }],
    note: "Garms is in design. Nothing here is on sale yet, and no dates are promised.",
  },
]

export const exhibitions = [
  {
    status: "This week",
    title: "Fingerprint of Peace",
    place: "Foleshill Library, Coventry",
    dates: ["Workshop · 7 November 2026", "Unveiling · 14 November 2026"],
    text: "A free drop-in workshop. Visitors wrote the word peace in their own language to build one giant fingerprint on canvas. It is unveiled on 14 November, and gifted to the city.",
  },
  {
    status: "Next",
    title: "Gold on Glass",
    place: "The atelier",
    dates: ["Practice panels · November 2026", "First gilded works · January 2027"],
    text: "Gold leaf on the back of glass. Twenty practice panels first, then the first gilded Fingerprint of God, and a gilded crest.",
  },
]

export const peaceWords = ["Peace", "Síocháin", "Àlàáfíà", "Paix", "Paz", "Pace", "Frieden", "Amani", "Salaam", "Shalom", "Shanti", "Udo", "Lafiya", "Mir", "Barış", "Heiwa", "Vrede", "Pokój", "Fred", "Rauha", "Heddwch", "Sìth"]

export const founder =
  "Seggz Junaid was born in Hackney, moved to Ireland at about three, and has lived in Britain since 2016. A Black Irish artist, self-taught, with Nigerian and Irish heritage. He signs his work SJ."

export const story = [
  { no: "I", title: "No crest", text: "A Christian Brothers school in Ireland. A crest on the blazer, a crest on the hurling jersey, a coat of arms for every surname in geography class. One boy in the room without one." },
  { no: "II", title: "Heritage, all along", text: "At home there were his father's Benin bronzes, the antiques, the Cherubim and Seraphim church. The heritage was there the whole time. It had never been drawn." },
  { no: "III", title: "Building his own", text: "In 2019 he made an artwork of his favourite artist because none existed. Then prints, a hundred and more. Then a house, for everyone who never had a crest." },
]

export const lexicon: [string, string, string][] = [
  ["B", "Benin bronzes", "His father’s, at home. The long road in the craft leads back to them."],
  ["C", "Cherubim & Seraphim", "The church he grew up in. The cherub and the seraph on the crest come from it."],
  ["C", "Crest", "The thing this house exists to draw."],
  ["E", "Edition", "Every piece is numbered. Your own image is 1/1. A house work reads No. 001 of N."],
  ["É", "Églomisé", "Gold leaf laid on the back of glass. The signature craft, learned in the open."],
  ["F", "Fingerprint", "A fingerprint made of words. The signature work."],
  ["G", "Garms", "The clothing line. Formal first."],
  ["K", "Knot", "The Garms mark. A blind, tonal deboss."],
  ["O", "Ochre", "The earth pigment people have painted with for at least 100,000 years."],
  ["S", "Signet", "A crest you wear. Planned with the Birmingham Jewellery Quarter."],
  ["W", "Whorl", "The O of Ochré, looped like a fingerprint."],
]

export const NAME_KEY = "ochre-buyer-name"
