# Ochré — Solana Pay demo

The editor prototype takes a real USDC payment on Solana. Devnet is the default, so you are not spending mainnet money. Cards and the Shopify shop are still the plan for the public Birmingham store. Base USDC (the Bankr door) is still the plan for the agent endpoint. This checkout is the Solana rail for the Colosseum Crypto World’s Fair and the Superteam UK demo before Breakpoint London.

Words:

- **Devnet**: Solana’s practice network. Tokens there have no cash value.
- **USDC**: a token that tracks the US dollar. Devnet USDC is the practice version.
- **Solana Pay**: a standard link a wallet can pay. It names the amount, the USDC token, a one-off reference, and a memo.
- **Memo**: a short note stored on the transfer. Ours is the order id, for example `OCH-A1B2C3D4E5`.
- **Reference**: a unique address included in the transfer so we can find that exact payment.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123). The house is `/`. The editor is `/make`. The collection is `/collection`. A paid order’s certificate is `/orders/[id]`. `/orders/preview` is the same certificate with example type, so you can look at it before a wallet pays. Add `?kind=drop` on that preview for the numbered wording.

Leave `.env.local` on devnet unless you mean to take real USDC. Devnet is the code default when `NEXT_PUBLIC_SOLANA_CLUSTER` is unset. No environment variable is required for `next build`.

Orders are written to `data/orders.json` on this machine, and a customer print file is written to `data/uploads/`. Neither directory is committed. The owner list is [http://127.0.0.1:43123/admin/orders](http://127.0.0.1:43123/admin/orders). No Redis or Blob env var is required locally. The same list and the certificate read that file store.

On Vercel, provision Upstash Redis and a private Vercel Blob store (see below) and redeploy. If Redis is missing, checkout returns 503 and does not write the order to `/tmp`. A customer photo also needs Blob. House editions need Redis too, because the edition number is stored with the order.

## Production on Vercel (Solana mainnet)

Set these in the Vercel project. `NEXT_PUBLIC_` values are visible in the browser. `SOLANA_RPC_URL` is server-only: the wallet talks to `/api/rpc`, which forwards an allow-list of methods. Delete `NEXT_PUBLIC_SOLANA_RPC_URL` if an older deploy still has it, and rotate that key. Do not set `PAYER_SECRET_BASE64` on Vercel. That key is only for the local `scripts/pay-latest.mjs` script.

| Variable | Where | Production value |
|---|---|---|
| `NEXT_PUBLIC_SOLANA_CLUSTER` | public | `mainnet-beta` |
| `NEXT_PUBLIC_MERCHANT_WALLET` | public | `4F9pgnHjQETyYcjz7tm8NvdV9VZuDRuHbZuiXb77sPBF` |
| `NEXT_PUBLIC_USDC_MINT` | public | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `SOLANA_RPC_URL` | server | `https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY` |
| `ADMIN_PASSWORD` | server | a long password for `/admin/orders` |
| `CRON_SECRET` | server | a long secret for the daily payment recheck |
| `RESEND_API_KEY` | server | optional; email no-ops when unset |
| `RESEND_FROM` | server | optional; a verified Resend sender |
| `KV_REST_API_URL` | server | set by the Upstash Redis Marketplace integration |
| `KV_REST_API_TOKEN` | server | set by the Upstash Redis Marketplace integration |
| `BLOB_READ_WRITE_TOKEN` | server | set when you create a private Vercel Blob store |
| `GBP_USDC_RATE` | server | leave unset |
| `ORDERS_FILE` | server | leave unset |

`4F9pgnHjQETyYcjz7tm8NvdV9VZuDRuHbZuiXb77sPBF` is the founder’s Phantom receive address. It is public. USDC paid on mainnet lands there.

`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` is Circle’s mainnet USDC. Mainnet mode uses it even if `NEXT_PUBLIC_USDC_MINT` is unset or still holds the devnet mint. Checkout stores the mint, the merchant, and the cluster. It does not store the RPC URL. Confirmation scans recent signatures on the reference, skips a failed or non-matching transaction, then `validateTransfer` checks the amount, the USDC mint, the recipient, the reference, and the order id in the memo. A daily cron and the admin “Recheck unpaid payments” button run that check even if the customer closes the tab. Hobby cron is once a day, so the button covers the gap.

On Vercel, `SOLANA_RPC_URL` is required. The public endpoint `https://api.mainnet-beta.solana.com` is only a local fallback. It rate-limits. Production should use Helius. QuickNode or Alchemy are the same kind of endpoint if you already have an account there. Put the key only in `SOLANA_RPC_URL`.

`GBP_USDC_RATE` is optional. Unset, the shop asks Pyth, then the European Central Bank, then uses 1.27. `ORDERS_FILE` is optional and should stay unset on Vercel.

## Durable orders and print files

Two stores, both on the Vercel Hobby plan, both inside the free quota when you stay within it.

1. **Upstash Redis**, from the Vercel Marketplace. Create the free database and connect it to the project `ochre-storefront` for Production and Preview. The integration sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`. A direct Upstash database that sets `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` is accepted too. Prefer the `KV_` names. Order JSON, edition numbers, and one-time upload tickets live here. Print files do not.
2. **Vercel Blob**, Private. Create the store on the same project and include Production and Preview. Vercel sets `BLOB_READ_WRITE_TOKEN` and `BLOB_STORE_ID`. Keep both. Client uploads use the read-write token, which is how a print file larger than the function body limit still lands in the store. The URL is private. `/admin/orders` and the certificate read it through `/api/orders/[id]/image`.

Hobby Blob includes 1 GB of storage and does not charge inside that quota. After the stores are linked, redeploy (`vercel --prod` from the source archive) so the new variables are present. `/admin/orders` reads whatever store the API is using. With Redis linked, that is Redis.

Until Redis exists, production checkout is closed. It does not keep orders in `/tmp`. The upload route says which store is missing. `/admin/orders` asks for `ADMIN_PASSWORD`. Print files and the order list are not public.

The certificate page records the payment. It does not mint a token. After payment the copy says the certificate will be issued, and the card stays **Awaiting the mint**.

The USDC amount is the pound price times a rate. If `GBP_USDC_RATE` is set, that wins. Otherwise the app asks Pyth for GBP/USD, then the European Central Bank rate, then a fixed 1.27. USDC is treated as one US dollar.

Wall prices are at least three times landed cost: the MyPoster public euro sale price, times 0.86, plus £6 packaging and zone shipping (£8 UK, £18 EU, £28 US). Premium materials and numbered editions use four times. The result rounds up to a gallery ending. Cards are hidden. Porcelain is shown and cannot be paid for. USDC adds a 1.5% buffer on the pound rate.

## Test the whole payment on devnet with Phantom

1. Install [Phantom](https://phantom.com/). In the wallet: Settings → Developer settings → turn on **Testnet mode** and choose **Devnet**. Solflare works the same way if you prefer it.
2. Copy the wallet address. Get devnet SOL from [https://faucet.solana.com](https://faucet.solana.com) (you need a little SOL to pay the network fee).
3. Get devnet USDC from [https://faucet.circle.com](https://faucet.circle.com). Choose Solana devnet. A wall piece is the smallest acrylic size. Cards are not on sale.
4. In the editor at `/make`: upload a photo (or use the sample), edit, pick a small acrylic size, press **Ready**. If the meter is amber or red, tick **Print it anyway**.
5. Fill in email, name, and the full address. Tick “I own or have permission to use this image.” Press **Pay with USDC (Solana Pay)**.
6. On a phone, scan the QR code with Phantom (Devnet, and enough devnet USDC). On a computer, press **Connect wallet**, approve Phantom, then **Pay from this wallet**.
7. The page watches the network with `findReference` and `validateTransfer`. When the transfer matches the amount, the USDC token, the reference, and the order id in the memo, you land on the certificate. A customer upload reads **Edition 1/1**. A numbered house work reads **Edition No. 001 of N**. One gold seal overhangs the card. The card still says **Awaiting the mint**, because the certificate token is not minted yet.
8. Open `/admin/orders`. The same order is there as **paid, awaiting Ochré check**.

Nothing is sent to a printer. A person still has to look.

If you already have an unpaid order in `data/orders.json` and a funded devnet payer in `.env.local`, `node scripts/pay-latest.mjs` sends that payment from the command line. The page that is already showing the QR will confirm it.

## Three-minute video

Shoot in this order. About three minutes. Stay on the warm paper pages. Do not open a code editor.

1. **0:00** The upload step. Say: “Ochré. One photo becomes one made-to-order piece.” Drop the sample photo.
2. **0:20** Preview. Point at the line about screens and materials, and the colour switch.
3. **0:35** Material. Point at Gallery Bond’s spec (thickness, 12-colour, days) and the price “from” line. Say the price is three times the landed print-and-ship cost, with no fake sale.
4. **0:55** Size. Show the quality meter move when you change size. Press **Ready**. Cards are not on sale.
5. **1:20** Checkout. Tick the rights line. Press **Pay with USDC (Solana)**. Leave the USDC amount and the order id on screen.
6. **1:40** Show the QR code. Say it is a Solana Pay request for devnet USDC, with a unique reference and the order id in the memo. Phantom or Solflare can scan it.
7. **2:00** Press **Connect wallet** (or scan, if the phone is in frame). Approve the transfer in Phantom, set to Devnet.
8. **2:25** The certificate. Read “Edition 1/1” for an upload. Click the Solscan link and show the memo.
9. **2:45** `/admin/orders`. The status is “paid, awaiting Ochré check”. End on that list.

Say once, in your own words: this is devnet for the hackathon. The shop will still take cards. Base USDC for agents is a later door. Ochré is not launching a token.
