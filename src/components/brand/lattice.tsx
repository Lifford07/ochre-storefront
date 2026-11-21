/**
 * One band of the reduced seraph, whorl, and small-diamond lattice.
 * Footer only. Not a background behind work.
 */
export function LatticeBand() {
  return (
    <div aria-hidden className="h-12 overflow-hidden bg-[var(--navy)] text-[var(--gold)]">
      <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="ochre-lattice" width="84" height="48" patternUnits="userSpaceOnUse">
            <path d="M42 2 L82 24 L42 46 L2 24 Z" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.85" />
            <path d="M42 16 L50 24 L42 32 L34 24 Z" fill="none" stroke="currentColor" strokeWidth="0.55" />
            <path d="M14 24c2.2-3.2 6.4-3.4 8.2 0" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <path d="M22.2 24c-2.2-3.2-6.4-3.4-8.2 0" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="18" cy="24.5" r="1.7" fill="none" stroke="currentColor" strokeWidth="0.55" />
            <path d="M68 24c1.6-1.2 2.2-2.6 1.2-3.6-1.4-1.2-3 .2-2.6 1.8" fill="none" stroke="currentColor" strokeWidth="0.55" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ochre-lattice)" />
      </svg>
    </div>
  )
}
