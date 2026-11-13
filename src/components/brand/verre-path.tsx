import { verre } from "@/config/verre"

export function VerrePath({ dark = false }: { dark?: boolean }) {
  const rule = dark ? "border-[#F3EFE7]/20" : "border-[var(--line)]"
  const when = dark ? "text-[var(--foil)]" : "text-[var(--gold-ink)]"
  return (
    <ol className={`border-t ${rule}`}>
      {verre.path.map((step) => (
        <li key={step.when} className={`grid grid-cols-[8.5rem_1fr] items-baseline gap-4 border-b py-4 ${rule}`}>
          <span className={`font-mono text-[10px] tracking-[0.12em] uppercase ${when}`}>{step.when}</span>
          <span>
            {step.what}
            {step.now ? (
              <span className={`ml-2 inline-block rounded-full border px-2 py-0.5 align-middle font-mono text-[9px] tracking-[0.14em] uppercase ${when}`}>Now</span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  )
}
