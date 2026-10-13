import { dpiNeedle, verdictFor, type PrintScore } from "@/lib/quality"

export function QualityMeter({ score }: { score: PrintScore }) {
  const pos = dpiNeedle(score.dpi)
  const angle = Math.PI * (1 - pos)
  const x = 100 + Math.cos(angle) * 68
  const y = 96 - Math.sin(angle) * 68
  const verdict = verdictFor(score.band)
  const tone = score.band === "red" ? "var(--bad)" : score.band === "amber" ? "var(--warn)" : "var(--ok)"

  return (
    <div>
      <p className="eyebrow">Print quality</p>
      <svg viewBox="0 0 200 120" className="mx-auto mt-2 w-full max-w-[240px]" role="img" aria-label={`${verdict}, ${Math.round(score.dpi)} DPI`}>
        <path d="M24 96 A76 76 0 0 1 70 32" fill="none" stroke="#B0473A" strokeWidth="10" strokeLinecap="butt" />
        <path d="M74 29 A76 76 0 0 1 126 29" fill="none" stroke="#BE8633" strokeWidth="10" />
        <path d="M130 32 A76 76 0 0 1 176 96" fill="none" stroke="#4E7D5E" strokeWidth="10" />
        <line x1="100" y1="96" x2={x} y2={y} stroke="#0B1332" strokeWidth="2" />
        <circle cx="100" cy="96" r="4" fill="#0B1332" />
        <circle cx={x} cy={y} r="4" fill="#FBF9F5" stroke="#0B1332" strokeWidth="1.4" />
      </svg>
      <p className="font-display text-center text-4xl italic" style={{ color: tone }}>
        {verdict}
      </p>
      <p className="mt-1 text-center font-mono text-[12px] tracking-[0.08em] text-[var(--charcoal)]">
        {Math.round(score.dpi)} DPI
      </p>
      <p className="mt-2 text-center text-sm text-[var(--mute)]">{score.message} The meter updates as you change size.</p>
      <p className="mt-3 text-center font-mono text-[10px] tracking-[0.12em] text-[var(--mute)] uppercase">
        Too small under 150 · Good 150–299 · Perfect 300+
      </p>
    </div>
  )
}
