/**
 * Thin hook into the site's existing Solana Pay checkout.
 * Do not alter checkout internals here — only hand off a design payload.
 */
import type { CrestDesign } from '@/lib/crest/types'
import { priceDesign } from '@/lib/crest/pricing'
import { toSavedPayload } from '@/lib/crest/serialize'

export type SolanaPayHandOff = {
  kind: 'ochre-crest-design'
  payload: ReturnType<typeof toSavedPayload>
}

declare global {
  interface Window {
    /** Optional host-injected checkout entry (existing Ochré checkout). */
    __OCHRE_SOLANA_PAY__?: (handOff: SolanaPayHandOff) => void | Promise<void>
  }
}

export async function payWithSolanaPay(design: CrestDesign): Promise<{ ok: boolean; message: string }> {
  const handOff: SolanaPayHandOff = {
    kind: 'ochre-crest-design',
    payload: toSavedPayload(design),
  }

  if (typeof window !== 'undefined' && typeof window.__OCHRE_SOLANA_PAY__ === 'function') {
    await window.__OCHRE_SOLANA_PAY__(handOff)
    return { ok: true, message: 'Handed off to Solana Pay checkout.' }
  }

  // Safe stub when the host checkout is not mounted in this isolated app.
  console.info('[Ochré] Solana Pay hand-off ready', {
    total: priceDesign(design).total,
    redesign: design.upload.ochreRedrawNeeded,
  })
  return {
    ok: true,
    message:
      'Solana Pay hook called. Wire window.__OCHRE_SOLANA_PAY__ to your existing checkout — this app does not change checkout logic.',
  }
}
