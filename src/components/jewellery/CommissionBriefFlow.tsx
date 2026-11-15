"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { BuilderChrome, type BuilderStep } from "@/components/builder/BuilderChrome"

const STEPS: BuilderStep[] = [
  { id: "idea", label: "Your idea" },
  { id: "craft", label: "Craft notes" },
  { id: "contact", label: "Contact" },
  { id: "review", label: "Review" },
]

type Brief = {
  idea: string
  lineage: string
  metals: string
  references: string
  name: string
  email: string
}

const empty: Brief = {
  idea: "",
  lineage: "",
  metals: "",
  references: "",
  name: "",
  email: "",
}

/** Calm stepped commission brief — Ochré copy only. */
export function CommissionBriefFlow() {
  const [stepIndex, setStepIndex] = useState(0)
  const [brief, setBrief] = useState<Brief>(empty)
  const [status, setStatus] = useState<string | null>(null)

  const stepId = STEPS[stepIndex]?.id
  const canConsult = brief.idea.trim().length > 12 && brief.email.includes("@")

  const preview = useMemo(
    () => (
      <div className="preview-stage relative overflow-hidden border border-[color:var(--gallery-line)] bg-[color:var(--gallery-panel)] p-6">
        <div className="gold-leaf-shimmer pointer-events-none absolute inset-0 opacity-25" aria-hidden />
        <p className="relative font-mono text-[10px] tracking-[0.22em] text-[color:var(--gallery-muted)] uppercase">
          Commission preview
        </p>
        <h2 className="font-display relative mt-4 text-3xl text-[color:var(--gallery-ink)]">
          {brief.idea.trim() || "Your crest, from scratch"}
        </h2>
        <p className="relative mt-3 text-sm leading-relaxed text-[color:var(--gallery-muted)]">
          {brief.lineage.trim() ||
            "Share lineage, symbols that matter, and how the piece should live — wall, hand, or table."}
        </p>
        {brief.metals.trim() ? (
          <p className="relative mt-4 font-mono text-[10px] tracking-[0.16em] text-[color:var(--gallery-ochre)] uppercase">
            Metals · {brief.metals}
          </p>
        ) : null}
      </div>
    ),
    [brief.idea, brief.lineage, brief.metals],
  )

  function saveBrief() {
    const blob = new Blob(
      [JSON.stringify({ kind: "ochre-commission-brief", brief, savedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ochre-commission-brief.json"
    a.click()
    URL.revokeObjectURL(url)
    setStatus("Brief saved as JSON.")
  }

  let body = null
  if (stepId === "idea") {
    body = (
      <label className="block text-sm">
        <span className="text-[color:var(--gallery-muted)]">What should this crest hold?</span>
        <textarea
          className="field mt-2 min-h-36"
          value={brief.idea}
          onChange={(e) => setBrief((b) => ({ ...b, idea: e.target.value }))}
          placeholder="A quiet mark for a family workshop — oak, river, and a maker’s year…"
          aria-label="Your idea"
        />
      </label>
    )
  } else if (stepId === "craft") {
    body = (
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="text-[color:var(--gallery-muted)]">Lineage & meaning</span>
          <textarea
            className="field mt-2 min-h-28"
            value={brief.lineage}
            onChange={(e) => setBrief((b) => ({ ...b, lineage: e.target.value }))}
            aria-label="Lineage and meaning"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[color:var(--gallery-muted)]">Metals & finish</span>
          <input
            className="field mt-2"
            value={brief.metals}
            onChange={(e) => setBrief((b) => ({ ...b, metals: e.target.value }))}
            placeholder="Yellow gold, rose, silver…"
            aria-label="Metals and finish"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[color:var(--gallery-muted)]">References (optional)</span>
          <textarea
            className="field mt-2 min-h-24"
            value={brief.references}
            onChange={(e) => setBrief((b) => ({ ...b, references: e.target.value }))}
            aria-label="References"
          />
        </label>
      </div>
    )
  } else if (stepId === "contact") {
    body = (
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[color:var(--gallery-muted)]">Name</span>
          <input
            className="field mt-2"
            value={brief.name}
            onChange={(e) => setBrief((b) => ({ ...b, name: e.target.value }))}
            aria-label="Name"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[color:var(--gallery-muted)]">Email</span>
          <input
            className="field mt-2"
            type="email"
            value={brief.email}
            onChange={(e) => setBrief((b) => ({ ...b, email: e.target.value }))}
            aria-label="Email"
            autoComplete="email"
          />
        </label>
      </div>
    )
  } else if (stepId === "review") {
    body = (
      <div className="space-y-4 text-sm text-[color:var(--gallery-muted)]">
        <p>
          <span className="text-[color:var(--gallery-ink)]">Idea.</span> {brief.idea.trim() || "—"}
        </p>
        <p>
          <span className="text-[color:var(--gallery-ink)]">Lineage.</span> {brief.lineage.trim() || "—"}
        </p>
        <p>
          <span className="text-[color:var(--gallery-ink)]">Metals.</span> {brief.metals.trim() || "—"}
        </p>
        <p>
          <span className="text-[color:var(--gallery-ink)]">Contact.</span>{" "}
          {[brief.name, brief.email].filter(Boolean).join(" · ") || "—"}
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <a
            className={`btn-primary text-center ${canConsult ? "" : "pointer-events-none opacity-40"}`}
            href={
              canConsult
                ? `mailto:hello@ochre.studio?subject=${encodeURIComponent("Jewellery commission brief")}&body=${encodeURIComponent(
                    `Idea:\n${brief.idea}\n\nLineage:\n${brief.lineage}\n\nMetals:\n${brief.metals}\n\nReferences:\n${brief.references}\n\n— ${brief.name} <${brief.email}>`,
                  )}`
                : undefined
            }
          >
            Send brief by email
          </a>
          <Link href="/jewellery/design" className="btn-secondary text-center">
            Or design a crest yourself
          </Link>
        </div>
      </div>
    )
  }

  return (
    <BuilderChrome
      title="Commission brief"
      eyebrow="Jewellery · from scratch"
      steps={STEPS}
      stepIndex={stepIndex}
      priceLabel="Consultation"
      onBack={() => setStepIndex((i) => Math.max(0, i - 1))}
      onNext={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}
      onSave={saveBrief}
      nextDisabled={stepId === "contact" && !brief.email.includes("@")}
      preview={preview}
      status={status}
    >
      {body}
    </BuilderChrome>
  )
}
