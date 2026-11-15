import type { WallFacts } from "@/lib/caption"

export function WallCaption({
  facts,
  tone = "light",
  className = "",
}: {
  facts: WallFacts
  tone?: "light" | "dark"
  className?: string
}) {
  const ink = tone === "dark" ? "text-[var(--porcelain)]/80" : "text-[var(--charcoal)]"
  const label = tone === "dark" ? "text-[var(--foil)]" : "text-[var(--gold-ink)]"
  return (
    <dl className={`wall-caption ${className}`}>
      {(
        [
          ["Year", String(facts.year)],
          ["Medium", facts.medium],
          ["Dimensions", facts.dimensions],
          ["Edition", facts.edition],
        ] as const
      ).map(([term, detail]) => (
        <div key={term}>
          <dt className={label}>{term}</dt>
          <dd className={ink}>{detail}</dd>
        </div>
      ))}
    </dl>
  )
}
