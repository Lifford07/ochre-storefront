# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Collectors and commissioners who come to Ochré to look before they buy. They are choosing a made-to-order object from a luxury art house: a numbered edition on the wall, or their own image made into glass, acrylic, or canvas. They are often on a phone, in a quiet moment, and they need to see the work large, read what it is, and only then decide to collect or commission.

## Product Purpose

Ochré is one house with four lines: Art, Home, Garms, and Jewellery. The live line is Art. A visitor can walk the house collection, open a work, choose a material and a size, and collect a numbered edition, or begin at `/make` with their own image. Success is a storefront that feels like an exhibition and still completes the same order the editor, basket, and certificate already know how to make.

## Positioning

The niche is heritage, text, and gold. House of Junaid: Yoruba and Nigerian royal lineage, the Benin coral-bead crown, gold. The objects are verre églomisé glass gilding, resin, and canvas, made to order in numbered editions with a certificate. The site should feel like walking through that exhibition. It is not a general print shop and not a crypto product page.

## Operating Context

The studio is in Birmingham. The customer-facing prototype in this repository is the storefront, the `/make` editor, the basket, checkout, and the certificate. Shopify remains the planned till for the first public shop, as written in `SCOPE.md`. This site does not replace that plan and does not move commerce into a new architecture. USDC on Solana exists on the editor prototype for a named demo. It stays off the tone of the gallery: no token, no crypto-first homepage.

## Capabilities and Constraints

- Keep the crest, the OCHRÉ wordmark, the navy / porcelain / gold palette, the routes, `/make`, the basket, certificates, and the product data in `src/config`.
- Gallery pages (`/`, `/collection`, `/artists`, and a work at `/collection/[slug]`) are exhibition rooms. Commerce controls stay on the page, outside any image modal.
- A closer look at a work uses a lightbox with zoom and a museum caption. No download button and no share button.
- Smooth scrolling, where it is used, is only on those gallery routes, and it is off when the visitor asks for reduced motion. Cart, editor, checkout, and open modals keep native scrolling.
- Do not redraw the crest or the wordmark. Do not invent edition counts, prices, printers, or certificates.
- Impeccable Live Mode Apply must not fall back to a CLI with approvals and the sandbox disabled. The project launchers default `IMPECCABLE_LIVE_COPY_AGENT` to `chat`. `off` is the other acceptable value. Do not set it to a subprocess.
- The design hook that ships with the skill runs the Impeccable detector. It does not grant a permission bypass. Review it again after any `impeccable update`.

## Brand Commitments

Quiet luxury. Generous whitespace. Large imagery. Elegant serif for titles. Gold is a restrained accent, a hairline or a small caps label, never a shiny control. Motion is slow and it yields to `prefers-reduced-motion`. Captions follow a museum wall label: title, year, medium, dimensions, edition.

Voice is plain and specific. The house already says "numbered", "certificate", "real glass", "acrylic glass", and "canvas". Keep those words. Do not add hype, and do not describe a studio that is not making the piece.

Three-word personality: **quiet, exact, ceremonial**.

## Evidence on Hand

- `SCOPE.md` is the launch decision. Shopify plus the editor is the shop. This repository is the prototype, not a migration.
- `src/config/works.ts` and `src/config/catalogue.ts` are the works, materials, sizes, and prices.
- `src/app/globals.css` holds the palette: porcelain `#f5f1ea`, navy `#0b1332`, gold `#c6b849`, foil `#ddd08f`, gold ink `#746624`.
- The crest and wordmark live in `src/components/brand/mark.tsx`.
- House works with photographs: Fela the Goat, Fingerprint of God (Arabic and Christian editions), Curious Cat. Other collection rows are labelled example works.
- `DESIGN.md` records the visual system those pages must stay inside.

## Product Principles

1. **The work is the room.** A page opens on the object, large, with air around it. Chrome, price, and process come after the eye has settled.
2. **The label tells the truth.** Title, year, medium, dimensions, and edition are visible without opening a modal or guessing from a button.
3. **Gold is metal in the work, not chrome on the page.** Use it the way a frame uses a fillet: thin, rare, and never animated to look expensive.
4. **Looking and buying are different gestures.** Inspecting gilding, resin, or a detail does not sit on top of Collect, the basket, or checkout.
5. **The shop underneath does not move.** Routes, editor, basket, certificates, and catalogue data stay the system of record.

## Accessibility & Inclusion

WCAG 2.1 AA is the floor. Keyboard users can reach every control, including the closer look, and see a focus ring. The lightbox traps focus and closes with Escape. `prefers-reduced-motion` removes smooth scrolling and decorative motion. Touch targets stay at least 44px. Captions are text, not text baked into the image.
