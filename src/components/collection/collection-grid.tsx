"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { WorkImage } from "@/components/art/motif"
import { formatPrice, fromPrice, materialById, type MaterialId } from "@/config/catalogue"
import { works, type HouseWork, isExampleWork } from "@/config/works"
import { sizesFor } from "@/config/catalogue"

const houseWorks = works.filter((work) => work.artistSlug === "sj")
const offers = (work: HouseWork, id: MaterialId) => work.materialId === id || sizesFor(id).length > 0

const filters: { id: "all" | MaterialId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "real-glass", label: "Real glass" },
  { id: "acrylic", label: "Acrylic glass" },
  { id: "canvas", label: "Canvas" },
]

export function CollectionGrid({ items = houseWorks }: { items?: HouseWork[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all")
  const [shown, setShown] = useState(6)
  const visible = useMemo(() => {
    const next = filter === "all" ? items : items.filter((work) => offers(work, filter))
    return next.slice(0, shown)
  }, [filter, items, shown])
  const total = filter === "all" ? items.length : items.filter((work) => offers(work, filter)).length

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => {
              setFilter(item.id)
              setShown(6)
            }}
            className={`chip ${filter === item.id ? "on" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--mute)]">Nothing in this material yet.</p>
      ) : (
        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((work) => {
            const shownMaterial = filter === "all" ? work.materialId : filter
            const material = materialById(shownMaterial)
            const from = fromPrice(shownMaterial, { numbered: work.editionSize > 1 })
            return (
              <li key={work.slug}>
                <Link href={`/collection/${work.slug}${filter === "all" ? "" : `?material=${filter}`}`} className="art-card group block">
                  <div className="aspect-[4/5] overflow-hidden bg-[var(--bone)] shadow-[var(--shadow-art)]">
                    <WorkImage motif={work.motif} image={work.image} title={work.title} />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl italic">{work.title}</h3>
                      <p className="mt-1 text-sm text-[var(--mute)]">
                        {work.artist} {isExampleWork(work) ? <span className="ex">Example</span> : null}
                      </p>
                    </div>
                    <p className="text-right text-sm">
                      {from == null ? "Soon" : formatPrice(from)}
                      <span className="mt-1 block font-mono text-[10px] tracking-[0.12em] text-[var(--mute)] uppercase">
                        {material.name}
                      </span>
                    </p>
                  </div>
                  <p className="mt-2 font-mono text-[11px] tracking-[0.12em] text-[var(--gold-ink)] uppercase">
                    Edition of {work.editionSize}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {shown < total ? (
        <div className="mt-10 text-center">
          <button type="button" className="btn-ghost" onClick={() => setShown((count) => count + 6)}>
            Load more works
          </button>
        </div>
      ) : null}
    </div>
  )
}
