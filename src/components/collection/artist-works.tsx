"use client"

import Link from "next/link"
import { useState } from "react"
import { WorkImage } from "@/components/art/motif"
import type { HouseWork } from "@/config/works"

const PAGE = 6

export function ArtistWorks({ works }: { works: HouseWork[] }) {
  const [shown, setShown] = useState(PAGE)
  const visible = works.slice(0, shown)
  return (
    <>
      <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((work, index) => (
          <li key={work.slug}>
            <Link href={`/collection/${work.slug}`} className="art-card block">
              <div className="aspect-[4/5] bg-[var(--bone)] shadow-[var(--shadow-art)]">
                <WorkImage motif={work.motif} image={work.image} title={work.title} priority={index === 0} sizes="(min-width: 1024px) 33vw, 92vw" />
              </div>
              <h3 className="font-display mt-4 text-2xl italic">{work.title}</h3>
              <p className="mt-2 font-mono text-[11px] tracking-[0.12em] text-[var(--gold-ink)] uppercase">
                Edition of {work.editionSize}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {shown < works.length ? (
        <div className="mt-10 text-center">
          <button type="button" className="btn-ghost" onClick={() => setShown((count) => count + PAGE)}>
            Load more works
          </button>
        </div>
      ) : null}
    </>
  )
}
