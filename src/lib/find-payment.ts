import { Connection, PublicKey } from "@solana/web3.js"
import type { StoredOrder } from "./order-types.ts"
import { decidePayment, type TransferHit } from "./settle-order.ts"

const MEMO_PROGRAM = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"

type Balance = {
  accountIndex: number
  mint: string
  owner?: string
  uiTokenAmount?: { uiAmountString?: string | null }
}

type ParsedTx = {
  meta?: { preTokenBalances?: Balance[]; postTokenBalances?: Balance[] } | null
  transaction?: {
    message?: {
      accountKeys?: Array<string | { pubkey?: { toBase58(): string } | string }>
      instructions?: Array<{ program?: string; programId?: string | { toBase58(): string }; parsed?: unknown }>
    }
  }
}

function payerFrom(tx: ParsedTx | null) {
  const key = tx?.transaction?.message?.accountKeys?.[0]
  if (!key) return null
  if (typeof key === "string") return key
  if (typeof key.pubkey === "string") return key.pubkey
  if (key.pubkey && "toBase58" in key.pubkey) return key.pubkey.toBase58()
  return null
}

function memoText(instruction: { program?: string; programId?: string | { toBase58(): string }; parsed?: unknown }, memo: string) {
  if (typeof instruction.parsed === "string" && instruction.parsed === memo) return true
  if (instruction.program === "spl-memo" && instruction.parsed === memo) return true
  const programId = typeof instruction.programId === "string" ? instruction.programId : instruction.programId?.toBase58?.()
  return programId === MEMO_PROGRAM && instruction.parsed === memo
}

function hasMemo(tx: ParsedTx, memo: string) {
  const instructions = tx.transaction?.message?.instructions ?? []
  return instructions.some((instruction) => memoText(instruction, memo))
}

function receivedAmount(tx: ParsedTx, mint: string, owner: string) {
  const pre = new Map<number, string>()
  for (const row of tx.meta?.preTokenBalances ?? []) {
    if (row.mint === mint && row.owner === owner) pre.set(row.accountIndex, row.uiTokenAmount?.uiAmountString || "0")
  }
  let saw = false
  let total = 0
  for (const row of tx.meta?.postTokenBalances ?? []) {
    if (row.mint !== mint || row.owner !== owner) continue
    const before = Number(pre.get(row.accountIndex) ?? "0")
    const after = Number(row.uiTokenAmount?.uiAmountString || "0")
    const delta = after - before
    if (Number.isFinite(delta) && delta > 0) {
      total += delta
      saw = true
    }
  }
  if (!saw) return null
  return total.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")
}

/** Amount counts only when the memo matches. A stray reference, a failed transfer, or the wrong mint contributes nothing. */
export function hitFromTransaction(tx: ParsedTx | null, order: Pick<StoredOrder, "mint" | "recipient" | "memo">, signature: string, newer: number, failed: boolean): TransferHit {
  if (failed || !tx || !hasMemo(tx, order.memo)) {
    return { signature, failed, amount: null, payer: null, newer }
  }
  return {
    signature,
    failed: false,
    amount: receivedAmount(tx, order.mint, order.recipient),
    payer: payerFrom(tx),
    newer,
  }
}

export async function findPayment(connection: Connection, order: StoredOrder) {
  const reference = new PublicKey(order.reference)
  const signatures = await connection.getSignaturesForAddress(reference, { limit: 25 }, "confirmed")
  const hits: TransferHit[] = []
  for (let index = 0; index < signatures.length; index += 1) {
    const item = signatures[index]
    const newer = signatures.length - index
    if (item.err) {
      hits.push({ signature: item.signature, failed: true, amount: null, payer: null, newer })
      continue
    }
    const tx = (await connection.getParsedTransaction(item.signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    })) as ParsedTx | null
    hits.push(hitFromTransaction(tx, order, item.signature, newer, false))
  }
  return decidePayment(hits, order.usdcAmount)
}
