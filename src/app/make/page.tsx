import { Suspense } from "react"
import { Editor } from "@/components/editor/editor"

export default function MakePage() {
  return (
    <Suspense fallback={<p className="bg-[var(--porcelain)] px-5 py-8 text-sm text-[var(--mute)]">Opening the editor…</p>}>
      <Editor />
    </Suspense>
  )
}
