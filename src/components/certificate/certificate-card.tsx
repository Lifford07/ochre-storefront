import type { ReactNode } from "react"
import Link from "next/link"
import { Crest, Endband, FoilSeal, Wordmark } from "@/components/brand/mark"
import { editionFigures } from "@/lib/edition"

export type CertificateView = {
  id: string
  title: string
  artist?: string
  materialName: string
  sizeName: string
  editionLabel: string
  number: number
  size: number
  owner: string
  mint: string
  network: string
  signature?: string
  solscanUrl?: string
  issued: string
  image: ReactNode
  example?: boolean
  paid: boolean
}

export function CertificateCard({ view }: { view: CertificateView }) {
  return (
    <article className="relative mx-auto w-full max-w-[520px] justify-self-center pb-16">
      <div className="bg-[url('/endpaper.svg')] bg-[length:96px_72px] p-3 shadow-[var(--shadow-card)] md:p-4">
        <div className="border border-[var(--gold)] bg-[var(--paper)] px-5 py-7 md:px-8 md:py-9">
          <div className="border border-[var(--gold)]/80 px-4 py-6 md:px-6">
            <div className="flex flex-col items-center text-center">
              <Crest className="size-12 text-[var(--gold-ink)]" />
              <Wordmark tone="gold" className="mt-2 !text-sm" />
              <p className="eyebrow mt-3">Ochré art</p>
            </div>
            <h2 className="font-display mt-6 text-center text-4xl md:text-5xl">Certificate of Edition</h2>
            <div className="mx-auto mt-6 aspect-[4/3] w-40 overflow-hidden bg-[var(--bone)]">{view.image}</div>
            <dl className="mt-6 grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 text-sm">
              <Field label="Title" value={view.title} />
              <div className="col-span-2 grid grid-cols-[1fr_auto] items-end gap-4">
                <div>
                  <dt className="eyebrow">Edition</dt>
                  <dd className="font-display mt-1 text-5xl leading-none md:text-6xl">{figures(view)}</dd>
                  <dd className="mt-2 font-mono text-xs tracking-[0.08em] text-[var(--ink)]">{view.editionLabel}</dd>
                </div>
                <div className="text-right text-sm">
                  <p className="text-[var(--mute)]">Recorded</p>
                  <p>{view.issued}</p>
                </div>
              </div>
              {view.artist ? <Field label="Artist" value={view.artist} /> : null}
              <Field label="Material" value={view.materialName} />
              <Field label="Size" value={view.sizeName} />
              <Field label="Owner" value={walletOrWords(view.owner)} />
              <Field label="USDC" value={walletOrWords(view.mint)} />
              <Field label="Network" value={view.network} />
            </dl>
            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-2xl italic">Ochré</p>
                <p className="eyebrow mt-1">For the house</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--mute)] uppercase">Awaiting the mint</p>
                {view.solscanUrl ? (
                  <Link href={view.solscanUrl} className="lnk mt-2 inline-block text-xs" target="_blank">
                    View the payment
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {view.paid ? (
        <FoilSeal className="absolute -right-3 -bottom-8 size-28 md:-right-6 md:size-32" />
      ) : null}
      {view.example ? <ExampleMark /> : null}
    </article>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="eyebrow self-end">{label}</dt>
      <dd className="text-right">{value}</dd>
    </>
  )
}

function ExampleMark() {
  return <span className="ex absolute top-4 left-4">Example</span>
}

function figures(view: CertificateView) {
  if (view.number < 1) return view.size <= 1 ? "1 / 1" : `— / ${view.size}`
  return editionFigures(view.number, view.size)
}

function walletOrWords(value: string) {
  if (value.includes(" ")) return value
  if (value.length <= 12) return value
  return `${value.slice(0, 4)}…${value.slice(-4)}`
}

export function CertificatePage({
  view,
  steps,
}: {
  view: CertificateView
  steps?: { label: string; detail: string; state: "done" | "now" | "later" }[]
}) {
  return (
    <div className="page-enter">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-[var(--mute)] uppercase">
            <span className="text-[var(--gold-ink)]">◉</span>
            {view.paid ? `Order confirmed · ${view.id}` : `Waiting for payment · ${view.id}`}
            {view.example ? <span className="ex">Example</span> : null}
          </span>
        </div>
        <h1 className="font-display mx-auto mt-4 max-w-3xl text-center text-4xl md:text-6xl">
          {view.paid ? (
            <>
              Thank you. <span className="italic">{view.editionLabel}</span> is yours.
            </>
          ) : (
            "Your certificate is waiting on the payment."
          )}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-[var(--charcoal)]">
          {view.paid
            ? "Payment is confirmed. We check the file, then the piece is made. Your certificate will be issued. It is awaiting the mint."
            : "When the transfer matches, the edition is recorded here. The certificate will be issued. It is awaiting the mint."}
        </p>
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.8fr)]">
          <CertificateCard view={view} />
          <aside className="lg:pt-6">
            <p className="eyebrow">Your piece, step by step</p>
            <ol className="mt-4 space-y-4">
              {(steps ?? defaultSteps(view)).map((step) => (
                <li key={step.label} className="flex gap-3">
                  <span
                    className={`mt-1 size-2.5 shrink-0 rounded-full ${
                      step.state === "done" ? "bg-[var(--navy)]" : step.state === "now" ? "bg-[var(--gold)]" : "border border-[var(--line)]"
                    }`}
                  />
                  <span>
                    <span className="block text-sm">{step.label}</span>
                    <span className="block text-sm text-[var(--mute)]">{step.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-8 border border-[var(--line)] bg-[var(--paper)] p-4">
              <p className="font-display text-2xl italic">{view.title}</p>
              <p className="mt-1 text-sm text-[var(--mute)]">
                {view.materialName} · {view.sizeName}
              </p>
            </div>
            {view.solscanUrl ? (
              <a className="btn-navy mt-4 flex" href={view.solscanUrl} target="_blank" rel="noreferrer">
                View the payment
              </a>
            ) : null}
            <p className="mt-4 text-sm text-[var(--mute)]">
              The certificate will be issued for this edition. On-chain minting is not live yet, so this page stays awaiting the mint.
            </p>
          </aside>
        </div>
      </div>
      <Endband />
    </div>
  )
}

function defaultSteps(view: CertificateView) {
  return [
    { label: "Paid", detail: view.paid ? view.issued : "Waiting for the transfer", state: view.paid ? "done" : "now" },
    { label: "Printing", detail: "A person checks the file, then the piece is made.", state: view.paid ? "now" : "later" },
    { label: "Dispatched", detail: "Tracked delivery to the address on the order.", state: "later" },
    { label: "Delivered", detail: "The courier's tracking shows it has arrived.", state: "later" },
  ] as const
}
