"use client"

import { addToBasket } from "@/lib/basket"

import { isExampleWork } from "@/config/works"

import Link from "next/link"
import { useMemo, useState } from "react"
import { WorkImage } from "@/components/art/motif"
import {
  formatPrice,
  materialById,
  materials,
  priceFor,
  sizes,
  sizesFor,
  type MaterialId,
  type Size,
} from "@/config/catalogue"
import type { HouseWork } from "@/config/works"
import { artworkSources } from "@/lib/artwork-sources"
import { hiddenSizeCount, orientationChoices, sizeFamilies, visibleSizes } from "@/lib/size-window"

const offered: MaterialId[] = ["real-glass", "acrylic", "canvas"]

export function WorkStudio({
  work,
  taken,
  countKnown = true,
}: {
  work: HouseWork
  taken: number
  countKnown?: boolean
}) {
  const [materialId, setMaterialId] = useState<MaterialId>(work.materialId)
  const [sizeId, setSizeId] = useState(work.sizeId)
  const [room, setRoom] = useState(false)
  const [moreSizes, setMoreSizes] = useState(false)
  const [frame, setFrame] = useState(0)
  const material = materialById(materialId)
  const options = useMemo(() => sizesFor(materialId), [materialId])
  const families = useMemo(() => sizeFamilies(options), [options])
  const frames = work.images && work.images.length > 0 ? work.images : work.image ? [work.image] : []
  const activeImage = frames[frame] ?? work.image
  const size = options.find((item) => item.id === sizeId) ?? options[0] ?? sizes.find((item) => item.id === work.sizeId)
  const price = size && size.prices[materialId] != null && material.payable ? priceFor(size, materialId, { numbered: true }) : null
  const left = Math.max(0, work.editionSize - taken)
  const nextNumber = Math.min(work.editionSize, taken + 1)

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.9fr)]">
      <div>
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--mute)] uppercase">
          <Link href="/collection">Collection</Link>
          <span> / </span>
          <Link href={`/artists/${work.artistSlug}`}>{work.artist}</Link>
          <span> / {work.title}</span>
        </p>
        <div className="relative mt-4 bg-[var(--bone)]">
          {room ? (
            <div className="grid min-h-[420px] place-items-center bg-[#e7e1d6] px-8 py-16">
              <div className="w-full max-w-sm">
                <div className="mx-auto w-1/2 shadow-[var(--shadow-art)]">
                  <WorkImage motif={work.motif} image={activeImage} title={work.title} />
                </div>
                <div className="mt-6 h-16 rounded-sm bg-[#f7f4ee]" />
                <p className="mt-4 text-center font-mono text-[11px] tracking-[0.14em] text-[var(--mute)] uppercase">
                  Room view · stand-in
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-lg p-6 md:p-10">
              <p className="mb-3 text-center font-mono text-[10px] tracking-[0.16em] text-[var(--mute)] uppercase">
                Shown in {material.name}
                {size ? ` · ${size.name}${size.widthMm === size.heightMm ? "" : ` · ${size.orientation}`}` : ""}
              </p>
              <div className="shadow-[var(--shadow-art)]">
                <WorkImage motif={work.motif} image={activeImage} title={work.title} priority sizes="(min-width: 1024px) 46vw, 92vw" />
              </div>
            </div>
          )}
          <button type="button" className="absolute bottom-4 left-1/2 inline-flex min-h-11 -translate-x-1/2 items-center bg-[var(--paper)] px-4 text-[11px] tracking-[0.14em] text-[var(--ink)] uppercase" onClick={() => setRoom((value) => !value)}>
            {room ? "View the work" : "View in your room"}
          </button>
        </div>
        {frames.length > 1 ? (
          <ul className="mt-3 flex gap-2 overflow-x-auto">
            {frames.map((src, index) => (
              <li key={src} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={index === frame}
                  aria-label={`Photograph ${index + 1} of ${work.title}`}
                  onClick={() => setFrame(index)}
                  className={`size-14 overflow-hidden border ${index === frame ? "border-[var(--navy)]" : "border-[var(--line)]"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img {...artworkSources(src)} alt="" sizes="56px" className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <p className="eyebrow">{work.artist} · edition</p>
        <h1 className="font-display mt-2 text-5xl md:text-6xl">{work.title}</h1>
        <p className="mt-2 text-[var(--charcoal)]">
          {work.artist} {isExampleWork(work) ? <span className="ex">Example</span> : null}
          <span className="text-[var(--mute)]"> · {work.year}</span>
        </p>

        <div className="mt-6 bg-[var(--navy)] px-5 py-4 text-[var(--porcelain)]">
          <div className="flex items-start justify-between gap-4">
            <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--gold)] uppercase">
              Edition of {work.editionSize} {isExampleWork(work) ? <span className="ex">Example</span> : null}
            </p>
            <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--foil)] uppercase">
              {countKnown ? `${left} left` : "Count unavailable"}
            </p>
          </div>
          <p className="font-display mt-2 text-4xl">{countKnown ? `No. ${String(nextNumber).padStart(2, "0")}` : "—"}</p>
          <p className="text-sm text-[var(--porcelain)]/70">
            {countKnown
              ? "is written on the order when the payment clears"
              : "The edition count will show when the order store answers."}
          </p>
        </div>

        <fieldset className="mt-8">
          <legend className="eyebrow">Material</legend>
          <div className="mt-3 space-y-2">
            {offered.map((id) => {
              const item = materials.find((entry) => entry.id === id)!
              const on = id === materialId
              const priced = sizesFor(id).filter((entry) => entry.prices[id] != null && materialById(id).payable)
              const amount = priced.length ? Math.min(...priced.map((entry) => priceFor(entry, id, { numbered: true }))) : null
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setMaterialId(id)
                    setMoreSizes(false)
                    const nextSizes = sizesFor(id)
                    if (!nextSizes.some((entry) => entry.id === sizeId) && nextSizes[0]) setSizeId(nextSizes[0].id)
                  }}
                  className={`flex w-full items-center justify-between gap-3 border px-4 py-3 text-left ${on ? "border-[var(--navy)] bg-[var(--paper)]" : "border-[var(--line)] bg-transparent"}`}
                >
                  <span>
                    <span className="block">{item.name.replace("Real ", "")}</span>
                    <span className="block text-sm text-[var(--mute)]">{item.line}</span>
                  </span>
                  <span className="text-sm text-[var(--charcoal)]">{amount == null ? "Soon" : `from ${formatPrice(amount)}`}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <SizeChoices
          families={families}
          more={moreSizes}
          selectedId={size?.id}
          materialId={materialId}
          payable={material.payable}
          onMore={() => setMoreSizes((open) => !open)}
          onSelect={setSizeId}
        />

        <p className="font-display mt-8 text-5xl">{price == null ? "—" : formatPrice(price)}</p>
        <p className="mt-1 text-sm text-[var(--mute)]">
          ≈ USDC at checkout <span className="ex">Rate</span>
          <span className="mx-2">·</span>
          {material.lead}
        </p>

        {material.payable && price != null && countKnown && left > 0 && size ? (
          <Link
            href={`/collect/${work.slug}?material=${materialId}&size=${size.id}`}
            className="btn-foil mt-6 flex"
          >
            Collect
          </Link>
        ) : null}
        {material.payable && price != null && countKnown && left > 0 && size ? (
          <button
            type="button"
            className="mt-3 flex min-h-12 w-full items-center justify-center border border-[var(--navy)] py-3 text-[11px] tracking-[0.2em] uppercase transition hover:border-[#C6B849] hover:text-[var(--gold-ink)]"
            data-testid="add-to-basket"
            onClick={() =>
              addToBasket({
                slug: work.slug,
                title: work.title,
                artist: work.artist,
                image: work.image,
                materialId,
                materialName: material.name,
                sizeId: size.id,
                sizeName: size.name,
                editionNumber: nextNumber,
                editionSize: work.editionSize,
                pricePence: price,
              })
            }
          >
            Add to basket
          </button>
        ) : (
          <p className="mt-6 text-sm text-[var(--mute)]">
            {!material.payable || price == null
              ? `${material.name} is not priced for payment yet.`
              : !countKnown
                ? "Checkout is paused until the order store answers. Nothing was charged."
                : "This edition is complete."}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3 border border-[var(--line)] bg-[var(--paper)] p-3">
          <div className="size-14 shrink-0 bg-[var(--bone)]">
            <WorkImage motif={work.motif} image={work.image} title="" sizes="56px" />
          </div>
          <p className="text-sm">
            Includes a Certificate of Edition. {left > 0 ? `Edition No. ${String(nextNumber).padStart(3, "0")} of ${work.editionSize}` : "Sold through"}.
          </p>
        </div>
      </div>

      <div className="grid gap-8 border-t border-[var(--line)] pt-10 md:grid-cols-3 lg:col-span-2">
        <section>
          <p className="eyebrow">About the work</p>
          {work.statement.length > 180 ? (
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--charcoal)]">{work.statement}</p>
          ) : (
            <blockquote className="font-display mt-3 text-2xl italic">“{work.statement}”</blockquote>
          )}
          <p className="mt-3 text-sm text-[var(--mute)]">
            Artist statement {isExampleWork(work) ? <span className="ex">Example</span> : null}
          </p>
        </section>
        <section>
          <p className="eyebrow">The object</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--charcoal)]">{material.spec}</p>
          <p className="mt-2 text-sm text-[var(--mute)]">{material.hanging}</p>
        </section>
        <section>
          <p className="eyebrow">Provenance</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--charcoal)]">
            Edition size is fixed. The certificate records the work, the material, the size and its number. It will be issued with the piece. It is not minted on-chain yet.
          </p>
        </section>
      </div>
    </div>
  )
}

function SizeChoices({
  families,
  more,
  selectedId,
  materialId,
  payable,
  onMore,
  onSelect,
}: {
  families: { name: string; sizes: Size[] }[]
  more: boolean
  selectedId?: string
  materialId: MaterialId
  payable: boolean
  onMore: () => void
  onSelect: (id: string) => void
}) {
  const selectedIndex = families.findIndex((family) => family.sizes.some((size) => size.id === selectedId))
  const shown = visibleSizes(families, selectedIndex, more)
  const hidden = hiddenSizeCount(families.length, false)
  return (
    <fieldset className="mt-8">
      <legend className="eyebrow">Size · cm</legend>
      <ul className="mt-3 border-t border-[var(--line)]">
        {shown.map((family) => {
          const current = family.sizes.find((size) => size.id === selectedId)
          const preferred = family.sizes.find((size) => size.orientation !== "landscape") ?? family.sizes[0]
          const pick = current ?? preferred
          const on = Boolean(current)
          const amount = payable && pick.prices[materialId] != null ? priceFor(pick, materialId, { numbered: true }) : null
          const orientations = orientationChoices(family.sizes)
          return (
            <li key={family.sizes[0]?.id ?? family.name} className="border-b border-[var(--line)]">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(pick.id)}
                className={`flex min-h-11 w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm ${on ? "bg-[var(--navy)] text-[var(--porcelain)]" : "bg-[var(--paper)]"}`}
              >
                <span>{family.name}</span>
                <span>{amount == null ? "Soon" : formatPrice(amount)}</span>
              </button>
              {on && orientations.length > 1 ? (
                <div className="flex gap-2 bg-[var(--paper)] px-3 py-2">
                  {orientations.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      aria-pressed={size.id === selectedId}
                      onClick={() => onSelect(size.id)}
                      className={`min-h-11 flex-1 border px-3 text-sm capitalize ${size.id === selectedId ? "border-[var(--navy)] bg-[var(--navy)] text-[var(--porcelain)]" : "border-[var(--line)] bg-[var(--paper)]"}`}
                    >
                      {size.orientation}
                    </button>
                  ))}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
      {hidden > 0 ? (
        <button type="button" onClick={onMore} className="mt-3 inline-flex min-h-11 items-center text-sm text-[var(--gold-ink)] underline underline-offset-4">
          {more ? "Fewer formats" : `More formats (${hidden})`}
        </button>
      ) : null}
    </fieldset>
  )
}
