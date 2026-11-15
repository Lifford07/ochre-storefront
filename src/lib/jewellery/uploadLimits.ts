/** Client mirror of server upload rules (defence in depth). */

export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024
export const UPLOAD_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp'
export const UPLOAD_ACCEPT_ATTR = 'image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

export type ClientUploadGate =
  | { ok: true }
  | { ok: false; message: string }

export function gateClientUpload(file: File): ClientUploadGate {
  if (file.size <= 0) {
    return { ok: false, message: 'That file looks empty.' }
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return {
      ok: false,
      message: `Images must be under ${UPLOAD_MAX_BYTES / (1024 * 1024)}MB.`,
    }
  }
  // Some OS pickers leave type blank — allow through for server magic-byte check.
  if (file.type && !ALLOWED.has(file.type) && !file.type.startsWith('image/')) {
    return { ok: false, message: 'Please upload a JPEG, PNG, GIF or WebP image.' }
  }
  if (file.type && file.type.startsWith('image/') && !ALLOWED.has(file.type)) {
    return {
      ok: false,
      message: 'Only JPEG, PNG, GIF or WebP are accepted (no SVG or HEIC).',
    }
  }
  return { ok: true }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string' || !result.startsWith('data:image/')) {
        reject(new Error('Could not read that image.'))
        return
      }
      resolve(result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}
