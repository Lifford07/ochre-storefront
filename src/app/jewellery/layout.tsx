import type { ReactNode } from "react"
import { PrototypeGate } from "@/components/shell/prototype-gate"

export default function JewelleryLayout({ children }: { children: ReactNode }) {
  return <PrototypeGate name="Jewellery">{children}</PrototypeGate>
}
