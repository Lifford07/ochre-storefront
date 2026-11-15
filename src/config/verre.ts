/**
 * Verre églomisé: gold leaf on the back of glass, the signature craft of the house.
 * Every line here is from the plan as it stands. Nothing gilded is offered or priced
 * until it has been made. When a step is done, move `now` to the next one.
 */
export const verre = {
  status: "Being learned",
  plain: "Gold leaf on the back of glass.",
  lede: "The signature technique of the house. SJ is learning it now, in the open.",
  pitch: ["Gold on glass is almost always European.", "Ochré makes it Black, Nigerian and Irish."] as const,
  how: "23 carat loose leaf, laid by water gilding with gelatine size, on the back of the glass.",
  path: [
    { when: "November 2026", what: "Twenty practice panels, filmed", now: true },
    { when: "January 2027", what: "The first gilded Fingerprint of God, and the first gilded crest", now: false },
    { when: "February to March 2027", what: "Gilded originals, by commission only", now: false },
  ],
  series:
    "Cherubim and Seraphim angels, drawn as Black Nigerian. Benin-plaque figures with coral-bead crowns. Gold leaf on a celestial navy ground, with the Ochré O as the halo.",
  ahead: [
    "Commissions for churches, schools, courthouses, salons, retail and private clients",
    "A gilded glass coffee table, after Miriam Ellner",
  ],
  truth: "Nothing gilded is for sale yet, and there are no prices until the first pieces are made. Join the Letter below to be told first.",
}
