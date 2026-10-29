"use client"

import type { ReactNode } from "react"

export type BuilderStep = { id: string; label: string }

type Props = {
  title: string
  eyebrow?: string
  steps: BuilderStep[]
  stepIndex: number
  priceLabel: string
  onBack: () => void
  onNext: () => void
  onSave: () => void
  nextLabel?: string
  nextDisabled?: boolean
  backDisabled?: boolean
  preview: ReactNode
  children: ReactNode
  footerExtra?: ReactNode
  status?: string | null
}

/**
 * Stepped builder shell for Jewellery (Mix Part A).
 * Uses storefront tokens via .jewellery-museum aliases — matches FlowHeader calm progress.
 */
export function BuilderChrome({
  title,
  eyebrow = "Jewellery",
  steps,
  stepIndex,
  priceLabel,
  onBack,
  onNext,
  onSave,
  nextLabel = "Continue",
  nextDisabled,
  backDisabled,
  preview,
  children,
  footerExtra,
  status,
}: Props) {
  const progress = ((stepIndex + 1) / steps.length) * 100
  const step = steps[stepIndex]

  return (
    <div className="jewellery-museum mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-[color:var(--gallery-line)] pb-6">
        <p className="eyebrow !text-[color:var(--gallery-ochre)]">{eyebrow}</p>
        <h1 className="font-display mt-3 text-4xl text-[color:var(--gallery-ink)] sm:text-5xl">{title}</h1>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.18em] text-[color:var(--gallery-muted)] uppercase">
            <span>
              Step {stepIndex + 1} of {steps.length}
              {step ? ` · ${step.label}` : ""}
            </span>
            <span className="text-[color:var(--gallery-ochre)]" aria-live="polite">
              {priceLabel}
            </span>
          </div>
          <div
            className="h-1 w-full overflow-hidden bg-[color:var(--gallery-line)]"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={stepIndex + 1}
            aria-label={`Builder progress, step ${stepIndex + 1} of ${steps.length}`}
          >
            <div
              className="h-full bg-[color:var(--gallery-ochre)] transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ol className="mt-3 flex flex-wrap gap-2">
            {steps.map((s, i) => (
              <li key={s.id}>
                <span
                  className={`font-mono text-[10px] tracking-[0.14em] uppercase ${
                    i === stepIndex
                      ? "text-[color:var(--gallery-ochre)]"
                      : i < stepIndex
                        ? "text-[color:var(--gallery-ink)]"
                        : "text-[color:var(--gallery-muted)]"
                  }`}
                >
                  {i + 1}. {s.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          {preview}
          <p className="mt-3 text-center font-mono text-[10px] tracking-[0.2em] text-[color:var(--gallery-muted)] uppercase">
            Live preview
          </p>
        </div>
        <div className="space-y-6">
          <section className="gallery-panel" aria-labelledby="builder-step-heading">
            <h2 id="builder-step-heading" className="font-display text-2xl text-[color:var(--gallery-ink)]">
              {step?.label}
            </h2>
            <div className="mt-4">{children}</div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className="btn-secondary flex-1 disabled:opacity-40"
              onClick={onBack}
              disabled={backDisabled || stepIndex === 0}
            >
              Back
            </button>
            <button type="button" className="btn-secondary flex-1" onClick={onSave}>
              Save my design
            </button>
            {stepIndex < steps.length - 1 ? (
              <button
                type="button"
                className="btn-primary flex-1 disabled:opacity-40"
                onClick={onNext}
                disabled={nextDisabled}
              >
                {nextLabel}
              </button>
            ) : null}
          </div>
          {footerExtra}
          {status ? (
            <p className="text-sm text-[color:var(--gallery-muted)]" role="status">
              {status}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
