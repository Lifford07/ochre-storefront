"use client"

import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import {
  BASES,
  FONTS,
  MAX_SYMBOLS,
  PALETTES,
  SHIELDS,
  SYMBOL_GROUPS,
  SYMBOLS,
} from "@/lib/crest/catalog"
import { createDefaultDesign } from "@/lib/crest/defaults"
import { priceDesign } from "@/lib/crest/pricing"
import { downloadDesignJson } from "@/lib/crest/serialize"
import type { CrestDesign, PlacedSymbol } from "@/lib/crest/types"
import { payWithSolanaPay } from "@/lib/jewellery/solana-pay-handoff"
import {
  UPLOAD_ACCEPT_ATTR,
  gateClientUpload,
  readFileAsDataUrl,
} from "@/lib/jewellery/uploadLimits"
import { BuilderChrome, type BuilderStep } from "@/components/builder/BuilderChrome"
import { LivePreview } from "@/components/jewellery/LivePreview"
import { SymbolGlyph } from "@/components/jewellery/SymbolGlyph"

const CREST_STEPS: BuilderStep[] = [
  { id: "base", label: "Base" },
  { id: "shield", label: "Shield" },
  { id: "palette", label: "Palette" },
  { id: "symbols", label: "Symbols" },
  { id: "upload", label: "Upload" },
  { id: "lettering", label: "Lettering" },
  { id: "review", label: "Review & pay" },
]

function uid() {
  return `sym_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Jewellery crest customiser — Mix Part A stepped builder.
 * Option/pricing core and Solana Pay checkout are unchanged; UI wraps them.
 */
export function CrestCustomiser() {
  const [design, setDesign] = useState<CrestDesign>(() => createDefaultDesign())
  const [query, setQuery] = useState("")
  const [group, setGroup] = useState<string>("all")
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestText, setRequestText] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState("")
  const [stepIndex, setStepIndex] = useState(0)

  const price = useMemo(() => priceDesign(design), [design])
  const palette = PALETTES.find((p) => p.id === design.paletteId)!

  const filteredSymbols = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SYMBOLS.filter((s) => {
      if (group !== "all" && s.group !== group) return false
      if (!q) return true
      return (
        s.label.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q)) ||
        s.id.includes(q)
      )
    })
  }, [query, group])

  const canContinueUpload = !design.upload.dataUrl || design.upload.attestedOwnCrest

  function patch(partial: Partial<CrestDesign>) {
    setDesign((d) => ({ ...d, ...partial }))
  }

  function addSymbol(symbolId: string) {
    if (design.symbols.length >= MAX_SYMBOLS) {
      setStatus(`You can place up to ${MAX_SYMBOLS} symbols.`)
      return
    }
    const next: PlacedSymbol = {
      instanceId: uid(),
      symbolId,
      x: 92 + design.symbols.length * 10,
      y: 100 + design.symbols.length * 8,
      scale: 1.15,
    }
    setDesign((d) => {
      if (d.symbols.length >= MAX_SYMBOLS) return d
      return { ...d, symbols: [...d.symbols, next] }
    })
    setSelectedInstanceId(next.instanceId)
    setStatus(`Added ${SYMBOLS.find((s) => s.id === symbolId)?.label ?? symbolId}`)
  }

  function removeSelectedSymbol() {
    if (!selectedInstanceId) return
    const id = selectedInstanceId
    setDesign((d) => ({ ...d, symbols: d.symbols.filter((s) => s.instanceId !== id) }))
    setSelectedInstanceId(null)
  }

  async function onUpload(file: File | null) {
    if (!file) {
      patch({
        upload: {
          fileName: null,
          mimeType: null,
          dataUrl: null,
          attestedOwnCrest: false,
          ochreRedrawNeeded: false,
        },
      })
      return
    }

    const gate = gateClientUpload(file)
    if (!gate.ok) {
      setStatus(gate.message)
      return
    }

    setBusy(true)
    setStatus("Reading upload…")
    try {
      const dataUrl = await readFileAsDataUrl(file)
      patch({
        upload: {
          fileName: file.name,
          mimeType: file.type || "image/jpeg",
          dataUrl,
          attestedOwnCrest: false,
          ochreRedrawNeeded: true,
        },
      })
      setStatus(
        'Upload attached — tick “My family’s crest” to continue. Order flagged “Ochré redraw needed”.',
      )
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setBusy(false)
    }
  }

  async function handleSolanaPay() {
    if (!canContinueUpload) {
      setStatus("Tick the crest ownership attestation before paying.")
      return
    }
    setBusy(true)
    try {
      const result = await payWithSolanaPay(design)
      setStatus(
        `${result.message} Live total £${price.total}. Existing Solana Pay checkout is untouched — wire window.__OCHRE_SOLANA_PAY__ when ready.`,
      )
    } finally {
      setBusy(false)
    }
  }

  const highValue = price.total >= 240 || design.baseId === "signet-ring"
  const stepId = CREST_STEPS[stepIndex]?.id

  function saveDesign() {
    downloadDesignJson(design)
    setStatus("Design saved as JSON — reopen anytime from the file.")
  }

  const preview = (
    <>
      <LivePreview
        design={design}
        selectedInstanceId={selectedInstanceId}
        onSelectInstance={setSelectedInstanceId}
        onMoveSymbol={(id, x, y) =>
          setDesign((d) => ({
            ...d,
            symbols: d.symbols.map((s) => (s.instanceId === id ? { ...s, x, y } : s)),
          }))
        }
        onScaleSymbol={(id, scale) =>
          setDesign((d) => ({
            ...d,
            symbols: d.symbols.map((s) => (s.instanceId === id ? { ...s, scale } : s)),
          }))
        }
      />
      {selectedInstanceId && stepId === "symbols" ? (
        <button
          type="button"
          className="mt-3 font-mono text-[10px] tracking-[0.16em] text-[color:var(--gallery-ochre)] uppercase"
          onClick={removeSelectedSymbol}
        >
          Remove selected symbol
        </button>
      ) : null}
    </>
  )

  let stepBody: ReactNode = null
  if (stepId === "base") {
    stepBody = (
      <div className="grid gap-3 sm:grid-cols-3">
        {BASES.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-pressed={design.baseId === b.id}
            aria-disabled={Boolean(b.comingSoon)}
            disabled={Boolean(b.comingSoon)}
            onClick={() => {
              if (b.comingSoon) return
              patch({ baseId: b.id })
            }}
            className={`choice ${design.baseId === b.id ? "choice-on" : ""} disabled:cursor-not-allowed disabled:opacity-45`}
          >
            <span className="block text-sm text-[color:var(--gallery-ink)]">{b.label}</span>
            <span className="mt-1 block text-xs text-[color:var(--gallery-muted)]">
              {b.comingSoon ? "Coming soon" : b.blurb}
            </span>
            <span className="mt-2 block text-xs text-[color:var(--gallery-ochre)]">
              {b.comingSoon ? "—" : `£${b.price}`}
            </span>
          </button>
        ))}
      </div>
    )
  } else if (stepId === "shield") {
    stepBody = (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {SHIELDS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={design.shieldId === s.id}
            onClick={() => patch({ shieldId: s.id })}
            className={`choice py-3 text-sm ${design.shieldId === s.id ? "choice-on" : ""}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    )
  } else if (stepId === "palette") {
    stepBody = (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={design.paletteId === p.id}
            onClick={() => patch({ paletteId: p.id })}
            className={`choice flex items-center gap-2 ${design.paletteId === p.id ? "choice-on" : ""}`}
          >
            <span
              className="h-5 w-5 rounded-full border border-white/20"
              style={{ background: `linear-gradient(135deg, ${p.metal}, ${p.metalDeep})` }}
            />
            <span className="text-xs">{p.label}</span>
          </button>
        ))}
      </div>
    )
  } else if (stepId === "symbols") {
    stepBody = (
      <>
        <p className="text-xs text-[color:var(--gallery-muted)]">
          {design.symbols.length}/{MAX_SYMBOLS} placed — drag on the preview to position.
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbols…"
          className="field mt-4"
          aria-label="Search symbols"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={`chip ${group === "all" ? "chip-on" : ""}`} onClick={() => setGroup("all")}>
            All
          </button>
          {SYMBOL_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`chip ${group === g.id ? "chip-on" : ""}`}
              onClick={() => setGroup(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {filteredSymbols.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => addSymbol(s.id)}
              className="choice flex items-center gap-2 text-left"
              disabled={design.symbols.length >= MAX_SYMBOLS}
            >
              <SymbolGlyph symbolId={s.id} stroke={palette.metal} size={22} />
              <span className="text-xs text-[color:var(--gallery-ink)]">{s.label}</span>
            </button>
          ))}
          {filteredSymbols.length === 0 ? (
            <p className="col-span-full text-sm text-[color:var(--gallery-muted)]">No symbols match.</p>
          ) : null}
        </div>
        <button
          type="button"
          className="mt-4 font-mono text-[10px] tracking-[0.16em] text-[color:var(--gallery-ochre)] uppercase underline-offset-4 hover:underline"
          onClick={() => setRequestOpen(true)}
        >
          Request a symbol
        </button>
      </>
    )
  } else if (stepId === "upload") {
    stepBody = (
      <>
        <p className="text-sm text-[color:var(--gallery-muted)]">
          Optional photo or sketch — shown inside the shield. Uploads are flagged{" "}
          <strong className="text-[color:var(--gallery-ochre)]">Ochré redraw needed</strong>.
        </p>
        <input
          type="file"
          accept={UPLOAD_ACCEPT_ATTR}
          disabled={busy}
          className="field mt-4 file:mr-3 file:border-0 file:bg-transparent file:text-[color:var(--gallery-ochre)] disabled:opacity-40"
          onChange={(e) => {
            const next = e.target.files?.[0] ?? null
            void onUpload(next)
            e.target.value = ""
          }}
        />
        {design.upload.fileName ? (
          <p className="mt-2 text-xs text-[color:var(--gallery-muted)]">
            File: {design.upload.fileName}
            {design.upload.ochreRedrawNeeded ? " · redraw flag on" : ""}
          </p>
        ) : null}
        <label
          className={`mt-4 flex items-start gap-3 text-sm text-[color:var(--gallery-ink)] ${
            design.upload.dataUrl ? "" : "opacity-50"
          }`}
        >
          <input
            type="checkbox"
            className="mt-1 accent-[color:var(--gallery-ochre)]"
            checked={design.upload.attestedOwnCrest}
            disabled={!design.upload.dataUrl || busy}
            aria-label="My family's crest"
            onChange={(e) => {
              patch({
                upload: { ...design.upload, attestedOwnCrest: e.target.checked },
              })
            }}
          />
          <span>My family&apos;s crest — this is our crest or my own design.</span>
        </label>
      </>
    )
  } else if (stepId === "lettering") {
    stepBody = (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-[color:var(--gallery-muted)]">Initials</span>
            <input
              className="field mt-1"
              value={design.initials}
              maxLength={4}
              onChange={(e) =>
                patch({ initials: e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) })
              }
              placeholder="OC"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[color:var(--gallery-muted)]">Motto</span>
            <input
              className="field mt-1"
              value={design.motto}
              maxLength={28}
              onChange={(e) => patch({ motto: e.target.value.slice(0, 28) })}
              placeholder="Made to last"
            />
          </label>
        </div>
        <div className="mt-4 space-y-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={design.fontId === f.id}
              onClick={() => patch({ fontId: f.id })}
              className={`choice flex w-full items-center justify-between ${design.fontId === f.id ? "choice-on" : ""}`}
            >
              <span className="text-sm">{f.label}</span>
              <span style={{ fontFamily: f.family }} className="text-lg text-[color:var(--gallery-ochre)]">
                Aa
              </span>
            </button>
          ))}
        </div>
      </>
    )
  } else if (stepId === "review") {
    stepBody = (
      <>
        <dl className="space-y-2 text-sm text-[color:var(--gallery-muted)]">
          <div className="flex justify-between gap-4">
            <dt>Base ({BASES.find((b) => b.id === design.baseId)?.label})</dt>
            <dd className="text-[color:var(--gallery-ink)]">£{price.base}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Symbols × {price.symbolCount}</dt>
            <dd className="text-[color:var(--gallery-ink)]">£{price.symbols}</dd>
          </div>
          {price.uploadRedraw > 0 ? (
            <div className="flex justify-between gap-4">
              <dt>Ochré redraw</dt>
              <dd className="text-[color:var(--gallery-ink)]">£{price.uploadRedraw}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 border-t border-[color:var(--gallery-line)] pt-2 text-base">
            <dt className="text-[color:var(--gallery-ink)]">Total</dt>
            <dd className="font-display text-2xl text-[color:var(--gallery-ink)]">£{price.total}</dd>
          </div>
        </dl>
        <label className="mt-4 block text-sm">
          <span className="text-[color:var(--gallery-muted)]">Email for the brief</span>
          <input
            className="field mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email for the brief"
            autoComplete="email"
          />
        </label>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={busy || !canContinueUpload}
            onClick={() => void handleSolanaPay()}
            className="btn-primary disabled:opacity-40"
          >
            Pay with Solana Pay
          </button>
          <Link href="/contact" className="btn-secondary text-center">
            Ask about card checkout
          </Link>
          {highValue ? (
            <a
              className="btn-secondary text-center"
              href="mailto:hello@ochre.studio?subject=Ochré%20jewellery%20consultation"
            >
              Book a consultation
            </a>
          ) : null}
          <Link className="btn-secondary text-center" href="/jewellery/commission">
            Tell us your idea — commission brief
          </Link>
        </div>
        <p className="mt-3 text-xs text-[color:var(--gallery-muted)]">
          Legal:{" "}
          <Link className="text-[color:var(--gallery-ochre)] underline" href="/terms">
            terms
          </Link>
          ,{" "}
          <Link className="text-[color:var(--gallery-ochre)] underline" href="/returns">
            returns
          </Link>
          .
        </p>
      </>
    )
  }

  return (
    <>
      <BuilderChrome
        title="Design your crest"
        eyebrow="Jewellery · personalisation"
        steps={CREST_STEPS}
        stepIndex={stepIndex}
        priceLabel={`Live total £${price.total}`}
        onBack={() => setStepIndex((i) => Math.max(0, i - 1))}
        onNext={() => {
          if (stepId === "upload" && !canContinueUpload) {
            setStatus("Tick the crest ownership attestation before continuing.")
            return
          }
          setStepIndex((i) => Math.min(CREST_STEPS.length - 1, i + 1))
        }}
        onSave={saveDesign}
        nextDisabled={stepId === "upload" && !canContinueUpload}
        preview={preview}
        status={status}
      >
        {stepBody}
      </BuilderChrome>

      {requestOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Request a symbol"
        >
          <div className="jewellery-museum w-full max-w-md border border-[color:var(--gallery-line)] bg-[color:var(--gallery-panel)] p-5">
            <h3 className="font-display text-2xl text-[color:var(--gallery-ink)]">Request a symbol</h3>
            <textarea
              id="request-a-symbol"
              className="field mt-4 min-h-28"
              placeholder="Describe the mark you need (e.g. river otter with spear)…"
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() => {
                  setStatus(
                    requestText.trim()
                      ? `Symbol request noted: “${requestText.trim()}”. We’ll sketch an Ochré original.`
                      : "Add a short description for your symbol request.",
                  )
                  if (requestText.trim()) {
                    setRequestOpen(false)
                    setRequestText("")
                  }
                }}
              >
                Submit request
              </button>
              <button type="button" className="btn-secondary" onClick={() => setRequestOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
