/** Phone file when public/<name>-800.webp was present at the last build. The full file stays the fallback. */
export function artworkSources(src: string, scaled: readonly string[]) {
  if (!scaled.includes(src)) return { src }
  const small = src.replace(/\.webp$/, "-800.webp")
  return { src: small, srcSet: `${small} 800w, ${src} 1200w` }
}
