# Ochré — scope

Decision note for Seggz. Plain words. Research checked 25 September 2026. Prices and printer rules move; the contacts below are the ones to re-check before we take a customer’s money.

A clickable prototype of the editor is already in this repo. It is not the shop. It does not take payment. Its quality meter still uses an older, softer scale (green from 150 DPI). The live shop uses the scale in section 2.

Ochré is one house with four lines: **Art, Home, Garms, Jewellery**. The product is the same idea wherever it applies: a customer uploads an image, and Ochré makes one physical object to order. Materials in this scope: glass, acrylic, Gallery Bond, porcelain, and greeting cards. Numbered editions. The studio is in Birmingham. Design owns the cherub crest and the OCHRÉ wordmark. Tech places those files. Tech does not redraw them.

Words used below:

- **DPI** (dots per inch): how tightly the pixels in a photo are packed when printed at a chosen size. The same photo looks sharp small and soft when blown up.
- **API**: a door that lets our shop send an order to another company’s computer, so nobody retypes it.
- **Checkout**: the screen where the customer pays.
- **Headless**: the customer-facing website is built separately from the till that takes the money. Two systems, joined by us.
- **VAT**: UK sales tax.
- **Webhook**: an automatic message. Example: “this order is paid.”

## 1. Recommendation

**Use Shopify for the shop, the till, and the payouts, plus a small editor app we host for the upload-and-preview flow.**

Shopify is the hosted shop: pages, basket, tax, refunds, order emails. The editor is a small program we own, dropped onto the product page, because Shopify does not include a MyPoster-style maker.

In the UK, Shopify Payments can be processed by Stripe (Shopify’s own terms also allow PayPal or Adyen). Cards, Apple Pay, and Google Pay come with it. You work in Shopify’s order screen. You do not get a separate login at stripe.com, and you should not add one: on the Basic plan Shopify charges an extra 2% on top of Stripe if you plug Stripe in yourself.

A custom site (Next.js for the pages, our own database, Stripe as the till) is the other serious option. It is the right shape later if you need a till Shopify cannot do. It is the wrong shape for the first shop. The editor is the same amount of work either way. The extra weeks are the basket, tax, refunds, order emails, and the screen you would live in when a customer asks where their piece is.

A third shape — a custom Next.js site that still uses Shopify only as the till (headless) — costs both bills and takes Design’s page editor away. It is not the first shop.

### What each option costs

Figures from Shopify’s UK price page and Stripe’s UK price page, 25 September 2026. “Build days” means focused days of making the shop, not calendar time waiting on photos or printer replies. The editor prototype already exists, so the Shopify number is the remaining work to a shop that can take money.

| | Shopify + editor app (use this) | Custom Next.js + our own Stripe |
| --- | --- | --- |
| Monthly platform | Shopify Basic **£25** paid monthly, or **£19** if you pay the year up front | No shop-platform fee. Hosting about **£25–60**: the site (Vercel Pro, about £15; the free plan is not for a business), a database, storage for large print files, and order email |
| The editor’s own hosting | About **£20–40** (file storage, a small database, a timer that runs overnight) | Included in the hosting line above |
| Typical fixed bill | **About £45–65 a month**, plus the domain (about £10–15 a year) | **About £25–60 a month**, plus the domain |
| UK card, Apple Pay, Google Pay | **2% + 25p** via Shopify Payments on Basic. On £100 that is £2.25. Wallets use the same rate as the card underneath. No extra wallet fee | **1.5% + 20p** for a standard UK card. On £100 that is £1.70. Wallets are the same rate as the card. Premium UK cards are 2.8% + 20p |
| Cards issued outside the UK | **3.1% + 25p** on Basic (Shopify treats UK–EU as international) | **2.5% + 20p**, or **3.15% + 20p** for some international cards, on Stripe’s published list |
| Plugging your own Stripe into Shopify | Shopify adds **another 2%** on Basic, on top of Stripe. Do not do this | Not relevant |
| Build time to a live shop a customer can pay on | **About 12 build days** (range 10–14), from the prototype already in this repo | **About 28–35 build days**, because we also build the till, tax, refunds, and order emails |
| Who handles VAT, refunds, “where is my order?”, and card-data rules | Shopify. You work in an order screen | We would build that screen, and you would be the person it pages when it breaks |

On about 100 orders a month at £80, Shopify’s higher card rate costs roughly £50–70 more than Stripe, before the £25 plan. Building and minding your own till costs more than that every month in time. Revisit the plan when card sales pass about **£40,000 a month**: Grow is £65 a month and charges 1.7% + 25p. Advanced (£344 a month, 1.5% + 25p) is not a starting plan.

Shopify’s price table also lists a USDC rate (a dollar-pegged token) at the same percentage as cards. Leave that switched off on the public shop. Crypto on the customer site is a separate legal question, in section 7.

### How each option holds the editor

The editor is the product. Both options need the same custom editor:

- Print files are large. A good file can be tens of megabytes. Shopify’s built-in basket upload is about 20MB and will reject files we should accept.
- The quality meter, the crop, and the wall preview are custom drawing on the page. A normal product page cannot do them.
- The “send to the printer 48 hours before the deadline” rule needs a clock that runs when nobody has the admin open. Shopify themes do not run clocks.

So the editor is custom either way. Shopify still wins, because the pages around it (menu, policies, basket, payment, refund, the “we’ve got it” email) already exist.

On Basic, Shopify’s own payment-page customisation is limited. A checkbox drawn inside the payment step is a Plus feature (from about £1,800 a month). We will not buy Plus for one checkbox. The rights tick sits on our Ready step, and the wallet buttons stay closed until it is saved. The tick is stored on the order. That is the checkout rule, placed one step earlier so Apple Pay cannot skip it.

Shopify’s price table says custom apps on Basic have “limited data access”, and Grow has “full”. The editor has to hear “this order was paid”. If Basic blocks that message, the plan moves to Grow (£65 a month). That is a switch, not a rebuild.

## 2. The editor

One path, in this order. Same simplicity as MyPoster. No extra step, no menu of tools.

1. **Upload.** A photo from the phone, or a file. JPG and PNG at minimum. The page shows a plain progress line and a clear error if the file is empty, unreadable, or too large to print. The prototype already accepts a wider set (WEBP, HEIC, TIFF, first page of a PDF, up to about 100MB). Keep that if the printer can take the file we send them.
2. **Preview.** The picture, with the crop. Two switches, both explained in one line:
   - **Colour optimise**, on by default. A slightly richer file for print. Off is for someone who has already colour-edited. It does not promise the screen will match the press. Screens glow. Paper, acrylic, and glass do not.
   - **Resolution optimise**, available when the meter is not green. It enlarges the file and the meter is scored again. The copy says this does not invent detail that was never in the photo.
3. **Material.** Glass, acrylic, Gallery Bond, porcelain, greeting card — only the ones you have priced, and only the ones a printer has agreed to make.
4. **Size.** The sizes you supply. The quality meter updates the moment the size or the crop changes. A **room preview** opens from here: the piece on a wall, scaled so a larger size reads larger in the same room.
5. **Ready.** One button. It stays quiet until there is a file, a material, a size, and the rights tick. Amber and green can continue. Red can continue only after a one-line “I understand this may look soft” tick, so a phone photo is not a dead end and we have a record that they saw the warning.

Mobile uses the same five steps, one on screen at a time, with a thumb-sized Ready button. Desktop can show the preview beside the choices. The steps do not change.

### Quality meter

Computed from the **cropped** pixels and the print size they picked. The unused edges of the file do not count.

- Width DPI = pixels across the crop ÷ print width in inches
- Height DPI = pixels down the crop ÷ print height in inches
- Inches = millimetres ÷ 25.4
- The score is the **lower** of the two. A print is only as sharp as its weaker side

| Colour | DPI | What the customer sees |
| --- | --- | --- |
| Red | Below 150 | Likely soft at this size. Smaller size, or resolution optimise, or the “print it anyway” tick |
| Amber | 150–299 | Acceptable. Fine detail will be softer than a press file |
| Green | 300 and above | Sharp enough for this size |

Worked example: a crop of 3000 × 2000 pixels, printed at 10 × 6.7 inches (about 254 × 170 mm). Width DPI = 3000 ÷ 10 = 300. Height DPI = 2000 ÷ 6.7 ≈ 299. The lower number is about 299, so the meter is amber, just under green. The same crop at 20 × 13.3 inches is about 150 DPI, still amber, on the line. Any size that drops the lower number under 150 is red.

The meter always scores the pixels after a real enlarge. Colour optimise does not move it. A pretend sharpen must not paint the meter green.

### Room preview

Two or three wall photos from Design. We place the piece on the wall in proportion to the chosen size. The customer can drag it. This is our photo of a room, not a view through their camera of their own wall. A camera version is later, not part of the first shop.

### Greeting cards

Cards are a product line, paid the same way as a print. Same five steps. Sizes are card sizes. An optional short message can be stored with the order. Folded cards need a template from Design (front, inside, back). Precision Imaging’s public cards are folded, printed on the outside only, with an envelope.

### Editions, on the same screen

A single piece is **1 of 1**. A limited run is chosen in the editor, for example **1 of 25**: twenty-five will ever be made, and this order is number 1. House artworks use a cap you set. Customer uploads: the quantity they buy is the edition, and they cannot add more later.

## 3. What we store

Each **line** (Art, Home, Garms, Jewellery) is a place in the menu. A **product** sits on a line. A **material** plus a **size** has one **price**. A customer upload, or a house artwork, is a **work**. Their crop, material, size, optimise switches, DPI, and rights tick are one **configuration**. When they pay, that becomes an **order line**, and each physical unit gets an **edition number**.

The field list is in [ARCHITECTURE.md](ARCHITECTURE.md).

**Rights tick.** On the Ready step, unticked by default, stored with the order:

> I confirm I own this image, or I have permission to have it printed as this object.

We store the exact words, a version number (so a later wording change does not rewrite old orders), the time, the customer email, and a fingerprint of the file (a short code from the bytes, so we can show it was this file). The order cannot be paid without it. This is evidence of what they told us. It is not, by itself, a defence if the picture is someone else’s. You still need a way to take a piece down when a rights holder writes in.

Garms and Jewellery, in this scope, are lines the print-object can be filed under. Clothes or jewellery that are not “an image, made into an object” are not in the first shop.

## 4. Fulfilment

### Precision Imaging (UK)

Independent printer and framer, Unit 2, Clonmel Road Business Park, Stirchley, Birmingham, B30 2BU. info@precisionimaging.co.uk, 0121 448 6707. Hahnemühle Gold certified giclée studio. They say they can drop-ship in plain packaging inside the UK.

Publicly on sale at their own site, checked 25 September 2026:

- Stretched canvas, including custom sizes by email or phone
- Folded fine-art greeting cards on 300gsm cotton, sizes 14cm square, A5, and A6, printed on the outside, envelope included
- Giclée papers and framing

**No partner API is published.** Their own product pages have an upload for their customers. A trade order is email or phone unless they agree something better when you open an account. One of their canvas offers caps an upload at 20MB, so the file we send them has to match what they will actually accept.

They do not publicly offer acrylic photo prints, real-glass photo prints, Gallery Bond, or porcelain.

### MyPoster (EU and rest of world, and some UK materials)

Photo printer with a free **white-label** service: from the first order, they can ship in your name, and the invoice comes to you. Set up inside a MyPoster business account. Public contact on their white-label pages: firmenservice@myposter.de, +49 8131 380 30 62.

**An API exists** (a computer-to-computer order feed, in the data formats JSON or YAML, including production status) **from 40 orders a day** on the white-label sales page. Their help centre also says “more than 30 a day”. Either way, Ochré will not be there at launch. Below that volume they expect you to use the account. Ask for an English-language trade contact when you open it.

Their product pages offer acrylic (including a fine-art version), real glass, Gallery Bond (a print behind acrylic, backed with an aluminium panel; one of their pages describes a 12-colour print), canvas, and posters. Their business-customer pages also mention cards. **Porcelain is not on their product list.**

### Routing rule

Country alone is the wrong switch, because the Birmingham studio does not publicly make every material.

1. If no printer has agreed to make that material, it is not on sale.
2. UK delivery address, and Precision Imaging has agreed that material: send the job there. On today’s public pages that is canvas, and greeting cards if your card matches their folded cotton card.
3. Otherwise, if MyPoster has agreed that material: send the job to MyPoster. That includes a UK customer buying glass, acrylic, or Gallery Bond, unless Precision Imaging agrees in writing to make them. The customer can be in Birmingham and the object still made in the EU. You should decide that is acceptable before it is written on the product page.
4. Porcelain stays off sale until you name a printer.

Draft matrix, to be replaced by your answers:

| Material | UK address | EU and rest of world |
| --- | --- | --- |
| Canvas | Precision Imaging | MyPoster |
| Greeting cards | Precision Imaging, if the card matches their folded cotton card. Otherwise MyPoster | MyPoster, once they confirm the card |
| Glass, acrylic, Gallery Bond | MyPoster, unless Precision Imaging agrees in writing | MyPoster |
| Porcelain | Off sale | Off sale |

### QC, then the 48-hour rule

**QC** (quality check) means a person looks before money turns into a print.

Paid orders land in a queue called **Needs a look**. You (or whoever you name) see the crop, the meter, the material, the size, the card message, and the rights record. You approve, or you hold and email the customer.

**Deadline** means the date you have promised. The safer promise is “we hand it to the courier by”, because “it arrives by” depends on the courier.

**Submit time = deadline minus 48 hours.** The job is not sent to the printer before that moment, so a customer can still change or cancel, and so you are not printing days early. It is not sent after that moment either, or the promise slips.

- QC has to be done before the submit time. If it is not, you get an alert.
- If the promise is already inside 48 hours when they pay, the order is flagged **too soon**. You send it as soon as QC passes, or you tell the customer a later date. The shop must not offer a date it cannot hit.
- If the customer did not pick a date, the deadline is order time plus the lead time you set for that material. A 7-day dispatch promise sends the file on day 5, after QC.

Version 1 sending is a person, or a button that drafts the email: a print-ready file plus an order sheet, then the order is marked sent. We do not pretend there is an API.

## 5. Payments

**Cards, when the Shopify shop is the till.** Shopify Payments on the Basic plan, processed in the UK under Shopify’s terms, which name Stripe as one of the processors. Cards, Apple Pay, and Google Pay. No separate wallet fee. The customer never types a card number into an Ochré server. Shopify is certified for the card-industry rules (called PCI). Payouts land in the UK bank account you connect.

**USDC on Solana is already a real payment option on the editor prototype.** Added for the Colosseum Crypto World’s Fair (Solana; final submission 12 October 2026, 23:59 Pacific) and a live Solana demo before the Superteam UK agentic grant and Breakpoint London (15–17 November 2026). The customer finishes the editor, ticks the rights line, and chooses **Pay with USDC (Solana)**. The prototype builds a Solana Pay transfer for the USDC token, shows a QR code for Phantom or Solflare, and a Connect wallet button on the computer. It waits until the transfer is on the network, then records the order as **paid, awaiting Ochré check**, with the transaction signature and a Solscan link. Devnet is the default. Mainnet is a setting (the network address, the public receive wallet, and the USDC token address). No private key is stored in the project. How to run it is in [DEMO.md](DEMO.md).

Base USDC, through Shopify or the Bankr door in section 7, is still the planned path for the agent grant on Base. Solana Pay does not replace that plan. There is still no Ochré token.

Greeting cards are a product you sell, not a way to pay.

The rights tick is on Ready, and the wallet buttons stay hidden until it is ticked and saved. Apple Pay and Google Pay can skip a normal checkout page, which is why the tick cannot live only on the payment screen unless you buy Shopify Plus.

## 6. What the first live shop includes

A customer can open the site, pick a line, upload an image, walk the five steps, see the meter and the wall, tick the rights line, pay with a card or a wallet, and receive an order email. You can see the order, the edition number, and the rights record, QC it, and send a file to the right printer when the 48-hour clock says so. The day count is in [MILESTONES.md](MILESTONES.md).

## 7. Phase 2 — an agent can order one piece

After the shop is live. A thin extra door, for grant demos (Superteam UK’s agent work, deadline around 15 November 2026, and Base grants). It is not on the public Birmingham shop.

**x402** is a web rule: the caller asks, the server answers “payment required”, the caller pays, then the request goes through. **Bankr x402 Cloud** hosts that door. You write a small function. Bankr wraps the payment. Docs: [docs.bankr.bot/x402-cloud/overview](https://docs.bankr.bot/x402-cloud/overview/). The address looks like `https://x402.bankr.bot/<your-wallet>/<service-name>`.

What those docs support today:

- Payment settles on **Base** (a low-fee shared ledger in the Coinbase family), in **USDC** (a token that aims to stay worth one US dollar) or another Base token you name.
- First 1,000 paid requests each month: no platform fee. After that, 5%. The money goes to the wallet you connect.
- **This Bankr door settles on Base, not Solana.** Bankr can hold and trade on Solana. Their hosted x402 door, in the current docs, settles on Base. Solana USDC for a person buying a piece is the separate Solana Pay checkout in section 5, already in the prototype. The agent demo on this door stays on Base.
- Bankr’s own agent tools will not pay more than **$10 per request**. A full-price wall piece cannot be bought in one of those calls. For the demo, price one small real object (a card, or a small print) at **$10 or under**, at a price that still covers the printer. Confirm the seller-side maximum with Bankr before anyone promises a full-price agent purchase.
- The call creates a normal Ochré order in the same QC queue, with ship-to address, material, size, image, and the rights confirmation. If the rights flag is missing, the call fails. Bankr’s “charge only if we succeed” rule should then not take the money. A person still QC’s it. The 48-hour rule still applies.

**No token.** Ochré does not launch a coin. Bankr can launch tokens on Base and on Solana. We will not use that. A token would put the brand inside UK financial-promotion rules (the FCA’s regime for inviting the public into crypto). Those rules are strict, and a creative house does not need them.

Keep USDC off the Shopify homepage, off product pages, and out of customer email. The agent door can be shown to a grant reviewer. A solicitor should read any public sentence about it before it is posted.

## 8. Open questions

1. Editions: confirm 1 of 1, or a limited run such as 1 of 25, for the live shop.
2. Porcelain: which printer, or is it off the first shop?
3. Will Precision Imaging confirm in writing which of canvas, glass, acrylic, Gallery Bond, and cards they will make on a trade account? Public pages support canvas and folded cards. The others are drafted to MyPoster.
4. Are you happy for a UK customer’s glass, acrylic, or Gallery Bond to be made by MyPoster?
5. Does your greeting card match Precision Imaging’s folded, outside-only cotton card, or do you need a different card that only MyPoster might make?
6. Is the promise “dispatched by” or “arrives by”? What is the default number of days, per material?
7. Northern Ireland, Scottish Highlands, islands, and BFPO addresses: UK printer, MyPoster, or a surcharge?
8. Are Garms and Jewellery the same upload-to-object, or different products we have not described?
9. Shelf prices: VAT included? Are you VAT registered?
10. How long do we keep the customer’s image? A working suggestion is in the architecture note. An accountant should confirm it.
11. Who looks at the QC queue on a weekday when you are not at a desk?
12. Demo price for the agent piece, at or under $10, that still pays the printer.
13. The exact Gallery Bond you mean: MyPoster’s (print, acrylic sheet, aluminium back), or a different build?

## 9. Risks

- **The printer step is a person.** At low volume that is fine. If the QC queue is not opened, the 48-hour send is missed and the dispatch promise breaks. The alert makes that visible. Version 1 does not send itself.
- **Material mismatch.** Selling “printed in Birmingham” for a product MyPoster will actually make would be a false description. The product page should name the finish, not a studio we are not using.
- **The meter will look harsh.** Red below 150 DPI will mark a lot of phone photos at wall sizes. The “print it anyway” tick is there so we do not refuse the sale, and so the customer has seen the warning. Colour optimise must not sound like magic.
- **Rights.** The tick is a record. You still need a takedown habit: who reads the email, how fast the piece comes off sale, what happens if it is already at the printer.
- **Two uploads of the same picture** are two works, with their own numbers. Version 1 does not try to detect duplicates.
- **Phone uploads on a poor signal** will fail midway. The editor has to allow a retry without losing the crop.
- **MyPoster’s API starts at about 40 orders a day.** Automation is not a launch feature.
- **The agent demo is small** because of the $10 ceiling and Base-only settlement. It is still a real paid order of a real object. It is not a token.
- **Saying “pay in crypto” on the UK shop** is the FCA risk. The mitigation is no token, no crypto button, and a solicitor before any public wording.
- **Basic plan limits** on app data. If the “order paid” message does not arrive, move to Grow. Budget the extra £40 a month as a possible early switch.
