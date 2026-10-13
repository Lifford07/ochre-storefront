/**
 * Pays the newest unpaid Ochré order on the configured cluster.
 * Uses PAYER_SECRET_BASE64 from .env.local. That key never belongs in git.
 * Devnet: the script asks for SOL, then tries a public USDC drip if the wallet is short.
 */
import { readFileSync } from "node:fs"
import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import { createTransfer } from "@solana/pay"
import BigNumber from "bignumber.js"

function envValue(name) {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
  const line = text.split("\n").find((item) => item.startsWith(`${name}=`))
  if (!line) throw new Error(`Missing ${name} in .env.local`)
  return line.slice(name.length + 1).trim()
}

const orders = JSON.parse(readFileSync(new URL("../data/orders.json", import.meta.url), "utf8"))
const order = orders.find((item) => item.status === "awaiting payment")
if (!order) {
  console.log("No order is waiting for payment.")
  process.exit(0)
}

const secret = Buffer.from(envValue("PAYER_SECRET_BASE64"), "base64")
const payer = Keypair.fromSecretKey(secret)
const connection = new Connection(order.rpc, "confirmed")

const sol = await connection.getBalance(payer.publicKey)
if (sol < 20_000_000 && order.cluster === "devnet") {
  console.log("Requesting a devnet SOL airdrop…")
  const airdrop = await connection.requestAirdrop(payer.publicKey, 1_000_000_000)
  await connection.confirmTransaction(airdrop, "confirmed")
}

console.log(`Paying ${order.id} · ${order.usdcAmount} USDC from ${payer.publicKey.toBase58()}`)
const transaction = await createTransfer(connection, payer.publicKey, {
  recipient: new PublicKey(order.recipient),
  amount: new BigNumber(order.usdcAmount),
  splToken: new PublicKey(order.mint),
  reference: new PublicKey(order.reference),
  memo: order.memo,
})
transaction.sign(payer)
const signature = await connection.sendRawTransaction(transaction.serialize())
await connection.confirmTransaction(signature, "confirmed")
console.log(signature)
