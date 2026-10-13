"use client"

import { useMemo, useState } from "react"
import { DeliveryNote } from "@/components/checkout/delivery-note"
import { formatPrice, priceFor, sizesFor, type MaterialId } from "@/config/catalogue"

const MATERIALS: { id: MaterialId; label: string; line: string }[] = [
  { id: "real-glass", label: "Real glass", line: "Printed behind real glass. Deep colour, quiet sheen." },
  { id: "acrylic", label: "Acrylic glass", line: "Fine-art acrylic. Crisp, luminous, gallery finish." },
  { id: "canvas", label: "Canvas", line: "Stretched canvas with a soft woven texture." },
]

const VISIBLE = 6

export function MakeEntry({ onStart }: { onStart: (choice: { materialId: MaterialId; sizeId: string; orientation: "portrait" | "landscape" }) => void }) {
  const [materialId, setMaterialId] = useState<MaterialId>("real-glass")
  const [more, setMore] = useState(false)
  // One row per size family; prefer the portrait or square version.
  const rows = useMemo(() => {
    const seen = new Map<string, ReturnType<typeof sizesFor>[number]>()
    for (const size of sizesFor(materialId)) {
      const existing = seen.get(size.family)
      if (!existing || (existing.orientation === "landscape" && size.orientation !== "landscape")) seen.set(size.family, size)
    }
    return [...seen.values()]
      .map((size) => ({ size, pence: priceFor(size, materialId) }))
      .sort((a, b) => a.pence - b.pence)
  }, [materialId])
  const [sizeId, setSizeId] = useState<string | null>(null)
  const selected = rows.find((row) => row.size.id === sizeId) ?? rows[0]
  const shown = more ? rows : rows.slice(0, VISIBLE)
  const material = MATERIALS.find((m) => m.id === materialId)!

  return (
    <section className="bg-[#F3EFE7] text-[var(--navy)]">
      <div className="mx-auto grid max-w-[1440px] md:grid-cols-[1.15fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#ece6db] md:aspect-auto md:min-h-[640px]">
          {MATERIALS.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={m.id}
              src={`/make-${m.id}.webp`}
              alt={`Fingerprint of God by SJ, made in ${m.label.toLowerCase()}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${m.id === materialId ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <p className="absolute bottom-4 left-5 font-mono text-[10px] tracking-[0.18em] text-[var(--navy)]/60 uppercase">
            Fingerprint of God · SJ · {material.label}
          </p>
        </div>
        <div className="flex flex-col justify-center px-5 py-10 md:px-12 md:py-14">
          <p className="eyebrow text-[var(--gold-ink)]">Made to order · numbered</p>
          <h1 className="font-display mt-3 text-4xl leading-[1.05] md:text-6xl">
            Wall art, <span className="italic text-[var(--gold-ink)]">made to order.</span>
          </h1>
          <p className="mt-4 max-w-md text-[var(--navy)]/75">Choose your material and size, then upload your image.</p>
          <div className="mt-6 h-px w-16 bg-[#C6B849]" />

          <label className="mt-7 block">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase">Material</span>
            <select
              value={materialId}
              onChange={(e) => {
                setMaterialId(e.target.value as MaterialId)
                setSizeId(null)
                setMore(false)
              }}
              className="mt-2 block w-full appearance-none border border-[var(--navy)]/25 bg-white/70 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230b1332%22 stroke-width=%221.4%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat px-4 py-3 font-display text-xl focus:border-[#C6B849] focus:outline-none"
              data-testid="make-material"
            >
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <span className="mt-2 block text-sm text-[var(--navy)]/60">{material.line}</span>
          </label>

          <fieldset className="mt-6">
            <legend className="text-[11px] font-medium tracking-[0.2em] uppercase">Size</legend>
            <ul className="mt-2 border-t border-[#C6B849]/50">
              {shown.map(({ size, pence }) => {
                const active = selected?.size.id === size.id
                return (
                  <li key={size.id} className="border-b border-[#C6B849]/30">
                    <label className="flex cursor-pointer items-center justify-between gap-3 py-3">
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="make-size"
                          checked={active}
                          onChange={() => setSizeId(size.id)}
                          className="size-4 accent-[#C6B849]"
                        />
                        <span className={active ? "font-medium" : ""}>{size.name}</span>
                      </span>
                      <span className={`font-display text-lg ${active ? "text-[var(--navy)]" : "text-[var(--navy)]/70"}`}>{formatPrice(pence)}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            {rows.length > VISIBLE ? (
              <button type="button" onClick={() => setMore((v) => !v)} className="mt-3 text-sm text-[var(--gold-ink)] underline underline-offset-4">
                {more ? "Fewer formats" : `More formats (${rows.length - VISIBLE})`}
              </button>
            ) : null}
            <DeliveryNote materialId={materialId} className="mt-4" />
            <p className="mt-3 text-xs text-[var(--navy)]/55">Prices include VAT and delivery. Orientation can be changed after upload.</p>
          </fieldset>

          <button
            type="button"
            className="btn-foil mt-7 w-full"
            data-testid="make-upload"
            onClick={() =>
              selected &&
              onStart({
                materialId,
                sizeId: selected.size.id,
                orientation: selected.size.orientation === "landscape" ? "landscape" : "portrait",
              })
            }
          >
            Upload image
          </button>
        </div>
      </div>
    </section>
  )
}
