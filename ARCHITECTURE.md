# Ochré — architecture

How the shop fits together, for Seggz. This is the shape of the build. The editor prototype in this repo is the maker screen only. The shop, the till, and the printer queue are not built yet.

Words used here:

- **Database**: a structured filing cabinet. It is good at “give me order 1042” and at stopping two sales taking the same edition number.
- **Object storage**: a private cupboard for the image files. The database stores the label. The cupboard stores the pixels.
- **Webhook**: an automatic message. When a customer pays, Shopify calls our editor and says “order 1042 is paid”.
- **Metafield**: a custom labelled note Shopify lets us stick on an order, so the order screen shows the edition number and the rights tick without a developer logging in.
- **Embed**: the editor sits inside the Shopify product page. The customer does not feel they have left the shop.
- **Endpoint**: an address a program can call. Phase 2 is one of these.

The decision and the costs are in [SCOPE.md](SCOPE.md). The order of work is in [MILESTONES.md](MILESTONES.md).

## The pieces

```text
Customer phone or laptop
        |
        v
Shopify shop  ---- theme pages, basket, checkout, emails, refunds
        |
        |  editor embedded on the product page
        v
Editor app  ---- meter, crop, wall preview, rights tick, QC list, 48h clock
        |
        +---- database (prices, configurations, editions, attestations, jobs)
        +---- file cupboard (original image, cropped print file)
        |
        v
Shopify Payments  ---- cards, Apple Pay, Google Pay, payout to your bank
        |
        v
You, on the QC list
        |
        +---- UK + agreed material --> email pack to Precision Imaging
        +---- everything else agreed --> white-label order at MyPoster
```

Design edits words, colours, the crest, and the wordmark in the Shopify theme. A theme is the shop’s look. A section is one block on a page. The five editor steps stay in the editor app, so a theme change cannot break the DPI maths or the edition counter.

### Shopify (the shop)

- The four lines in the menu: Art, Home, Garms, Jewellery
- Product pages that host the editor
- Basket and checkout
- VAT on UK orders, once your tax settings are in
- Order emails, refunds, the customer’s “where is my order?” mail
- Payments: Shopify Payments (cards, Apple Pay, Google Pay)

You live here day to day.

### Editor app (the part we own)

A small web program with three jobs:

1. **The maker**, on the product page: upload, preview, material, size, Ready, the meter, the two optimise switches, the crop, the wall preview.
2. **The order brain**: when Shopify says an order is paid, attach the edition number, the rights record, and the printer route.
3. **The ops screen**: the QC queue, the 48-hour clock, and a button that prepares the printer email. This screen is for you, not for customers. A simple login, not a second shop.

Hosting is a small rented service, a database, and a file cupboard. Budget about £20–40 a month on top of Shopify. Print files are too big, and the clock has to run overnight, so this cannot be a file sitting inside the theme.

## What the customer’s click does

1. They upload. The file goes to the private cupboard. We read its pixel width and height. We store a fingerprint (a short code computed from the file).
2. They crop, pick a material and a size, and set the two optimise switches. Each change recalculates DPI from the crop and the size. An enlarge replaces the pixel size, then the meter is scored again. We save a **configuration**: a draft of their choices, with a reference code.
3. They tick the rights line. Ready wakes up. If the meter is red (below 150 DPI), they also tick the soft-print line.
4. Ready adds one line to the Shopify basket. The line carries the reference code, the material, the size, and the price. It does not carry the image file inside Shopify.
5. They pay with a card, Apple Pay, or Google Pay. Wallet buttons are not offered before step 3 is saved.
6. Shopify takes the money and emails them. Shopify then sends the editor a webhook.
7. The app checks the reference code, writes the edition number, copies the rights record onto the order (in our database and as Shopify metafields), and creates a printer job in **Needs a look**.
8. You approve. The job waits until 48 hours before the deadline, then shows as **Ready to send**. You send the pack and mark it sent. When a tracking code exists, it goes back onto the Shopify order so the customer gets it.

If they abandon the basket, the draft expires. We do not print it. Unpaid uploads are deleted on a short timer, so we are not keeping strangers’ photos.

## Prices

One price per material and size, stored in pence, with a flag for whether that number is what the customer sees (VAT included) or the amount before VAT. UK consumer shops almost always show the VAT-included number. Shopify still needs the correct VAT setting so the receipt is legal.

The editor reads this table. Prices are not typed into the page. When you change a price, the next customer sees it. Open baskets keep the price from the moment they pressed Ready, so a mid-afternoon price change does not surprise someone already paying.

Postage is a Shopify shipping rate, separate from the object price. You supply the rules: UK, EU, rest of world, and any surcharge for Highlands, islands, Northern Ireland, or BFPO.

## Editions

Numbers are given out in the database at the moment payment is confirmed, in one locked step, so two people paying together cannot both receive “7 of 50”.

- House artwork: you set `edition_size`. The next number is last + 1. At the cap, the product stops selling.
- Customer upload: `edition_size` equals the quantity on that order. Three units become 1 of 3, 2 of 3, and 3 of 3.
- The number is stored on the order line and shown in the metafields. A later certificate can read the same record. The certificate is not required on the first live day. The number on the order is.

A cancelled or fully refunded order returns the number only if you have not yet sent the job. Once it has gone to the printer, the number stays used.

## Rights record

Stored when they tick, and linked to the order when they pay. This is the IP attestation: the customer confirms they own the rights.

| Field | What it is |
| --- | --- |
| Wording | The exact sentence they saw |
| Wording version | A number, so we can change the sentence later without rewriting old orders |
| Ticked at | Date and time |
| Email | The email on the order |
| File fingerprint | The short code of the file they uploaded |
| Configuration | The crop, material, and size that were in front of them |
| Order number | Shopify’s order number, filled in after payment |
| Soft-print tick | Yes or no, and the time, if the meter was red |

Apple Pay never opens until this row exists. A paid webhook with no rights row is held for you and is not sent to a printer.

## Printer jobs, QC, and the clock

Each paid unit is a job.

| Status | Meaning |
| --- | --- |
| Needs a look | Paid, waiting for you |
| On hold | You have emailed the customer. The clock pauses |
| Approved | QC passed, waiting for the submit time |
| Ready to send | Submit time has arrived |
| Sent | File and order sheet have gone to the printer |
| Too soon | The promise is already inside 48 hours. You choose |
| Cancelled | Refunded or withdrawn before send |

**Submit time = deadline − 48 hours.**

The deadline is the dispatch promise: order time plus the lead days you set for that material, unless the customer chose a later date. The clock is a scheduled check in the editor app, every few minutes. It does not depend on you having a tab open.

The send pack for version 1 is:

- A print-ready file of the crop, in the format that printer asked for (Precision Imaging’s public poster spec is a PDF with 3mm bleed and crop marks; their giclée pages also accept JPG and PNG)
- An order sheet: Ochré order number, material, size in millimetres, quantity, finish, card message if any, ship-to name and address, and whether colour or resolution optimise was on
- The printer named by the route below

You press send. It drafts the email to the address on that printer’s account, and the status moves to Sent. MyPoster white-label, until they open the API, is the same idea: the pack is what you place in their account, in Ochré’s sender name.

### Route

```text
material not agreed by any printer  -->  not sold
UK address AND Precision Imaging agreed this material  -->  Precision Imaging
else MyPoster agreed this material  -->  MyPoster
else  -->  not sold
```

UK means the delivery address, not the card’s country. A French card shipping to Birmingham follows the UK column. A Birmingham card shipping to Paris follows MyPoster, for any material MyPoster makes.

The agreed pairs live in a table you can read: material, printer, countries. Changing it does not need a code change. Until porcelain has a row, porcelain has no Ready button.

Starting rows, until you replace them:

| Material | Printer | Countries |
| --- | --- | --- |
| Canvas | Precision Imaging | United Kingdom |
| Canvas | MyPoster | Everywhere else |
| Greeting card | Precision Imaging | United Kingdom, and only if the card matches their folded cotton card |
| Greeting card | MyPoster | Everywhere else, once they confirm the card |
| Glass, acrylic, Gallery Bond | MyPoster | All, unless Precision Imaging agrees in writing |
| Porcelain | none | Not sold |

## Data we keep

| Record | Holds | Who changes it |
| --- | --- | --- |
| Line | Art, Home, Garms, Jewellery | You, rarely |
| Product | Name, which line, on sale or not | You |
| Material | Name, short description, lead days, bleed rule, which printer | You |
| Size | Name, width mm, height mm, which materials allow it | You |
| Price | Material + size, amount in pence, VAT-included flag | You |
| Shipping rule | Zone, price, shown in Shopify | You |
| Work | House artwork or customer upload, pixel size, fingerprint, file location, edition cap | The editor, or you for house pieces |
| Configuration | Crop, material, size, colour-optimise, resolution-optimise, DPI, meter colour, wall choice, rights tick | The customer, until they pay |
| Order | Shopify order number, email, ship-to country, totals, paid at | Shopify, copied to us |
| Order line | Configuration, price paid, edition number, quantity unit | Us, at payment |
| Attestation | The rights fields above | Us, at the tick, linked at payment |
| Printer job | Printer, deadline, submit time, status, sent at | You and the clock |

Customer passwords, if they make an account, stay in Shopify. Card numbers stay with Shopify Payments. We never store a card.

### How long the image stays

Working suggestion, for an accountant to confirm:

- Unpaid uploads: delete after 7 days
- Paid print files: keep until 90 days after dispatch, so a faulty piece can be reprinted, then delete the pixels
- House artworks: keep while the piece is on sale
- The order, the money, the edition number, and the rights record: keep for the VAT record period (often 6 years), without the image

A customer can ask for their photo to be deleted. We can do that and still keep the tax line and the fact that a rights tick existed.

## Phase 2 door (after the shop is live)

One Bankr x402 endpoint, separate from Shopify’s website.

The call, in ordinary language: “Make this image, in this material and size, ship to this address, and I confirm the rights.” The image is a link the agent can fetch, or a file upload if Bankr’s request size allows it. If the file is missing, the material is off sale, the rights flag is not true, or the address is empty, we answer with a failure and do not take payment. Bankr settles when the handler succeeds.

On success we create the same configuration, attestation, and QC job as a human checkout. Payment on that order is recorded as USDC on Base, with the transaction reference Bankr gives us, the dollar amount, and the wallet that paid. The job still waits for you, and still waits for the 48-hour submit time.

The public Shopify site does not link to this address.

Left out of this door on purpose: a token, a Solana payment, a price above what Bankr’s agents will actually pay ($10 per call on their own tools), and any path that prints before QC.

## What we are not building into this shape

- A second copy of checkout, tax, or refunds
- A direct printer API, until a printer gives us one and the volume matches their minimum
- A camera “look at my wall” preview
- Garment or jewellery builders that are not the upload-to-object flow
- Crypto on the customer shop
