# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Collectors and commissioners, most often on a phone. They look before they buy: a numbered edition on the wall, their own image made into glass, acrylic, or canvas, or a crest they are commissioning. They need the work large, the label readable, and a path to collect that stays fast.

## Product Purpose

Ochré is one house with four lines: Art, Home, Garms, and Jewellery. Art is the shop that is open. Verre églomisé has its own page and is the craft being learned, not a priced catalogue. Jewellery is a crest builder and a commission brief, not a case of finished pieces. Success is a storefront that feels like an exhibition and still completes the same order the editor, basket, and certificate already know how to make, without feeling heavy on a phone.

## Positioning

The niche is heritage, text, and gold. House of Junaid: Yoruba and Nigerian royal lineage, the Benin coral-bead crown, gold. The objects are verre églomisé, resin, and canvas, made to order in numbered editions with a certificate. The site should feel like walking through that exhibition. It is not a general print shop and not a crypto product page.

## Operating Context

The studio is in Birmingham. The customer-facing site is the storefront, the `/make` editor, the basket, checkout, and the certificate. A basket of house works pays once at `/checkout`, by card or USDC. A single piece can still be collected from its page. Shopify remains a planning note in `SCOPE.md`, not a change made here. Crypto wording stays quiet: no token, no NFT line on the homepage.

## Capabilities and Constraints

- Keep the crest, the OCHRÉ wordmark, the navy / porcelain / gold palette, square corners, and the product data in `src/config`.
- Gallery pages (`/`, `/collection`, `/artists`, and a work at `/collection/[slug]`) are exhibition rooms. Commerce controls stay on the page, outside any image modal.
- A closer look uses a lightbox with zoom and a museum caption. No download button and no share button.
- Smooth scrolling, where it is used, is only on those gallery routes. It stays off for reduced motion, for a coarse pointer, and while a dialog is open. Cart, editor, and checkout keep native scrolling.
- Phone images use the `-800.webp` file when one exists. Fonts use `display: swap`.
- Do not redraw the crest or the wordmark. Do not invent edition counts, prices, printers, or certificates.
- Do not add glassmorphism, neon, or gradients other than the gold foil. Effects must not sit on the buy button.
- Impeccable Live Mode Apply must not fall back to a CLI with approvals and the sandbox disabled. The project launchers default `IMPECCABLE_LIVE_COPY_AGENT` to `chat`. `off` is the other acceptable value. Do not set it to a subprocess.
- The design hook that ships with the skill runs the Impeccable detector. It does not grant a permission bypass.

## Brand Commitments

Quiet luxury. Generous whitespace. Large imagery. Bodoni Moda for titles, Inter for reading, Azeret Mono for labels. Gold is a restrained accent, a hairline or a small caps label, never a shiny control. Small text uses `--gold-ink` so it stays readable on porcelain. Motion is slow and it yields to `prefers-reduced-motion`. Captions follow a museum wall label: title, year, medium, dimensions, edition.

Voice is plain and specific. The house already says "numbered", "certificate", "real glass", "acrylic glass", and "canvas". Keep those words.

Three-word personality: **quiet, exact, ceremonial**.

## Evidence on Hand

- `src/config/works.ts` and `src/config/catalogue.ts` are the works, materials, sizes, and prices.
- `src/app/globals.css` holds the palette: porcelain `#f5f1ea`, navy `#0b1332`, gold `#c6b849`, foil `#ddd08f`, gold ink `#746624` (darker than the brand swatch so small type clears the page).
- The crest and wordmark live in `src/components/brand/mark.tsx`.
- House works with photographs: Fela the Goat, Fingerprint of God (Arabic and Christian editions), Curious Cat. Other collection rows are labelled example works.
- `DESIGN.md` records the visual system the gallery pages stay inside.

## Product Principles

1. **The phone is the first screen.** If a change makes the customer path slower or clumsier there, it does not ship.
2. **The work is the room.** A page opens on the object, large, with air around it.
3. **The label tells the truth.** Title, year, medium, dimensions, and edition are visible without opening a modal.
4. **Gold is metal in the work, not chrome on the page.** Thin, rare, and never animated to look expensive.
5. **Looking and buying are different gestures.** Inspecting a work does not sit on top of Collect, the basket, or checkout.
6. **The shop underneath does not move.** Routes, editor, basket, certificates, and catalogue data stay the system of record.

## Accessibility & Inclusion

WCAG 2.1 AA is the floor. Keyboard users can reach every control, including the closer look, and see a focus ring. Touch targets stay at least 44px. `prefers-reduced-motion` removes smooth scrolling and decorative motion. Captions are text, not text baked into the image.
