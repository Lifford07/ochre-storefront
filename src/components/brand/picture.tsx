/** Pre-sized WebP with a srcset. Native img, so the browser picks the width and lazy-loads. */
export function HouseImage({
  name,
  alt,
  width,
  height,
  widths,
  sizes,
  className = "",
  priority = false,
}: {
  name: string
  alt: string
  width: number
  height: number
  widths: number[]
  sizes: string
  className?: string
  priority?: boolean
}) {
  const largest = widths[widths.length - 1]
  const srcSet = widths.map((w) => `/home/${name}-${w}.webp ${w}w`).join(", ")
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/home/${name}-${largest}.webp`}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  )
}
