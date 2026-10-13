/** Client-side: keep a copy of an uploaded photo in the signed-in customer's account. Silent if signed out. */
export async function saveToAccount(blob: Blob, name: string) {
  try {
    const bitmap = await createImageBitmap(blob)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const jpeg = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86))
    if (!jpeg) return
    const form = new FormData()
    form.set("file", jpeg, "image.jpg")
    form.set("name", name)
    form.set("width", String(bitmap.width))
    form.set("height", String(bitmap.height))
    await fetch("/api/account/images", { method: "POST", body: form })
  } catch {
    // Saving to the account is a convenience; never block the editor.
  }
}
