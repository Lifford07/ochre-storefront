# Product

<!-- impeccable:product-schema 1 -->

No structured question tool or decision page was available, so facts below that the brief did not state outright are marked inferred. The brief itself is treated as confirmed.

## Platform

web

## Users

Customers on a phone first, then a larger screen. They are commissioning one physical object or buying a numbered edition from the house. (The split between “my own image” and “a house edition” is inferred from the live Art line and the `/make` editor.)

The owner reviews the customer side as a luxury buyer would: it has to feel clean and never clunky.

## Product Purpose

Ochré is a made-to-order luxury art house. A customer brings an image, or chooses a house work, and receives one physical piece: numbered, with a certificate issued with the piece.

Success is a customer path that stays absolutely clean and fast, especially on a phone, without changing what the house sells or how it looks.

## Positioning

One house, four lines: Art, Home, Garms, and Jewellery. The object is made to order rather than pulled from stock. Art is the line a customer can enter today. Home, Garms, and Jewellery are part of the house and are not for sale yet. (Which line is live is inferred from the storefront, which marks the others “soon”.)

## Operating Context

The customer path is the public site: the house front, the collection, a work, the basket, and the editor at `/make` where someone uploads a photograph, chooses a material and a size, and pays. Checkout can be card or USDC. (Payment methods are inferred from the storefront copy and the Solana Pay wiring.)

Internal notes in the repo discuss a future Shopify till. That choice is not settled here. This prototype does not get deployed or reconfigured as part of design refinement.

## Capabilities and Constraints

Confirmed:

- Keep the existing brand look and the existing content. This work is refinement, not a redesign.
- Mobile performance comes first. The customer side must be absolutely clean, fast, and never clunky, especially on phones.
- Effects (including a liquid logo, 3D frames, shaders, and animation) are used sparingly and are dropped if they slow the site.
- Do not merge, do not deploy, and do not change environment variables or Vercel settings.

Inferred from the repo, and left as they are:

- Materials a customer can be offered on Art include real glass, acrylic glass, and canvas. Other materials exist in config and are not all payable.
- House editions are numbered. A customer upload is treated as edition 1/1.
- A certificate of authenticity is part of the physical piece. An on-chain twin is described on the site as not ready.
- Prices in the catalogue are examples until replaced.
- The studio location, printer rules, and VAT handling in `SCOPE.md` are planning notes, not customer-facing claims to invent or extend.

Undecided, and not to be closed by design work:

- Whether the live till stays custom or moves to Shopify.
- When Home, Garms, and Jewellery open.
- Whether crypto stays on the public shop. `SCOPE.md` treats that as a separate legal question.

## Brand Commitments

The name is Ochré (set as OCHRÉ in the wordmark). The four lines are Art, Home, Garms, and Jewellery. The site also uses “Ochré Atelier” and “Garments” for the clothing line; that wording stays unless the owner changes it.

The incumbent look is binding: the crest, the wordmark, the type already in use, and the current palette and layout. Do not replace them with a new visual world.

Voice stays quiet and specific. Do not add claims, testimonials, or slogans that are not already on the site.

## Evidence on Hand

- Storefront copy and pages under `src/app`, especially `/`, `/collection`, `/collection/[slug]`, `/basket`, `/collect/[slug]`, and `/make`.
- House works and stand-in artist copy in `src/config/works.ts`. Example works are marked example.
- Photographs and the certificate image in `public/`.
- Catalogue prices in `src/config/catalogue.ts`, marked as examples.
- Internal decision notes: `README.md`, `SCOPE.md`, `ARCHITECTURE.md`, `DEMO.md`. These are not customer evidence.

Do not invent customers, press, testimonials, or production prices.

## Product Principles

- The phone is the first screen. If a refinement makes the customer path slower or clumsier there, it does not ship.
- Motion and technical effects stay only when they are quiet and cost nothing measurable on a phone.
- The house’s current look and words stay. Refine the craft; do not restyle the brand.
- One job at a time: choose a work or bring an image, then leave with one numbered object.
- Art is the live line. The other lines are visible as part of the house and are not pretended to be for sale.

## Accessibility & Inclusion

The owner requires the customer side to stay usable on a phone: fast, readable, and never clunky, including one-handed use. No separate formal accessibility standard was named. Phone performance and tap comfort outrank decorative motion.
