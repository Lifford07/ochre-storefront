import { Suspense } from "react"
import { MakeGate } from "./make-gate"

export default function MakePage() {
  return (
    <Suspense fallback={<p className="bg-[var(--porcelain)] px-5 py-8 text-sm text-[var(--mute)]">Opening the editor…</p>}>
      <MakeGate />
    </Suspense>
  )
}
