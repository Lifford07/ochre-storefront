import { notFound } from "next/navigation"
import { CollectCheckout } from "@/components/checkout/collect-checkout"
import { workBySlug } from "@/config/works"

export default async function CollectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!workBySlug(slug)) notFound()
  return <CollectCheckout />
}
