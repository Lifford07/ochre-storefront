import { Cherub } from "@/components/brand/cherub"

/** Cherub above the OCHRÉ wordmark. The hero uses this; the header uses HouseMark. */
export function HouseLockup({
  tone = "gold",
  className = "",
}: {
  tone?: "gold" | "midnight"
  className?: string
}) {
  const colour = tone === "gold" ? "text-[var(--gold)]" : "text-[var(--navy)]"
  return (
    <span className={`inline-flex flex-col items-center ${colour} ${className}`}>
      <Cherub className="h-[4.5rem] w-auto md:h-28" />
      <span className="font-mark mt-3 text-[1.15rem] leading-none tracking-[0.42em] md:text-[1.35rem]">OCHRÉ</span>
    </span>
  )
}

/** Small lockup for the header and footer. Cherub beside the word, so the bar stays short on a phone. */
export function HouseMark({ tone = "midnight", className = "" }: { tone?: "gold" | "midnight"; className?: string }) {
  const colour = tone === "gold" ? "text-[var(--gold)]" : "text-[var(--navy)]"
  return (
    <span className={`inline-flex items-center gap-2 ${colour} ${className}`}>
      <Cherub className="h-8 w-auto" />
      <span className="font-mark text-[0.95rem] leading-none tracking-[0.32em]">OCHRÉ</span>
    </span>
  )
}
