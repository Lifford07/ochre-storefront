import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"
import { imageBackend, imageUnavailableMessage } from "@/lib/storage-mode"
import { issueTicket } from "@/lib/upload-ticket"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!(await rateLimit(`ticket:${clientIp(request)}`, 6, 600))) return tooMany()
  const mode = imageBackend()
  if (mode === "unavailable") {
    return Response.json({ error: imageUnavailableMessage(), mode }, { status: 503 })
  }
  try {
    const ticket = await issueTicket()
    return Response.json({ ticket, mode })
  } catch (error) {
    console.error("upload-ticket", error instanceof Error ? error.message : "failed")
    return Response.json({ error: "The print file cannot be saved just now. Nothing was charged." }, { status: 503 })
  }
}
