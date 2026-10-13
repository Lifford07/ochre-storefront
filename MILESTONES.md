# Ochré — milestones

The order of work, for Seggz. “Build days” are focused days of making the shop, not calendar weeks. Waiting on a printer, a logo file, or a solicitor sits outside the count.

A clickable editor prototype is already in this repo. The Shopify shop is not live. The why is in [SCOPE.md](SCOPE.md). The shape is in [ARCHITECTURE.md](ARCHITECTURE.md).

## Milestone 1 — the first live shop

**About 12 build days (range 10–14).**

A stranger can pay for a real object. You can QC it and email the right printer. That is the whole milestone. You can take payment after this. Do not wait for later milestones to open the shop.

A customer can:

- Open the shop on a phone or a laptop and see the four lines
- Upload an image and walk five steps: upload, preview, material, size, one Ready button
- See the quality meter: red below 150 DPI, amber 150–299, green at 300 and above
- Use the colour optimise switch (on by default) and, when the meter is not green, the resolution optimise switch. The meter moves only when the pixels change
- Crop, pick a size, and open a wall preview
- Choose edition 1 of 1, or a limited run such as 1 of 25
- Tick the rights line (and, if the meter is red, the soft-print line), then pay by card, Apple Pay, or Google Pay
- Get a normal order email

You can:

- See the paid order, the edition number, and the rights record
- Approve or hold it
- See when the 48-hour clock says “send”
- Send a print file and an order sheet to Precision Imaging or into a MyPoster white-label order

| Days | Work |
| --- | --- |
| 2 | Shopify shop, theme shell, crest and wordmark placed, four-line menu, delivery and returns pages using your words |
| 3 | Fit the editor into the product page: five steps, crop, mobile, and the live meter (150 / 300). The prototype’s softer meter is replaced |
| 2 | Wall preview, the two optimise switches, prices, basket |
| 2 | Rights tick saved before Apple Pay or Google Pay can open |
| 3 | Edition numbers, QC list, 48-hour clock, printer email pack |

Greeting cards are inside these 12 days if you have supplied one card size, a price, and (for a folded card) a template. If the template is not ready, the wall pieces still launch. The card is then about **2 build days** and does not hold the launch.

On sale at launch: only materials you have priced and a printer has agreed. Porcelain stays off unless both are true. Empty lines get a quiet “coming” page, not a fake product.

Left out on purpose: a printer API, Solana, any token, a camera wall preview, clothes or jewellery that are not this object, crypto on the shop. Discount codes and gift cards can be switched on in Shopify later, without a project.

## Milestone 2 — the rest of the range, and calmer ops

**About 8 build days**, after the shop is live, and only once the missing prices and printer answers exist.

- Any material that was waiting on a yes from Precision Imaging or MyPoster
- House artworks with a fixed edition cap, using images you supply
- A simple edition slip (a PDF you can put in the parcel)
- Tracking codes typed once and sent on through Shopify
- A short rights-complaint note in the ops screen: who wrote, which order, taken off sale or not

## Milestone 3 — printer automation, only when a printer opens the door

**About 5–8 build days. Not scheduled until then.**

MyPoster publishes an API from about **40 orders a day**, by request (firmenservice@myposter.de). Precision Imaging publishes no API. When either gives you a real test login and a written file spec, the “Ready to send” button talks to their computer instead of an email. Until that letter exists, this milestone does not start.

## Phase 2 — an agent can order one piece

**About 4 build days, after milestone 1 is live.** It does not block the shop. If milestone 1 is done in October, this can be demoed before the Superteam UK date around **15 November 2026**. That is a sizing note, not a promise that a grant will be won.

- One Bankr x402 address, docs at [docs.bankr.bot/x402-cloud/overview](https://docs.bankr.bot/x402-cloud/overview/)
- The agent pays **USDC on Base**
- The call must include the image, material, size, ship-to address, and a rights confirmation
- Success creates a normal QC job. You still look. The 48-hour rule still applies
- The demo product is a real small object priced at **$10 or under**, because Bankr’s own agent tools refuse to pay more than $10 per call
- No Solana payment. Bankr’s hosted door settles on Base
- No token, no crypto button on the shop, no public wording until a solicitor has read it

## What Seggz supplies

Items 1–5 block the start of milestone 1. The shop cannot go live without the rest of the launch list.

### Blocks day one

1. **Prices.** For each material and size on day one: the amount the customer pays, and whether that amount includes VAT. Say if you are VAT registered.
2. **Sizes.** Name, width in millimetres, height in millimetres, for each of those materials.
3. **Which material goes to which printer.** Start from the matrix in SCOPE. Replace it with what Precision Imaging will make on a trade account (publicly: canvas and folded greeting cards; not glass, acrylic, Gallery Bond, or porcelain). Confirm you accept UK orders of MyPoster-only materials being made in the EU.
4. **Domain, and the go-ahead to open the Shopify shop** in the business name, with the UK bank account that should receive payouts.
5. **Delivery and returns wording, in your words.** Made-to-order usually refuses change-of-mind returns. Faulty and not-as-described still have to be covered. Someone who knows distance-selling rules should glance at it. Tech will not invent this policy.

### Needed before the shop opens

6. **Brand files from Design, and two or three wall photos** for the room preview: the cherub crest, the OCHRÉ wordmark, and the colours. Plus one image we are allowed to use in testing.
7. **Shopify.** You as the store owner. An email you read. Two-factor login turned on.
8. **Precision Imaging.** A trade conversation at info@precisionimaging.co.uk or 0121 448 6707. What they will make, the file they want, the email that should receive jobs, how they want to be paid by you, and whether plain-pack drop-ship is available on a trade account.
9. **MyPoster white-label account.** Sender name Ochré, invoice to you, the materials they will white-label (glass, acrylic, Gallery Bond, and cards if Precision Imaging’s card is the wrong card), and their lead times. The API is not required.
10. **Lead times.** For each material, “we dispatch within X days”. That number is what the 48-hour clock counts back from. Say whether a customer may pick a later gift date.
11. **Postage.** UK, EU, rest of world, and any Highlands, islands, Northern Ireland, or BFPO exception.
12. **Edition rule.** Confirm: a single piece is 1 of 1, and a limited run (for example 1 of 25) means that many will ever be made, this order being number 1.
13. **Rights sentence.** The draft in SCOPE is ready to approve or rewrite.
14. **QC cover.** Who looks at the queue on a weekday, and the email address the customer gets if we hold an order.
15. **Greeting cards**, if they are in the first shop: size, price, flat or folded, inside-message yes or no, template from Design.
16. **Porcelain.** A printer, or a written “not in v1”.
17. **House artworks**, if any should be on sale at launch: the image, the title, the line, the edition cap. If none, launch with uploads only.

### Phase 2 only

18. A Bankr account and a wallet you control.
19. A demo price at or under $10 that still covers the printer and postage.
20. A solicitor’s yes before any public sentence about USDC.

## How to read the dates

Milestone 1 starts the day items 1–5 are in hand. About twelve build days later, a private preview is real enough to place a test order. Opening to the public waits on items 6–14, because a live shop without a returns line, a postage price, or a printer who expects the email is a shop that takes money it cannot fulfil.

Phase 2 starts only after a real card payment has been refunded in a test, so the order record is trustworthy before an agent pays into it.
