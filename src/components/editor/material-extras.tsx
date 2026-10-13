"use client"

import { materialById, type MaterialId } from "@/config/catalogue"

const FAQ: Record<string, Array<[string, string]>> = {
  "real-glass": [
    ["Glass or acrylic?", "Real glass is heavier, with a thin, crisp edge and a true glass reflection. Acrylic is lighter, with a deeper polished edge and a stronger glare."],
  ],
  acrylic: [
    ["Acrylic or glass?", "Acrylic is lighter and shatter-resistant, with a deep polished edge and rich, saturated colour. Real glass has a thinner edge and a cooler sheen."],
  ],
  canvas: [
    ["Why canvas?", "Matte, no glare from any angle, with a soft woven texture. The image wraps around the sides of the frame."],
  ],
}

export function MaterialExtras({ materialId }: { materialId: string }) {
  let m: ReturnType<typeof materialById> | null = null
  try {
    m = materialById(materialId as MaterialId)
  } catch {
    m = null
  }
  const faq = FAQ[materialId] ? [...FAQ[materialId], ...(m?.care ? [["Care", m.care] as [string, string]] : []), ...(m?.hanging ? [["Hanging", m.hanging] as [string, string]] : [])] : null
  return (
    <div className="mt-6 space-y-5" data-testid="material-extras">
      <div className="border border-[#C6B849]/60 bg-[#F3EFE7] p-4">
        <p className="font-mono text-[10px] tracking-[0.2em] text-[#9a8c2e] uppercase">Finish</p>
        <div className="mt-2 flex items-center justify-between border-b border-[#C6B849]/30 pb-2 text-sm">
          <span>{materialId === "canvas" ? "Ready to hang (hanging set in the box)" : "Ready to hang (hanger fitted)"}</span>
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase">Included</span>
        </div>
        {materialId === "canvas" ? (
          <div className="mt-2 text-sm">
            <p>Floating frame</p>
            <div className="mt-2 flex gap-2">
              {[
                ["Gold", "#C6B849"],
                ["Black", "#111111"],
              ].map(([name, colour]) => (
                <span key={name} className="inline-flex items-center gap-2 border border-[var(--navy)]/20 px-3 py-1.5 text-xs opacity-60">
                  <span className="size-3" style={{ background: colour }} /> {name}
                </span>
              ))}
              <span className="self-center font-mono text-[10px] tracking-[0.16em] text-[#9a8c2e] uppercase">Coming soon</span>
            </div>
          </div>
        ) : null}
      </div>
      {faq ? (
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#9a8c2e] uppercase">About this material</p>
          <ul className="mt-2 border-t border-[#C6B849]/50">
            {faq.map(([q, a]) => (
              <li key={q} className="border-b border-[#C6B849]/30">
                <details className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg">
                    {q}
                    <span className="text-[#C6B849] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-[var(--navy)]/75">{a}</p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
