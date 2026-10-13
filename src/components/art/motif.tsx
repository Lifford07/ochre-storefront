import type { Motif } from "@/config/works"

const ground = "#E7E1D6"

export function Motif({
  motif,
  className = "",
  title,
}: {
  motif: Motif
  className?: string
  title?: string
}) {
  return (
    <svg viewBox="0 0 320 400" className={className} role="img" aria-label={title ?? "Artwork stand-in"}>
      <rect width="320" height="400" fill={ground} />
      {motif === "arches" ? <Arches /> : null}
      {motif === "sweep" ? <Sweep /> : null}
      {motif === "solstice" ? <Solstice /> : null}
      {motif === "moon" ? <Moon /> : null}
      {motif === "endpaper" ? <EndpaperTile /> : null}
      {motif === "curve" ? <Curve /> : null}
      {motif === "weave" ? <Weave /> : null}
      {motif === "tide" ? <Tide /> : null}
      {motif === "rooms" ? <Rooms /> : null}
    </svg>
  )
}

export function WorkImage({
  motif,
  image,
  title,
  className = "",
}: {
  motif: Motif
  image?: string
  title: string
  className?: string
}) {
  if (image) {
    return (
      // Real files replace the drawing by setting `image` on the work.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={title} className={`h-full w-full object-contain ${className}`} />
    )
  }
  return <Motif motif={motif} title={title} className={`h-full w-full ${className}`} />
}

function Arches() {
  return (
    <g>
      <rect x="36" y="250" width="70" height="110" rx="35" fill="#1B3A4B" />
      <rect x="125" y="210" width="70" height="150" rx="35" fill="#E07A5F" />
      <rect x="214" y="236" width="70" height="124" rx="35" fill="#C6B849" />
      <rect x="36" y="318" width="248" height="46" fill="#C4624A" />
    </g>
  )
}

function Sweep() {
  return (
    <g>
      <rect width="320" height="400" fill="#E7D3B0" />
      <path d="M20 250c80-20 120-90 280-70" fill="none" stroke="#1B1B22" strokeWidth="18" strokeLinecap="round" />
    </g>
  )
}

function Solstice() {
  return (
    <g>
      <rect width="320" height="400" fill="#152038" />
      <circle cx="160" cy="190" r="108" fill="#E07A5F" />
      <circle cx="160" cy="190" r="74" fill="#C6B849" />
      <circle cx="160" cy="190" r="42" fill="#F5F1EA" />
      <circle cx="160" cy="190" r="16" fill="#0B1332" />
    </g>
  )
}

function Moon() {
  return (
    <g>
      <rect width="320" height="230" fill="#141C33" />
      <rect y="230" width="320" height="170" fill="#1B3A4B" />
      <circle cx="160" cy="150" r="48" fill="#F5F1EA" />
      {[0, 1, 2, 3, 4].map((row) => (
        <path
          key={row}
          d={`M20 ${268 + row * 22}h280`}
          stroke="#0B1332"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
      ))}
    </g>
  )
}

function EndpaperTile() {
  return (
    <g>
      <rect width="320" height="400" fill="#0B1332" />
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 5 }).map((__, col) => (
          <path
            key={`${row}-${col}`}
            d={`M${40 + col * 60} ${36 + row * 48} l14 10 -14 10 -14 -10 z`}
            fill="none"
            stroke="#E07A5F"
            strokeWidth="1.4"
          />
        )),
      )}
    </g>
  )
}

function Curve() {
  return (
    <g>
      <rect width="320" height="400" fill="#E7D7C3" />
      <path d="M30 250c70-80 150-20 260-40" fill="none" stroke="#1B1B22" strokeWidth="10" strokeLinecap="round" />
      <circle cx="248" cy="120" r="10" fill="#E07A5F" />
    </g>
  )
}

function Weave() {
  const colours = ["#E7C8A5", "#1B3A4B", "#C6B849", "#E07A5F", "#F5F1EA", "#0B1332"]
  return (
    <g>
      {Array.from({ length: 24 }).map((_, index) => {
        const col = index % 4
        const row = Math.floor(index / 4)
        return <rect key={index} x={20 + col * 72} y={20 + row * 60} width="64" height="52" fill={colours[index % colours.length]} />
      })}
    </g>
  )
}

function Tide() {
  return (
    <g>
      <rect width="320" height="210" fill="#E7C8A5" />
      <rect y="210" width="320" height="190" fill="#1B3A4B" />
      <circle cx="160" cy="168" r="18" fill="#E07A5F" />
    </g>
  )
}

function Rooms() {
  return (
    <g>
      <rect width="160" height="400" fill="#E07A5F" />
      <rect x="160" width="160" height="400" fill="#1B3A4B" />
      <rect x="70" y="150" width="180" height="120" fill="#E7D3B0" />
    </g>
  )
}
