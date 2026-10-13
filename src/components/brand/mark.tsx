export function Crest({ className = "size-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M40 18c8 2 16 0 22-6-2 10-1 16 4 22-8 1-14 5-16 12" />
        <path d="M40 18c-8 2-16 0-22-6 2 10 1 16-4 22 8 1 14 5 16 12" />
        <circle cx="40" cy="34" r="7" />
        <path d="M34 33.2c.8-1.2 2-1.6 3.2-1.2M43 33c.6 1 1.6 1.4 2.6.8" />
        <path d="M37 37.5c1.6 1.4 4.2 1.4 6 0" />
        <path d="M32 58c2.4-6 5-9 8-9s5.6 3 8 9" />
        <path d="M28 62h24" />
      </g>
    </svg>
  )
}

export function Wordmark({
  tone = "foil",
  className = "",
}: {
  tone?: "foil" | "gold" | "navy"
  className?: string
}) {
  const colour = tone === "navy" ? "text-[var(--navy)]" : tone === "gold" ? "text-[var(--gold-ink)]" : "text-[var(--foil)]"
  return (
    <span className={`font-display inline-block text-[1.55rem] leading-none tracking-[0.28em] ${colour} ${className}`}>
      OCHRÉ
    </span>
  )
}

export function Whorl({ className = "size-8", spin = false }: { className?: string; spin?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <g className={spin ? "whorl-spin" : undefined} style={{ transformOrigin: "32px 32px" }}>
        <path
          d="M32 32c7 0 10 8 4 13-8 7-20-2-15-12 4-8 16-6 20 1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

export function Endband({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`h-7 w-full bg-[url('/endpaper.svg')] bg-[length:96px_72px] bg-repeat ${className}`} />
}

export function FoilSeal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`seal-stamp ${className}`} aria-hidden>
      <defs>
        <radialGradient id="foilSeal" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#F1E7B4" />
          <stop offset="42%" stopColor="#D9CB7E" />
          <stop offset="100%" stopColor="#B3A23D" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="54" fill="url(#foilSeal)" />
      <circle cx="60" cy="60" r="46" fill="none" stroke="#8A7E2B" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="#8A7E2B" strokeWidth="0.6" />
      <path
        d="M60 38c8 0 12 9 5 15-9 8-22-2-16-13 4-8 16-6 20 1"
        fill="none"
        stroke="#0B1332"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text x="60" y="86" textAnchor="middle" fontSize="7" letterSpacing="1.5" fill="#0B1332" fontFamily="ui-sans-serif, system-ui">
        OCHRÉ
      </text>
    </svg>
  )
}
