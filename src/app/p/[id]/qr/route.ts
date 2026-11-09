import { passportOriginFrom, passportUrl } from "@/lib/passport"
import { passportQrPng } from "@/lib/passport-qr"
import { getPassport } from "@/lib/passports-store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const passport = await getPassport(id)
  if (!passport) {
    return new Response("This passport is not in the house.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    })
  }
  const url = passportUrl(passport.id, passportOriginFrom(request.headers))
  const png = await passportQrPng(url)
  const download = new URL(request.url).searchParams.get("download") === "1"
  const filename = `ochre-${passport.id}-qr.png`
  return new Response(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "private, max-age=86400",
      vary: "host",
      "content-disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "x-content-type-options": "nosniff",
    },
  })
}
