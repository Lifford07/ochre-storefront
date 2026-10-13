import { serverRpc, solanaSettings } from "@/config/solana"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const ALLOWED = new Set([
  "getLatestBlockhash",
  "getAccountInfo",
  "getMultipleAccounts",
  "getFeeForMessage",
  "getRecentPrioritizationFees",
  "sendTransaction",
  "simulateTransaction",
  "getSignatureStatuses",
  "getBlockHeight",
  "getMinimumBalanceForRentExemption",
  "isBlockhashValid",
])

export async function POST(request: Request) {
  if (!(await rateLimit(`rpc:${clientIp(request)}`, 90, 60))) return tooMany()
  const rpc = serverRpc(solanaSettings().cluster)
  if (!rpc) {
    return Response.json({ error: "Set SOLANA_RPC_URL on the server before payments can be sent." }, { status: 503 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "The RPC request was not readable." }, { status: 400 })
  }
  const calls = Array.isArray(body) ? body : [body]
  if (calls.length > 8) return Response.json({ error: "That RPC batch is too large." }, { status: 400 })
  for (const call of calls) {
    const method = (call as { method?: string }).method
    if (!method || !ALLOWED.has(method)) {
      return Response.json({ error: "That RPC method is not available here." }, { status: 403 })
    }
  }
  const response = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  return new Response(text, {
    status: response.status,
    headers: { "content-type": "application/json" },
  })
}
