/**
 * The Cherub. Line redraw from the brand sheet (gold winged head, curls, bust).
 * The sheet was a small raster, so the face and feather edges are a faithful
 * redraw, not a traced master. It needs a designer pass before it is cut,
 * engraved, or embroidered.
 */
const wing = [
  "M201.4 118.7 Q216.7 78.1 214.2 41.7 Q197.1 74 194.6 117.3",
  "M201.7 120 Q232.4 79 241.2 36.8 Q211.2 67.7 194.3 116",
  "M201.3 121.2 Q247.1 85.9 270.2 43.2 Q228.4 67.8 194.7 114.8",
  "M200.1 121.6 Q249.7 102 281.1 70 Q237.7 81.2 195.9 114.4",
  "M198.8 121.4 Q242 117.3 273.7 99.1 Q237.2 97.9 197.2 114.6",
]

export function Cherub({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 210" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <g>
        {wing.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g transform="translate(360 0) scale(-1 1)">
        {wing.map((d) => (
          <path key={`m-${d}`} d={d} />
        ))}
      </g>
      <ellipse cx="180" cy="112" rx="26" ry="30" />
      <path d="M160 104c8-28 32-40 40-8" />
      <path d="M154 112c-8 6-8 18 0 24" />
      <path d="M206 112c8 6 8 18 0 24" />
      <path d="M164 90c4-16 16-20 22-8" />
      <path d="M186 84c4-14 16-12 18 2" />
      <ellipse cx="171" cy="112" rx="3.4" ry="2.3" />
      <ellipse cx="191" cy="112" rx="3.4" ry="2.3" />
      <path d="M178 116c1.2 5 4 6 6 4" />
      <path d="M174 128c4 3 8 3 12 0" />
      <path d="M166 140c6 16 10 28 14 34 4-6 8-18 14-34" />
      <path d="M158 162c14 14 30 14 44 0" />
    </svg>
  )
}
