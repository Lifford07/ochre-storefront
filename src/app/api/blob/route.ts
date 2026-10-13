import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { MAX_IMAGE_BYTES } from "@/lib/order-image"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"
import { blobConfigured } from "@/lib/storage-mode"
import { consumeTicket } from "@/lib/upload-ticket"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!(await rateLimit(`blob:${clientIp(request)}`, 10, 600))) return tooMany()
  if (!blobConfigured()) {
    return Response.json({ error: "This shop cannot keep the photo yet. Nothing was charged." }, { status: 503 })
  }

  let body: HandleUploadBody
  try {
    body = (await request.json()) as HandleUploadBody
  } catch {
    return Response.json({ error: "The upload request was not readable." }, { status: 400 })
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith("orders/") || pathname.includes("..") || pathname.includes("\\")) {
          throw new Error("Uploads must use the orders path.")
        }
        let allowed = false
        try {
          allowed = await consumeTicket(clientPayload ?? "")
        } catch (error) {
          console.error("upload-ticket", error instanceof Error ? error.message : "failed")
          throw new Error("The print file cannot be saved just now. Nothing was charged.")
        }
        if (!allowed) throw new Error("That upload ticket is missing or already used.")
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          tokenPayload: clientPayload,
        }
      },
      onUploadCompleted: async () => {
        // The order record stores the private URL. Nothing else to write here.
      },
    })
    return Response.json(json)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload was refused."
    const paused = message.includes("cannot be saved just now")
    return Response.json({ error: message }, { status: paused ? 503 : 400 })
  }
}
