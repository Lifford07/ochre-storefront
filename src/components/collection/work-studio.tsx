"use client"

import { addToBasket } from "@/lib/basket"

import { isExampleWork } from "@/config/works"

import Link from "next/link"
import { useMemo, useState } from "react"
import { WorkImage } from "@/components/art/motif"
import { InspectPlate } from "@/components/gallery/inspect-plate"
import { WallCaption } from "@/components/gallery/wall-label"
import {
  formatPrice,
  materialById,
  materials,
  priceFor,
  sizes,
  sizesFor,
  type MaterialId,
} from "@/config/catalogue"
import type { HouseWork } from "@/config/works"
import { captionLine, wallFacts } from "@/lib/caption"

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
  const material = materialById(materialId)
  const options = useMemo(() => sizesFor(materialId), [materialId])
  const size = options.find((item) => item.id === sizeId) ?? options[0] ?? sizes.find((item) => item.id === work.sizeId)
  const price = size && size.prices[materialId] != null && material.payable ? priceFor(size, materialId, { numbered: true }) : null
  const left = Math.max(0, work.editionSize - taken)
  const nextNumber = Math.min(work.editionSize, taken + 1)
  const facts = wallFacts(work, materialId, size?.id ?? work.sizeId)
  const slides = work.image
    ? [
        {
          src: work.image,
          alt: work.title,
          title: work.title,
          description: captionLine(facts),
        },
      ]
    : []

  const plate = (
    <div className="plate-frame">
      <WorkImage motif={work.motif} image={work.image} title={work.title} />
    </div>
  )

  return (
    <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:gap-20">
      <div>
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--mute)] uppercase">
          <Link href="/collection" className="gallery-text-link">Collection</Link>
          <span> / </span>
          <Link href={`/artists/${work.artistSlug}`} className="gallery-text-link">{work.artist}</Link>
          <span> / {work.title}</span>
        </p>
        <figure className="mt-8">
          {room ? (
            <div className="grid min-h-[520px] place-items-center bg-[#e7e1d6] px-8 py-20">
              <div className="w-full max-w-sm">
                <div className="mx-auto w-1/2">
                  {slides.length > 0 ? <InspectPlate slides={slides}>{plate}</InspectPlate> : plate}
                </div>
                <div className="mt-8 h-16 bg-[#f7f4ee]" />
                <p className="mt-4 text-center font-mono text-[11px] tracking-[0.14em] text-[var(--mute)] uppercase">
                  Room view · stand-in
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl">
              {slides.length > 0 ? <InspectPlate slides={slides}>{plate}</InspectPlate> : plate}
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <button
              type="button"
              className="gallery-text-link min-h-11 text-xs tracking-[0.16em] uppercase"
              onClick={() => setRoom((value) => !value)}
            >
              {room ? "View the work" : "View in a room"}
            </button>
            <p className="text-xs tracking-[0.14em] text-[var(--mute)] uppercase">
              Shown in {material.name}
              {size ? ` · ${size.name}` : ""}
            </p>
          </div>
        </figure>
      </div>

      <div className="lg:pt-14">
        <p className="eyebrow">{work.artist} · edition</p>
        <h1 className="font-display mt-3 text-5xl md:text-6xl">{work.title}</h1>
        <p className="mt-3 text-[var(--charcoal)]">
          {work.artist} {isExampleWork(work) ? <span className="ex">Example</span> : null}
        </p>
        <WallCaption facts={facts} className="mt-8" />
        <p className="mt-6 font-mono text-[11px] tracking-[0.14em] text-[var(--gold-ink)] uppercase">
          {countKnown ? `No. ${String(nextNumber).padStart(2, "0")} · ${left} left` : "Count unavailable"}
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--mute)]">
          {countKnown
            ? "The number is written on the order when the payment clears."
            : "The edition count will show when the order store answers."}
        </p>

        <div className="gallery-rule mt-10" />

        <fieldset className="mt-10">
          <legend className="eyebrow">Material</legend>
          <div className="mt-4 space-y-2">
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

        <fieldset className="mt-10">
          <legend className="eyebrow">Size · cm</legend>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options.map((option) => {
              const on = option.id === size?.id
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSizeId(option.id)}
                  className={`border px-3 py-3 text-left text-sm ${on ? "border-[var(--navy)] bg-[var(--navy)] text-[var(--porcelain)]" : "border-[var(--line)] bg-[var(--paper)]"}`}
                >
                  {option.orientation === "square" ? option.name : `${option.name} · ${option.orientation}`}
                </button>
              )
            })}
          </div>
        </fieldset>

        <p className="font-display mt-10 text-5xl">{price == null ? "—" : formatPrice(price)}</p>
        <p className="mt-2 text-sm text-[var(--mute)]">
          ≈ USDC at checkout <span className="ex">Rate</span>
          <span className="mx-2">·</span>
          {material.lead}
        </p>

        {material.payable && price != null && countKnown && left > 0 && size ? (
          <Link
            href={`/collect/${work.slug}?material=${materialId}&size=${size.id}`}
            className="btn-gallery on-light mt-8 flex"
          >
            Collect
          </Link>
        ) : null}
        {material.payable && price != null && countKnown && left > 0 && size ? (
          <button
            type="button"
            className="btn-gallery quiet mt-3 flex w-full"
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
          <p className="mt-8 text-sm text-[var(--mute)]">
            {!material.payable || price == null
              ? `${material.name} is not priced for payment yet.`
              : !countKnown
                ? "Checkout is paused until the order store answers. Nothing was charged."
                : "This edition is complete."}
          </p>
        )}

        <div className="mt-6 flex items-center gap-4 border-t border-[var(--line)] pt-5">
          <div className="size-14 shrink-0 bg-[var(--bone)]">
            <WorkImage motif={work.motif} image={work.image} title="" />
          </div>
          <p className="text-sm leading-relaxed">
            Includes a Certificate of Edition. {left > 0 ? `Edition No. ${String(nextNumber).padStart(3, "0")} of ${work.editionSize}` : "Sold through"}.
          </p>
        </div>
      </div>

      <div className="grid gap-12 border-t border-[var(--line)] pt-16 md:grid-cols-3 lg:col-span-2">
        <section>
          <p className="eyebrow">About the work</p>
          <blockquote className="font-display mt-4 text-2xl italic">“{work.statement}”</blockquote>
          <p className="mt-4 text-sm text-[var(--mute)]">
            Artist statement {isExampleWork(work) ? <span className="ex">Example</span> : null}
          </p>
        </section>
        <section>
          <p className="eyebrow">The object</p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--charcoal)]">{material.spec}</p>
          <p className="mt-3 text-sm text-[var(--mute)]">{material.hanging}</p>
        </section>
        <section>
          <p className="eyebrow">Provenance</p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--charcoal)]">
            Edition size is fixed. The certificate records the work, the material, the size and its number. It will be issued with the piece. It is not minted on-chain yet.
          </p>
        </section>
      </div>
    </div>
  )
}
