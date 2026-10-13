# Ochré editor prototype

The Ochré storefront: a quiet gallery, a MyPoster-simple editor, and Solana Pay checkout. Upload a photo, edit it, choose a material and a size, then one Ready button. The quality meter reads Too small under 150 DPI, Good from 150, and Perfect from 300.

Example prices and sizes live in [`src/config/catalogue.ts`](src/config/catalogue.ts). Each size is one orientation, with its own price per material, so a full price grid can replace the examples. The file is marked **EXAMPLE — replace**. Nothing here takes a payment, and the shop is not on Shopify yet.

Also in the prototype:

- Print-optimised colour, on by default, plus Original, Black & White, and Sepia, baked into the print file
- Amber or red sizes need a “print it anyway” tick. Smoothing a preview does not sharpen the print
- JPG, PNG, WEBP, HEIC, TIFF, and the first page of a PDF, up to 25MB
- Upload on the computer you are using. A phone-to-desktop handoff is not offered
- Customer uploads are Edition 1/1. Numbered house works get their number when the payment clears
- The house collection, artwork pages, and the edition certificate live alongside the editor at `/make`.

Solana Pay (devnet USDC) is wired into checkout. See [DEMO.md](DEMO.md).

Decision notes for the full shop:

- [SCOPE.md](SCOPE.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [MILESTONES.md](MILESTONES.md)

## Run it locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

```bash
npm test
npm run lint
```

`npm test` checks the DPI bands (too small under 150, good from 150, perfect from 300) and how far Enhance resolution enlarges a soft file.

Open `/` for the house, `/collection` for editions, `/make` for the editor, and `/orders/preview` for the certificate layout. A paid order uses `/orders/[id]`.
