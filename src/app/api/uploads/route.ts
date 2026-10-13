import { saveUploadedFile } from "@/lib/order-image"
import { imageBackend, imageUnavailableMessage } from "@/lib/storage-mode"
import { consumeTicket } from "@/lib/upload-ticket"

export const dynamic = "force-dynamic"

export async function GET() {
  const mode = imageBackend()
  if (mode === "unavailable") {
    return Response.json({ mode, error: imageUnavailableMessage() }, { status: 503 })
  }
  return Response.json({ mode })
}

export async function POST(request: Request) {
  const mode = imageBackend()
  if (mode === "unavailable") {
    return Response.json({ error: imageUnavailableMessage() }, { status: 503 })
  }
  if (mode !== "file") {
    return Response.json({ error: "Send the print file through the Blob upload." }, { status: 400 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return Response.json({ error: "The print file was not readable." }, { status: 400 })
  }

  const ticket = form.get("ticket")
  const file = form.get("file")
  if (typeof ticket !== "string" || !(file instanceof File)) {
    return Response.json({ error: "The print file and its ticket are required." }, { status: 400 })
  }
  let accepted = false
  try {
    accepted = await consumeTicket(ticket)
  } catch (error) {
    console.error("upload-ticket", error instanceof Error ? error.message : "failed")
    return Response.json({ error: "The print file cannot be saved just now. Nothing was charged." }, { status: 503 })
  }
  if (!accepted) {
    return Response.json({ error: "That upload ticket is missing or already used." }, { status: 400 })
  }

  try {
    const saved = await saveUploadedFile(new Uint8Array(await file.arrayBuffer()))
    return Response.json(saved, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "The print file could not be saved."
    return Response.json({ error: message }, { status: 400 })
  }
}
