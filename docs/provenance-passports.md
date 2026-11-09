# Provenance passports

A passport is the public page for one physical piece. The short address is `/p/<id>`, for example `/p/btc-001`. A QR code and an NFC tag both open that address. The page shows the maker, the edition number, the materials once they are known, the making film, the holder if they have agreed to be named, and the chain of ownership.

This is a studio record. It is not a token, an NFT, or a payment.

The example already in the repo is **Bitcoin**, id `btc-001`, Edition No. 001. It is a draft. The piece is not made. The date, techniques, materials, dimensions, film, and process photos are marked Placeholder on purpose. Do not replace those with a guess. Mark the passport verified only when the piece exists and the facts are true.

## Open the desk

Go to `/admin/passports`. The password is `ADMIN_PASSWORD`, the same one as the order desk. From the order desk, follow **Provenance passports**.

On your own computer, a save is written to `data/passports.json`. That file is not committed. On the live site, saves go to Redis, the same store as orders. If the live site has no Redis, the page still shows the pieces in the repo, and a save will not keep.

`/admin` is not indexed.

## Add a piece

1. Open the desk.
2. Type a short id. Lowercase letters, numbers, and hyphens. Example: `heart-002`. The id is the URL. It does not change later, because a printed tag cannot be updated.
3. Press **Start a piece**.
4. Fill the title, the edition number, and the line (Art, Home, Garms, Jewellery). A one-of-one is edition number 1 and edition size 1. The page reads that as Edition No. 001.
5. Leave **draft** selected.
6. Write the note and the dedication in your own words.
7. Leave Date made, Techniques, Materials, and Dimensions as placeholders until you know them. A date is written `YYYY-MM-DD`.
8. Press **Save passport**.

The public page is live at `/p/<id>` as soon as it is saved, including while it is a draft. A draft says so at the top, and search engines are asked not to index it.

## Making film and process photos

- Film: an `https` address ending in `.mp4` or `.webm`, plus a poster image. The page shows the poster first. The film file loads only after someone presses play.
- A YouTube or Vimeo page is stored as a link. The passport does not embed a player.
- Photos: an `https` address, or a path already on this site such as `/fela-the-goat.webp`. They load when the reader reaches them.
- Leave **Placeholder** ticked, and leave the address empty, until the file exists.

## Holder

- No name: a draft says **Not yet issued**. A verified piece with no name says **Ochré studio**.
- A name, with **Show this name on the public page** unticked: the page says **Private collection**.
- A name, with the box ticked: the page shows the name.

Saving the holder corrects the spelling or the opt-in. It does not add a line to the timeline.

## Record a transfer

Use **Record a transfer** at the bottom of the piece. This also saves the rest of the form.

1. New holder. The desk keeps the name even when the public page must not show it.
2. Date, as a calendar date.
3. Public note. Optional. The timeline is public. If the name is private, the note must not contain it. Leave the note empty and the line reads “First sold to a private collection.” or “Passed to a private collection.”
4. Tick the box only if this holder wants their name on the page.
5. Press **Record this transfer**.

The first real transfer is **First sold**. It replaces the “Not yet sold” placeholder. A later one is **Ownership transferred**.

There is no form for a customer to transfer a piece themselves. Anyone on the internet could otherwise rewrite a holder.

## QR code and NFC

On the passport, **Download QR** saves a PNG. The same control is on the desk. The code points at the passport URL, with high error correction so a small print still scans. It is dark on a cream ground. Do not invert it.

Set `PASSPORT_ORIGIN` to the public site before you print a tag or write an NFC tag, for example `https://ochre-storefront.vercel.app`. While you are only checking the page on your own computer, leave it unset and the code uses the address you have open.

An NFC tag stores the same URL as a web address (a URI record). Any tag-writer app can do that. This site does not write the tag: iPhone cannot write NFC from the browser. The phone, tapping the tag, opens the passport.

The owner can copy **Passport link** and put that URL in a bio.

## Verify a piece

Change the status to **verified** only when the piece is made and the placeholder boxes for the date, the materials, the dimensions, and the film are cleared. The public line then reads **Verified Ochré original**. Verified passports are added to the sitemap. Drafts are not.

## If you are editing the repo instead

The pieces that ship with the code live in `src/config/passports.ts`. You can add one there, in the same shape as `btc-001`. Once you save that same id in the desk, the desk copy is the one the site shows.

Keep unknown facts as `{ "value": "", "placeholder": true }`. Do not invent a date, a gold-leaf type, a dimension, or a film.
