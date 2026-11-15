"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { artworkSources } from "@/components/art/motif"
import { PathRail } from "@/components/house/path-rail"
import { formatPrice, fromPrice, materialById, priceFor, sizesFor, type MaterialId } from "@/config/catalogue"
import type { ShippingZone } from "@/lib/landed-price"
import { NAME_KEY } from "@/config/house"
import type { HouseWork } from "@/config/works"
import { addToBasket } from "@/lib/basket"

const offered: MaterialId[] = ["real-glass", "acrylic", "canvas"]

const WallPanel = dynamic(() => import("@/components/editor/wall-preview").then((m) => m.WallPanel), {
  ssr: false,
  loading: () => <p className="mt-4 text-sm">Opening the wall…</p>,
})

const zones: { id: ShippingZone; label: string }[] = [
  { id: "UK", label: "United Kingdom" },
  { id: "EU", label: "Ireland and the EU" },
  { id: "US", label: "United States" },
]

export function WorkBuy({ work }: { work: HouseWork }) {
  const [materialId, setMaterialId] = useState<MaterialId>(work.materialId === "canvas" || work.materialId === "acrylic" || work.materialId === "real-glass" ? work.materialId : "real-glass")
  const [sizeId, setSizeId] = useState(work.sizeId)
  const [zone, setZone] = useState<ShippingZone>("UK")
  const [name, setName] = useState("")
  const [nameError, setNameError] = useState("")
  const [wall, setWall] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    const id = window.setTimeout(() => setName(localStorage.getItem(NAME_KEY) || ""), 0)
    return () => window.clearTimeout(id)
  }, [])

  const options = useMemo(() => sizesFor(materialId), [materialId])
  const size = options.find((item) => item.id === sizeId) ?? options.find((item) => item.id === "sq30-square") ?? options[0]
  const material = materialById(materialId)
  const price = size ? priceFor(size, materialId, { zone, numbered: true }) : null
  const picture = work.image ? artworkSources(work.image).src : undefined

  function chooseMaterial(id: MaterialId) {
    setMaterialId(id)
    const next = sizesFor(id)
    if (!next.some((item) => item.id === sizeId) && next[0]) setSizeId(next[0].id)
    setStep(2)
  }

  function add() {
    if (!size || price == null) return
    if (work.personal && !name.trim()) {
      setNameError("Type the name that goes beneath it.")
      return
    }
    setNameError("")
    const buyerName = work.personal ? name.trim() : undefined
    if (buyerName) localStorage.setItem(NAME_KEY, buyerName)
    addToBasket({
      slug: work.slug,
      title: work.sub ? `${work.title}, ${work.sub}` : work.title,
      artist: work.artist,
      image: picture,
      materialId,
      materialName: material.name,
      sizeId: size.id,
      sizeName: size.orientation === "square" ? size.name : `${size.name} ${size.orientation}`,
      editionNumber: 1,
      editionSize: work.editionSize,
      pricePence: price,
      buyerName,
    })
    setStep(4)
  }

  return (
    <article className="work">
      <div className="work__stage" data-mode={wall ? "wall" : "work"}>
        <div className="stage__work">
          <div className="frame">
            <span className="pframe">
              {picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={picture} alt={`${work.title}, by ${work.artist}`} fetchPriority="high" />
              ) : null}
              {work.personal && name.trim() ? <span className="pname">{name.trim()}</span> : null}
            </span>
          </div>
        </div>
        {picture && size && wall ? (
          <div className="stage__wall">
            <WallPanel defaultOpen src={picture} widthMm={size.widthMm} heightMm={size.heightMm} materialId={materialId} materialName={material.name} sizeName={size.name} />
          </div>
        ) : null}
        {picture ? (
          <div className="seg" role="group" aria-label="View">
            <button type="button" className={wall ? "" : "on"} aria-pressed={!wall} onClick={() => setWall(false)}>The work</button>
            <button type="button" className={wall ? "on" : ""} aria-pressed={wall} onClick={() => { setWall(true); setStep(3) }}>On your wall</button>
          </div>
        ) : null}
      </div>
      <div className="work__info">
        <PathRail at={step} />
        <p className="crumbs mono"><Link href="/collection">Collection</Link> / Art</p>
        <h1>{work.title}{work.sub ? <> <em>{work.sub}</em></> : null}</h1>
        <p className="work__by mono">{work.artist} · {work.year} · Edition of {work.editionSize}</p>
        {work.fact ? <p className="work__fact">{work.fact}</p> : null}
        <div className="opt">
          <p className="opt__l mono">Material</p>
          <div className="chips chips--3">
            {offered.map((id) => {
              const item = materialById(id)
              const from = fromPrice(id, { zone, numbered: true })
              return (
                <button key={id} type="button" className={`chip${id === materialId ? " on" : ""}`} aria-pressed={id === materialId} onClick={() => chooseMaterial(id)}>
                  <span>{item.name.replace("Real ", "")}</span>
                  <small>{from == null ? "" : `from ${formatPrice(from)}`}</small>
                </button>
              )
            })}
          </div>
          <p className="opt__n">{material.line}</p>
        </div>
        <div className="opt">
          <p className="opt__l mono">Size</p>
          <div className="chips">
            {options.map((option) => {
              const on = option.id === size?.id
              const amount = priceFor(option, materialId, { zone, numbered: true })
              return (
                <button key={option.id} type="button" className={`chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => { setSizeId(option.id); setWall(true); setStep(3) }}>
                  <span>{option.orientation === "square" ? option.name : `${option.name} · ${option.orientation}`}</span>
                  <small>{formatPrice(amount)}</small>
                </button>
              )
            })}
          </div>
        </div>
        {work.personal ? (
          <label className="field" htmlFor="wNameIn">
            <span className="mono">Your name, beneath the fingerprint</span>
            <input
              id="wNameIn"
              type="text"
              maxLength={40}
              autoComplete="off"
              placeholder="Type your name"
              value={name}
              aria-required
              aria-invalid={nameError ? true : undefined}
              onChange={(event) => {
                setName(event.target.value)
                localStorage.setItem(NAME_KEY, event.target.value.trim())
                setNameError("")
              }}
            />
            <em className="err">{nameError}</em>
            <em className="fine mono">This edition is made with the buyer’s name beneath it.</em>
          </label>
        ) : null}
        <div className="buy">
          <div className="buy__row">
            <b className="amt">{price == null ? "—" : formatPrice(price)}</b>
            <label className="mono">
              Delivery included · to{" "}
              <select className="csel" value={zone} onChange={(event) => setZone(event.target.value as ShippingZone)} aria-label="Delivery country">
                {zones.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
          </div>
          <button type="button" className="btn btn--foil btn--block" onClick={add}>Add to bag</button>
          <p className="buy__lead mono">{material.lead}</p>
        </div>
      </div>
    </article>
  )
}
