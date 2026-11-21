# Unused, or not on the front door

Audit of this checkout on 21 November 2026, plus the private notes supplied with the brief. One recommendation each: surface now, keep hidden, or delete.

`DESIGN.md` and `PRODUCT.md` are not in this repo. The visual rules that were asked for live in `docs/BRAND.md`. `SCOPE.md`, `MILESTONES.md`, and `ARCHITECTURE.md` are the older shop notes.

## On the site, but not the new front door

| What | Where | Recommendation |
| --- | --- | --- |
| Photo-to-object editor | `/make` | Surface now. This is the sellable Art flow. The homepage sends people here as a commission. |
| House collection | `/collection`, `/collection/[slug]` | Surface now. SJ’s numbered works. Example-artist works are filtered out of the grid. |
| Checkout for a house work | `/collect/[slug]`, basket | Surface now. Reached from a work, not from the new nav. Do not delete. |
| Provenance passport | `/p/[id]`, `/admin/passports` | Surface now as the promise. The public page is per piece. The desk stays hidden. |
| Sample certificate | `/orders/preview` | Surface now, from the provenance section. |
| Verre églomisé | `/verre-eglomise` | Keep hidden from the main nav. Linked from the gold-and-glass pairing. Nothing gilded is for sale. |
| Account, orders, saved images | `/account` | Keep hidden in the header. It is the customer’s own record, not a shopfront section. |
| Image guide, shipping, returns, terms, privacy, contact | footer | Surface now, in the footer. |
| Gift cards | `/gift-cards` | Keep hidden. The page already says coming soon and cannot take payment. |
| Phone upload handoff | `/phone/[sessionId]` | Keep hidden. The page tells people the handoff is off. Nothing links to it. |
| Example artist and example works | `/artists/example-artist`, works in `src/config/works.ts` | Keep hidden. Stand-ins. The new nav no longer links them. |
| Old “call it clean sweep” URLs | redirects in `next.config.ts` | Keep hidden. They point at Fela the Goat. Deleting the redirect would break an old link. |
| Endpaper band | `Endband`, `public/endpaper.svg` | Keep hidden on the new homepage. Still used on the collection page. It is not the seraph lattice. |
| Hero room drawing | `src/components/art/hero-room.tsx` | Keep hidden. The homepage no longer uses it. The editor’s wall preview is separate. |
| Newsletter | `NewsletterBand` | Surface now, above the footer. Gift cards still point at it. |
| Solana wallet in the header | `HeaderWallet` | Keep hidden on the homepage, so the phone does not download it before the shop. It remains on the other pages and at checkout. |
| Payment marks | `PaymentStrip` | Surface now, above the footer. Card and USDC stay available. |

## Built, and now marked prototype

| What | Where | Recommendation |
| --- | --- | --- |
| Jewellery gallery, crest builder, commission brief, gold-leaf zoom | `/jewellery`, `/jewellery/design`, `/jewellery/commission`, `/jewellery/pieces/...` | Keep hidden behind the Prototype gate. The crest review is a brief, not a payment. Do not delete the builder. |
| Salon Nº 01 | `/salon` and the homepage block | Surface now as a prototype. No prices, no edition size, no render of a headband. |
| Atelier / Garms | `/atelier` | Surface now as a prototype. No garment exists. |
| Character | `/character` | Surface now as a prototype. The figure is not drawn. |
| Studio | `/studio` | Surface now. Birmingham, and a commission. It is not a second shop. |
| Heritage | `/about` | Surface now. The only public page for the church, Moses Orimolade, and Holy Michael. |

## Checkout and desk, leave alone

| What | Where | Recommendation |
| --- | --- | --- |
| Stripe checkout and webhook | `src/app/api/stripe`, `src/app/api/orders/[id]/stripe` | Keep hidden. Do not break it. |
| Solana Pay transfer | `src/checkout/solanaPay.ts` | Keep hidden. Do not edit it from a visual pass. |
| Orders desk | `/admin/orders` | Keep hidden. |
| Crest option logic | `src/lib/crest`, `CrestCustomiser` | Keep hidden. Do not change the options while branding the shell. |
| Upload, enhance, DPI meter, print file | `src/lib/enhance.ts`, `src/workers`, `/make` | Keep hidden inside the editor. They are the product. |
| Google sign-in | `src/app/api/auth/google` | Keep hidden. Used by the account, when configured. |
| FX route, blob storage, reconcile cron | `src/app/api/fx`, `src/app/api/blob`, `src/app/api/cron` | Keep hidden. Ops, not pages. |
| Order and passport stores | `src/lib/orders-*`, `src/lib/passports-*` | Keep hidden. |

## In the private notes, not built as a shop

| What | Recommendation |
| --- | --- |
| Home line (rugs, room bundles, furniture) | Keep hidden. No priced rug, and no floor piece carrying the Cherub. |
| Workshops, Fingerprints of Peace, Coventry | Keep hidden. Not a page. Do not turn a participant count into public copy without the evidence pack. |
| Garms beyond the atelier prototype (hoodie, embroidery, suppliers) | Keep hidden. The atelier page says the headband is not made. |
| Signet as a paid product | Keep hidden inside the jewellery prototype. |
| OCHRE Café, HQ, Media, Lagos showcase | Keep hidden. Phase 3, and the Lagos plan is not booked. |
| Word Ridges, Two Tongues as objects, The Seal, The Shade, Ex Libris, gilding kit | Keep hidden. The homepage shows `baile` / `ilé` as words, not as a piece, until a native speaker checks them. |
| Open-world / character-glass product, January drops | Keep hidden. The old “Vice” name is a third-party mark and must not be a product name. |
| Collector counts, “165+”, “98% still displayed”, footballers | Keep hidden. Marked claim or open in the operating document. A TODO sits in `src/app/about/page.tsx`. |
| Bankr / x402 agent checkout | Keep hidden. Described in `SCOPE.md`, not built on this storefront. |
| Shopify as the till | Keep hidden. `SCOPE.md` still recommends it. This repo is the custom Next shop. Do not delete the note, and do not rebuild the till in a visual pass. |

## Pictures supplied with the brief, not published

| File | Why it is off the site | Recommendation |
| --- | --- | --- |
| `08_IMG_3124` | A canvas with a third-party cartoon character, and branded bottles in the room. | Keep hidden. Do not put it on a product. |
| `14_IMG_4810` | The portrait wears a third-party sportswear mark. | Keep hidden. |
| `16_IMG_2369` | Another maker’s credit is written on the picture, and the sitter may be a public likeness. | Keep hidden. |

The fingerprint wall, the Junaid canvas, the commissioned portrait, and the three-figure canvas are the proof photos that are published, compressed under `public/home/`.

## Agent files

| What | Recommendation |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md` | Surface now. They point at this audit’s sibling, `docs/BRAND.md`. |
| `.cursorrules` | Surface now. Short pointer at the brand rules. It was not in the repo before. |
| `.claude/`, `.impeccable/`, a workers directory for agents | Keep hidden, because they are not in this checkout. Nothing to delete. |
| `src/workers/decode-raster.worker.ts`, `src/workers/enhance.worker.ts` | Keep hidden. They are the editor, not an agent pack. |

## Delete

Nothing in this pass is recommended for deletion. The unused pieces are either the sellable path, a prototype with a gate, or a note that should stay until Seggz decides.
