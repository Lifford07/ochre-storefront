"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { FlowHeader } from "@/components/shell/site-chrome"
import {
  CATALOGUE_NOTICE,
  formatPrice,
  fromPrice,
  materialById,
  materials,
  priceFor,
  printerLine,
  sizes,
  sizesFor,
  type MaterialId,
  type Orientation,
} from "@/config/catalogue"
import { loadEditorDraft, saveEditorDraft } from "@/lib/editor-draft"
import { preferredSizeId, scorePrint, verdictFor, type PrintScore } from "@/lib/quality"
import { editionWording } from "@/lib/edition"
import { saveToAccount } from "@/lib/save-to-account"
import { ingestFile, type IngestedPhoto, type IngestProgress } from "@/lib/ingest-file"
import { CARE_PROMISE, lookLabel, previewFilter, type Look } from "@/lib/copy"
import { centredOffset, PrintView, type FitMode } from "@/components/editor/print-view"
import { QualityMeter } from "@/components/editor/quality-meter"
import { RoomPreview } from "@/components/editor/room-preview"

const PayPanel = dynamic(() => import("@/components/checkout/pay-panel").then((mod) => mod.PayPanel), {
  ssr: false,
  loading: () => <p className="mt-6 text-sm text-[#5e574e]">Opening payment…</p>,
})

const COLOUR_NOTE =
  "A screen glows. Canvas prints softer and more matte. Acrylic and Gallery Bond are a 12-colour print and look deeper. The same photo will not match across materials."

type CanvasEdge = "mirror" | "fold" | "colour"
type EdgeInk = "ivory" | "ink" | "ochre"

const EDGE_INK: Record<EdgeInk, string> = {
  ivory: "#f3eee6",
  ink: "#1a1814",
  ochre: "#c4a574",
}

type Step = "upload" | "preview" | "material" | "size" | "checkout"

type Photo = {
  src: string
  blob: Blob
  width: number
  height: number
  name: string
  note?: string
}

const UPLOAD_EDITION = editionWording("upload", 1, 1)

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,.tif,.tiff,image/tiff,application/pdf,.pdf"

export function Editor() {
  const [step, setStep] = useState<Step>("upload")
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<IngestProgress | null>(null)
  const [printColour, setPrintColour] = useState(true)
  const [look, setLook] = useState<Look>("original")
  const [materialId, setMaterialId] = useState<MaterialId>("acrylic")
  const [orientation, setOrientation] = useState<Exclude<Orientation, "square">>("portrait")
  const [sizeId, setSizeId] = useState<string | null>(null)
  const [fit, setFit] = useState<FitMode>("fill")
  const [crop, setCrop] = useState<{ sizeId: string; x: number; y: number } | null>(null)
  const [wall, setWall] = useState(false)
  const [canvasEdge, setCanvasEdge] = useState<CanvasEdge>("mirror")
  const [edgeInk, setEdgeInk] = useState<EdgeInk>("ivory")
  const [softAck, setSoftAck] = useState(false)
  const [enhanceNote, setEnhanceNote] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const photoUrl = useRef<string | null>(null)
  const popped = useRef(false)
  const restored = useRef(false)

  useEffect(() => {
    if (restored.current) return
    restored.current = true
    void (async () => {
      try {
        const draft = await loadEditorDraft()
        const raw = sessionStorage.getItem("ochre-editor-meta")
        const meta = raw ? (JSON.parse(raw) as { step?: Step; materialId?: MaterialId; sizeId?: string | null; orientation?: "portrait" | "landscape"; softAck?: boolean }) : null
        if (draft?.blob) {
          const src = URL.createObjectURL(draft.blob)
          photoUrl.current = src
          setPhoto({ src, blob: draft.blob, width: draft.width, height: draft.height, name: draft.name, note: draft.note })
        }
        if (meta?.materialId && materials.some((item) => item.id === meta.materialId)) setMaterialId(meta.materialId)
        if (meta?.orientation) setOrientation(meta.orientation)
        if (meta?.sizeId) setSizeId(meta.sizeId)
        if (typeof meta?.softAck === "boolean") setSoftAck(meta.softAck)
        if (meta?.step) setStep(meta.step)
      } catch {
        // A failed draft read leaves the editor on the upload step.
      }
    })()
  }, [])

  useEffect(() => {
    if (!photo) return
    void saveEditorDraft({ blob: photo.blob, width: photo.width, height: photo.height, name: photo.name, note: photo.note }).catch(() => undefined)
    sessionStorage.setItem(
      "ochre-editor-meta",
      JSON.stringify({ step, materialId, sizeId, orientation, softAck }),
    )
  }, [photo, step, materialId, sizeId, orientation, softAck])

  useEffect(() => {
    function onPop(event: PopStateEvent) {
      const next = (event.state as { ochreStep?: Step } | null)?.ochreStep
      if (next !== "upload" && next !== "preview" && next !== "material" && next !== "size" && next !== "checkout") return
      popped.current = true
      setStep(next)
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  useEffect(() => {
    if (popped.current) {
      popped.current = false
      return
    }
    const current = (window.history.state as { ochreStep?: Step } | null)?.ochreStep
    if (!current) {
      window.history.replaceState({ ochreStep: step }, "")
      return
    }
    if (current === step) return
    window.history.pushState({ ochreStep: step }, "")
  }, [step])

  const material = materialById(materialId)
  const sizeOptions = useMemo(() => {
    if (!photo) return []
    return sizesFor(materialId, orientation).map((size) => ({
      size,
      score: scorePrint(photo.width, photo.height, size.widthMm, size.heightMm),
      price: priceFor(size, materialId),
    }))
  }, [photo, materialId, orientation])

  const suggestedSizeId = useMemo(
    () =>
      preferredSizeId(
        sizeOptions.map((option) => ({
          id: option.size.id,
          area: option.size.widthMm * option.size.heightMm,
          band: option.score.band,
        })),
      ),
    [sizeOptions],
  )

  const activeSizeId = sizeOptions.some((option) => option.size.id === sizeId) ? sizeId : suggestedSizeId
  const selected = sizeOptions.find((option) => option.size.id === activeSizeId) ?? null

  const offset =
    photo && selected
      ? crop && crop.sizeId === selected.size.id
        ? { x: crop.x, y: crop.y }
        : centredOffset(photo.width, photo.height, selected.size.widthMm, selected.size.heightMm)
      : { x: 0, y: 0 }

  const adopt = useCallback((next: Photo) => {
    if (photoUrl.current && photoUrl.current !== next.src) URL.revokeObjectURL(photoUrl.current)
    photoUrl.current = next.src.startsWith("blob:") ? next.src : null
    setPhoto(next)
    setCrop(null)
    setError(null)
    setStep("preview")
  }, [])

  function adoptIngested(ingested: IngestedPhoto) {
    void saveToAccount(ingested.blob, ingested.name)
    adopt({
      src: URL.createObjectURL(ingested.blob),
      blob: ingested.blob,
      width: ingested.width,
      height: ingested.height,
      name: ingested.name,
      note: ingested.note,
    })
  }

  async function readFile(file: File) {
    setProgress({ label: "Reading your file…", percent: 4 })
    setError(null)
    try {
      adoptIngested(await ingestFile(file, setProgress))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That file could not be read.")
    } finally {
      setProgress(null)
    }
  }

  async function loadSample() {
    setProgress({ label: "Reading the sample…", percent: 8 })
    setError(null)
    try {
      const response = await fetch("/sample-photo.jpg")
      if (!response.ok) throw new Error("The sample photo did not load. Refresh and try again.")
      const blob = await response.blob()
      const file = new File([blob], "sample-photo.jpg", { type: "image/jpeg" })
      adoptIngested(await ingestFile(file, setProgress))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The sample photo did not load.")
    } finally {
      setProgress(null)
    }
  }

  function showEnhanceNote() {
    setEnhanceNote(true)
  }

  function chooseOrientation(next: Exclude<Orientation, "square">) {
    setOrientation(next)
    if (!sizeId) return
    const current = sizes.find((size) => size.id === sizeId)
    if (!current) return
    const match = sizes.find(
      (size) =>
        size.family === current.family &&
        (size.orientation === next || size.orientation === "square") &&
        size.prices[materialId] != null,
    )
    if (match) setSizeId(match.id)
  }

  const filter = previewFilter(printColour, look)
  const needsSoftAck = selected != null && selected.score.band !== "green"
  const canReady = Boolean(selected && (!needsSoftAck || softAck))

  return (
    <div className="min-h-dvh bg-[var(--porcelain)]">
      <FlowHeader step={step} onBack={step === "upload" ? undefined : () => setStep(previousStep(step))} />
      <p className="border-b border-[var(--line)] bg-[var(--paper)] px-5 py-2 text-center text-sm">{CARE_PROMISE}</p>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 md:px-8 md:pb-10">
        {step === "upload" ? (
          <UploadStep
            progress={progress}
            error={error}
            fileRef={fileRef}
            onFile={(file) => void readFile(file)}
            onSample={() => void loadSample()}
          />
        ) : null}

        {step === "preview" && photo ? (
          <PreviewStep
            photo={photo}
            filter={filter}
            printColour={printColour}
            look={look}
            onPrintColour={setPrintColour}
            onLook={setLook}
            onContinue={() => setStep("material")}
          />
        ) : null}

        {step === "material" ? (
          <MaterialStep
            selected={materialId}
            onSelect={setMaterialId}
            onContinue={() => {
              setSizeId((current) => current ?? suggestedSizeId)
              setStep("size")
            }}
          />
        ) : null}

        {step === "size" && photo && selected ? (
          <SizeStep
            photo={photo}
            material={material}
            options={sizeOptions}
            selectedId={selected.size.id}
            selectedScore={selected.score}
            orientation={orientation}
            fit={fit}
            offset={offset}
            filter={filter}
            wall={wall}
            canvasEdge={canvasEdge}
            edgeInk={edgeInk}
            canReady={canReady}
            needsSoftAck={needsSoftAck}
            softAck={softAck}
            enhanceNote={enhanceNote}
            error={error}
            onFit={setFit}
            onOffset={(next) => setCrop({ sizeId: selected.size.id, x: next.x, y: next.y })}
            onSelectSize={(id) => {
              setSizeId(id)
              setWall(false)
              setSoftAck(false)
            }}
            onOrientation={chooseOrientation}
            onWall={setWall}
            onEnhance={showEnhanceNote}
            onSoftAck={setSoftAck}
            onCanvasEdge={setCanvasEdge}
            onEdgeInk={setEdgeInk}
            onReady={() => {
              if (!canReady) return
              setStep("checkout")
            }}
          />
        ) : null}

        {step === "checkout" && photo && selected ? (
          <Checkout
            photo={photo}
            materialName={material.name}
            sizeName={sizeLabel(selected.size)}
            widthMm={selected.size.widthMm}
            heightMm={selected.size.heightMm}
            price={selected.price}
            score={selected.score}
            payable={material.payable}
            lead={material.lead}
            materialId={materialId}
            sizeId={selected.size.id}
            canvasEdge={materialId === "canvas" ? canvasEdge : undefined}
            fit={fit}
            offset={offset}
            filter={filter}
            look={look}
            colourOptimise={printColour}
            enhance={enhanceNote ? "preview-only" : "none"}
            softAck={softAck}
            edgeColour={EDGE_INK[edgeInk]}
          />
        ) : null}
      </main>
    </div>
  )
}

function previousStep(step: Step): Step {
  if (step === "preview") return "upload"
  if (step === "material") return "preview"
  if (step === "size") return "material"
  return "size"
}

function sizeLabel(size: { name: string; orientation: Orientation }) {
  if (size.orientation === "square") return size.name
  const facing = size.orientation === "portrait" ? "portrait" : "landscape"
  return `${size.name} · ${facing}`
}

function UploadStep({
  progress,
  error,
  fileRef,
  onFile,
  onSample,
}: {
  progress: IngestProgress | null
  error: string | null
  fileRef: RefObject<HTMLInputElement | null>
  onFile: (file: File) => void
  onSample: () => void
}) {
  return (
    <section className="mx-auto max-w-lg">
      <h1 className="font-display text-5xl">Begin with your image.</h1>
      <p className="mt-3 text-base leading-relaxed text-[#3c3832]">
        It becomes real glass, fine-art acrylic, Gallery Bond, canvas, or porcelain. One step at a time.
      </p>
      <label
        className="mt-8 flex min-h-52 cursor-pointer flex-col items-center justify-center border border-dashed border-[#1a1814]/40 bg-[#faf6f1] px-6 py-10 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          const file = event.dataTransfer.files[0]
          if (file) onFile(file)
        }}
      >
        {progress ? (
          <ProgressLine progress={progress} />
        ) : (
          <>
            <span className="text-base">Choose a file</span>
            <span className="mt-2 text-sm text-[#5e574e]">JPG, PNG, WEBP, HEIC, TIFF, or a PDF · up to 25MB</span>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={Boolean(progress)}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onFile(file)
            event.target.value = ""
          }}
        />
      </label>
      {error ? <p className="mt-3 text-sm text-[#8d3428]">{error}</p> : null}
      <button
        type="button"
        className="mt-6 cursor-pointer text-sm underline underline-offset-4 disabled:opacity-50"
        onClick={onSample}
        disabled={Boolean(progress)}
      >
        Use a sample photo
      </button>
      <p className="mt-2 text-xs leading-relaxed text-[#5e574e]">
        The sample is 2000 × 2800 pixels. Small sizes read Perfect, mid sizes read Good, and the largest sizes are too
        small to print.
      </p>
    </section>
  )
}

function ProgressLine({ progress }: { progress: IngestProgress }) {
  return (
    <span className="w-full max-w-xs">
      <span className="block text-base">{progress.label}</span>
      <span className="mt-3 block h-1.5 overflow-hidden bg-[#e7dfd4]">
        <span className="block h-full bg-[#1a1814]" style={{ width: `${progress.percent}%` }} />
      </span>
    </span>
  )
}

function PreviewStep({
  photo,
  filter,
  printColour,
  look,
  onPrintColour,
  onLook,
  onContinue,
}: {
  photo: Photo
  filter?: string
  printColour: boolean
  look: Look
  onPrintColour: (value: boolean) => void
  onLook: (look: Look) => void
  onContinue: () => void
}) {
  return (
    <section className="grid gap-8 md:grid-cols-2 md:items-start">
      <div className="bg-[#e7dfd4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt="Your photo"
          className="mx-auto max-h-[70vh] w-full object-contain"
          style={{ filter }}
        />
      </div>
      <div>
        <h1 className="font-display text-5xl">Edit</h1>
        <p className="mt-2 text-sm text-[#5e574e]">
          {photo.width} × {photo.height} pixels. The crop locks to the size you pick next.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#3c3832]">{COLOUR_NOTE}</p>
        {photo.note ? <p className="mt-2 text-sm text-[#5e574e]">{photo.note}</p> : null}
        <div className="mt-6">
          <Toggle
            pressed={printColour}
            onClick={() => onPrintColour(!printColour)}
            title="Colour optimise"
            detail={
              printColour
                ? "On. This is baked into the print file, not only the preview."
                : "Off. The print file keeps the colour you uploaded."
            }
          />
        </div>
        <div className="mt-4">
          <p className="text-sm text-[#5e574e]">Filter · baked into the print file</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["original", "bw", "sepia"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={look === item}
                onClick={() => onLook(item)}
                className={`px-3 py-1 text-sm ${look === item ? "bg-[#1a1814] text-[#f6f1ea]" : "bg-[#e7dfd4]"}`}
              >
                {lookLabel(item)}
              </button>
            ))}
          </div>
        </div>
        <Button className="btn-foil mt-8 h-14 w-full text-base md:w-auto md:px-10" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </section>
  )
}

function Toggle({
  pressed,
  onClick,
  title,
  detail,
}: {
  pressed: boolean
  onClick: () => void
  title: string
  detail: string
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="flex w-full items-start justify-between gap-4 border border-border bg-[#faf6f1] px-4 py-3 text-left"
    >
      <span>
        <span className="block text-base">{title}</span>
        <span className="mt-1 block text-sm text-[#5e574e]">{detail}</span>
      </span>
      <span
        className={`mt-1 shrink-0 rounded-full px-3 py-1 text-xs tracking-wide ${pressed ? "bg-[#1a1814] text-[#f6f1ea]" : "bg-[#e7dfd4] text-[#1a1814]"}`}
      >
        {pressed ? "On" : "Off"}
      </span>
    </button>
  )
}

function MaterialStep({
  selected,
  onSelect,
  onContinue,
}: {
  selected: MaterialId
  onSelect: (id: MaterialId) => void
  onContinue: () => void
}) {
  return (
    <section className="mx-auto max-w-lg">
      <h1 className="font-display text-5xl">Material</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5e574e]">{CATALOGUE_NOTICE}</p>
      <div className="mt-6 space-y-2">
        {materials.filter((item) => item.id !== "card").map((item) => {
          const on = selected === item.id
          const from = fromPrice(item.id)
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(item.id)}
              className={`w-full border px-4 py-4 text-left ${on ? "border-[#1a1814] bg-[#1a1814] text-[#f6f1ea]" : "border-border bg-[#faf6f1]"}`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-lg">{item.name}</span>
                <span className={`shrink-0 text-sm whitespace-nowrap ${on ? "text-[#f6f1ea]/80" : "text-[#5e574e]"}`}>
                  {from == null ? "Not priced" : `from ${formatPrice(from)}`}
                </span>
              </span>
              <span className={`mt-1 block text-sm ${on ? "text-[#f6f1ea]/80" : "text-[#5e574e]"}`}>{item.line}</span>
              <span className={`mt-1 block text-xs ${on ? "text-[#f6f1ea]/70" : "text-[#5e574e]"}`}>{item.spec}</span>
              {item.mark ? (
                <span className={`mt-2 inline-block border px-2 py-0.5 text-xs tracking-wide ${on ? "border-[#f6f1ea]/40" : "border-[#1a1814]/30"}`}>
                  {item.mark}
                </span>
              ) : null}
              <span className={`mt-2 block text-xs ${on ? "text-[#f6f1ea]/70" : "text-[#5e574e]"}`}>
                {printerLine(item)}
              </span>
              {item.note ? (
                <span className={`mt-1 block text-xs ${on ? "text-[#f6f1ea]/70" : "text-[#5e574e]"}`}>{item.note}</span>
              ) : null}
            </button>
          )
        })}
      </div>
      <Button className="btn-foil mt-8 h-14 w-full text-base" disabled={fromPrice(selected) == null} onClick={onContinue}>
        Continue
      </Button>
      {fromPrice(selected) == null ? (
        <p className="mt-2 text-xs text-[#5e574e]">This material stays off sale until it has a landed cost.</p>
      ) : null}
    </section>
  )
}

function SizeStep({
  photo,
  material,
  options,
  selectedId,
  selectedScore,
  orientation,
  fit,
  offset,
  filter,
  wall,
  canvasEdge,
  edgeInk,
  canReady,
  needsSoftAck,
  softAck,
  enhanceNote,
  error,
  onFit,
  onOffset,
  onSelectSize,
  onOrientation,
  onWall,
  onEnhance,
  onSoftAck,
  onReady,
  onCanvasEdge,
  onEdgeInk,
}: {
  photo: Photo
  material: { name: string; note?: string; mark?: string; id: MaterialId; lead: string }
  options: { size: { id: string; name: string; widthMm: number; heightMm: number; orientation: Orientation }; score: PrintScore; price: number }[]
  selectedId: string
  selectedScore: PrintScore
  orientation: Exclude<Orientation, "square">
  fit: FitMode
  offset: { x: number; y: number }
  filter?: string
  wall: boolean
  canvasEdge: CanvasEdge
  edgeInk: EdgeInk
  canReady: boolean
  needsSoftAck: boolean
  softAck: boolean
  enhanceNote: boolean
  error: string | null
  onFit: (fit: FitMode) => void
  onOffset: (offset: { x: number; y: number }) => void
  onSelectSize: (id: string) => void
  onOrientation: (orientation: Exclude<Orientation, "square">) => void
  onWall: (wall: boolean) => void
  onEnhance: () => void
  onSoftAck: (value: boolean) => void
  onReady: () => void
  onCanvasEdge: (edge: CanvasEdge) => void
  onEdgeInk: (ink: EdgeInk) => void
}) {
  const chosen = options.find((option) => option.size.id === selectedId)!

  return (
    <section className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
      <div>
        <div className="mb-3 flex gap-2 text-sm">
          <button
            type="button"
            className={`px-3 py-1 ${!wall ? "bg-[#1a1814] text-[#f6f1ea]" : "bg-[#e7dfd4]"}`}
            onClick={() => onWall(false)}
          >
            Crop
          </button>
          <button
            type="button"
            className={`px-3 py-1 ${wall ? "bg-[#1a1814] text-[#f6f1ea]" : "bg-[#e7dfd4]"}`}
            onClick={() => onWall(true)}
          >
            On the wall
          </button>
        </div>
        {wall ? (
          <div className="mx-auto w-full max-w-md">
            <RoomPreview
              src={photo.src}
              imageWidth={photo.width}
              imageHeight={photo.height}
              widthMm={chosen.size.widthMm}
              heightMm={chosen.size.heightMm}
              offsetX={offset.x}
              offsetY={offset.y}
              fit={fit}
              filter={filter}
              materialId={material.id}
              sizeName={`${sizeLabel(chosen.size)} ${material.name.toLowerCase()}`}
            />
          </div>
        ) : (
          <>
            <div
              className="mx-auto w-full"
              style={{ maxWidth: `min(100%, calc(38vh * ${chosen.size.widthMm} / ${chosen.size.heightMm}))` }}
            >
              <PrintView
                src={photo.src}
                imageWidth={photo.width}
                imageHeight={photo.height}
                widthMm={chosen.size.widthMm}
                heightMm={chosen.size.heightMm}
                offsetX={offset.x}
                offsetY={offset.y}
                fit={fit}
                filter={filter}
                edge={material.id === "canvas" ? canvasEdge : "mirror"}
                edgeColour={EDGE_INK[edgeInk]}
                interactive
                onOffsetChange={(x, y) => onOffset({ x, y })}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                className={`px-3 py-1 ${fit === "fill" ? "bg-[#1a1814] text-[#f6f1ea]" : "bg-[#e7dfd4]"}`}
                onClick={() => onFit("fill")}
              >
                Fill
              </button>
              <button
                type="button"
                className={`px-3 py-1 ${fit === "fit" ? "bg-[#1a1814] text-[#f6f1ea]" : "bg-[#e7dfd4]"}`}
                onClick={() => onFit("fit")}
              >
                Fit
              </button>
              <span className="self-center text-xs text-[#5e574e]">
                {fit === "fill" ? "Drag to move the crop." : "The whole photo, with space around it."}
              </span>
            </div>
          </>
        )}
      </div>

      <div>
        <h1 className="font-display text-5xl">Size</h1>
        <p className="mt-2 text-sm text-[#5e574e]">
          {material.name}
          {material.mark ? ` · ${material.mark}` : ""}. {material.lead}
        </p>
        {material.note ? <p className="mt-2 text-sm text-[#5e574e]">{material.note}</p> : null}
        <div className="mt-4 flex gap-2 text-sm">
          <button
            type="button"
            className={`px-3 py-1 ${orientation === "portrait" ? "bg-[#1a1814] text-[#f6f1ea]" : "bg-[#e7dfd4]"}`}
            onClick={() => onOrientation("portrait")}
          >
            Portrait
          </button>
          <button
            type="button"
            className={`px-3 py-1 ${orientation === "landscape" ? "bg-[#1a1814] text-[#f6f1ea]" : "bg-[#e7dfd4]"}`}
            onClick={() => onOrientation("landscape")}
          >
            Landscape
          </button>
        </div>
        <div className="mt-5">
          <QualityMeter score={selectedScore} />
        </div>
        {selectedScore.band !== "green" ? (
          <div className="mt-4">
            <Button className="h-12 w-full text-base" onClick={onEnhance}>
              About sharpening
            </Button>
            {enhanceNote ? (
              <p className="mt-2 text-xs leading-relaxed text-[#5e574e]">
                Smoothing a larger preview does not add detail. The print file uses your original pixels, and the meter stays where it is.
              </p>
            ) : null}
            <label className="mt-3 flex items-start gap-3 text-sm">
              <input type="checkbox" checked={softAck} onChange={(event) => onSoftAck(event.target.checked)} className="mt-1 size-4 accent-[#1a1814]" />
              <span>This size may print soft. Print it anyway.</span>
            </label>
            {error ? <p className="mt-2 text-sm text-[#8d3428]">{error}</p> : null}
          </div>
        ) : null}
        {material.id === "canvas" ? (
          <div className="mt-5">
            <p className="text-sm text-[#5e574e]">Canvas edge · 2.5 cm stretcher. Edges are included in the price.</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {(
                [
                  ["mirror", "Mirrored"],
                  ["fold", "Folded"],
                  ["colour", "Solid colour"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={canvasEdge === id}
                  onClick={() => onCanvasEdge(id)}
                  className={`px-3 py-1 ${canvasEdge === id ? "bg-[#1a1814] text-[#f6f1ea]" : "bg-[#e7dfd4]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {canvasEdge === "fold" ? (
              <p className="mt-2 text-xs text-[#5e574e]">The dashed line is the wrap. Mirrored is the default, so nothing extra is cropped.</p>
            ) : null}
            {canvasEdge === "colour" ? (
              <div className="mt-2 flex gap-2 text-sm">
                {(
                  [
                    ["ivory", "Ivory"],
                    ["ink", "Ink"],
                    ["ochre", "Ochre"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={edgeInk === id}
                    onClick={() => onEdgeInk(id)}
                    className={`px-3 py-1 ${edgeInk === id ? "bg-[#1a1814] text-[#f6f1ea]" : "bg-[#e7dfd4]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <p className="mt-5 text-sm text-[var(--charcoal)]">{UPLOAD_EDITION}. Your photograph is made once.</p>
        <div className="mt-5 space-y-2">
          {options.map((option) => {
            const soft = option.score.band === "red"
            const on = option.size.id === selectedId
            return (
              <button
                key={option.size.id}
                type="button"
                aria-pressed={on}
                onClick={() => onSelectSize(option.size.id)}
                className={`flex w-full items-center justify-between gap-3 border px-4 py-3 text-left ${on ? "border-[#1a1814] bg-[#1a1814] text-[#f6f1ea]" : "border-border bg-[#faf6f1]"}`}
              >
                <span>
                  <span className="block">{sizeLabel(option.size)}</span>
                  <span className={`block text-xs ${on ? "text-[#f6f1ea]/75" : "text-[#5e574e]"}`}>
                    {option.size.widthMm} × {option.size.heightMm} mm · {Math.round(option.score.dpi)} DPI
                    {soft ? ` · ${option.score.message}` : ""}
                  </span>
                </span>
                <span className="text-sm">{formatPrice(option.price)}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-6 hidden md:block">
          <Button className="btn-foil h-14 w-full text-base" disabled={!canReady} onClick={onReady}>
            Ready
          </Button>
          {!canReady && needsSoftAck ? (
            <p className="mt-2 text-xs text-[var(--mute)]">Tick print it anyway, or choose a size the meter calls sharp.</p>
          ) : null}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-[#f3eee6]/95 p-4 md:hidden">
        <Button className="btn-foil h-14 w-full text-base" disabled={!canReady} onClick={onReady}>
          Ready
        </Button>
        {!canReady && needsSoftAck ? (
          <p className="mt-2 text-xs text-[var(--mute)]">Tick print it anyway, or choose a size the meter calls sharp.</p>
        ) : null}
      </div>
    </section>
  )
}

function Checkout({
  photo,
  materialName,
  sizeName,
  widthMm,
  heightMm,
  price,
  score,
  payable,
  lead,
  materialId,
  sizeId,
  canvasEdge,
  fit,
  offset,
  filter,
  look,
  colourOptimise,
  enhance,
  softAck,
  edgeColour,
}: {
  photo: Photo
  materialName: string
  sizeName: string
  widthMm: number
  heightMm: number
  price: number
  score: PrintScore
  payable: boolean
  lead: string
  materialId: MaterialId
  sizeId: string
  canvasEdge?: CanvasEdge
  fit: FitMode
  offset: { x: number; y: number }
  filter?: string
  look: Look
  colourOptimise: boolean
  enhance: "preview-only" | "none"
  softAck: boolean
  edgeColour: string
}) {
  return (
    <section>
      <p className="text-center font-mono text-[11px] tracking-[0.18em] text-[var(--gold-ink)] uppercase">05 · Ready</p>
      <h1 className="font-display mt-3 text-center text-5xl md:text-6xl">Ready to be made.</h1>
      <p className="mt-2 text-center text-[var(--charcoal)]">One page. No account needed. {UPLOAD_EDITION}.</p>
      {!payable ? (
        <p className="mt-8 text-center text-sm text-[var(--mute)]">This material is not priced, so it cannot be paid for yet.</p>
      ) : (
        <div className="mt-10">
          <PayPanel
            materialId={materialId}
            sizeId={sizeId}
            editionRun={1}
            dpi={score.dpi}
            canvasEdge={canvasEdge}
            pricePence={price}
            photoBlob={photo.blob}
            printJob={{
              width: photo.width,
              height: photo.height,
              widthMm,
              heightMm,
              offsetX: offset.x,
              offsetY: offset.y,
              fit,
              filter,
              edge: canvasEdge,
              edgeColour,
              look,
              colourOptimise,
              enhance,
              qualityBand: score.band,
              softPrintAcknowledged: softAck,
            }}
            summary={{
              title: "Your image",
              materialName,
              sizeName: `${sizeName} · ${widthMm} × ${heightMm} mm`,
              editionLabel: UPLOAD_EDITION,
              dpi: score.dpi,
              bandLabel: `${verdictFor(score.band)} · ${Math.round(score.dpi)} DPI`,
              lead,
              previewSrc: photo.src,
            }}
          />
        </div>
      )}
    </section>
  )
}
