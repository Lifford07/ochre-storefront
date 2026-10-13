/** Read width and height from a JPEG, PNG, or WebP header. No rescale, no decode of pixels. */

export function measureImage(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    const width = readU32(bytes, 16)
    const height = readU32(bytes, 20)
    return positive(width, height)
  }
  if (bytes.length >= 30 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) {
    const webp = measureWebp(bytes)
    if (webp) return webp
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) return measureJpeg(bytes)
  return null
}

function positive(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null
  return { width, height }
}

function readU32(bytes: Uint8Array, offset: number) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0
}

function measureJpeg(bytes: Uint8Array) {
  let index = 2
  while (index + 8 < bytes.length) {
    if (bytes[index] !== 0xff) return null
    while (bytes[index] === 0xff) index += 1
    const marker = bytes[index]
    index += 1
    if (marker === 0xd8 || marker === 0xd9) continue
    if (marker === 0xda || marker === 0x00) return null
    if (index + 1 >= bytes.length) return null
    const size = (bytes[index] << 8) + bytes[index + 1]
    const startOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)
    if (startOfFrame && index + 7 < bytes.length) {
      const height = (bytes[index + 3] << 8) + bytes[index + 4]
      const width = (bytes[index + 5] << 8) + bytes[index + 6]
      return positive(width, height)
    }
    if (size < 2) return null
    index += size
  }
  return null
}

function measureWebp(bytes: Uint8Array) {
  const tag = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15])
  if (tag === "VP8X" && bytes.length >= 30) {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16)
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16)
    return positive(width, height)
  }
  if (tag === "VP8 " && bytes.length >= 30) {
    const width = bytes[26] + ((bytes[27] & 0x3f) << 8)
    const height = bytes[28] + ((bytes[29] & 0x3f) << 8)
    return positive(width, height)
  }
  if (tag === "VP8L" && bytes.length >= 25) {
    const bits = bytes[21] + (bytes[22] << 8) + (bytes[23] << 16) + (bytes[24] << 24)
    const width = (bits & 0x3fff) + 1
    const height = ((bits >> 14) & 0x3fff) + 1
    return positive(width, height)
  }
  return null
}
