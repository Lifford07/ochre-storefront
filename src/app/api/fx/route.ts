import { gbpToUsdc } from "@/lib/fx"

export const dynamic = "force-dynamic"

export async function GET() {
  const quote = await gbpToUsdc()
  return Response.json(quote)
}
