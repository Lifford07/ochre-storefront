"use client"

import { useEffect, useState } from "react"
import { deliveryFor } from "@/lib/delivery"

export function DeliveryNote({ materialId, tone = "light", className = "" }: { materialId: string; tone?: "light" | "dark"; className?: string }) {
  const [info, setInfo] = useState<ReturnType<typeof deliveryFor>>(null)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the date depends on the visitor's clock
  useEffect(() => setInfo(deliveryFor(materialId)), [materialId])
  if (!info) return null
  const ink = tone === "dark" ? "text-[#F3EFE7]" : "text-[var(--navy)]"
  return (
    <div className={`border-y border-[#C6B849]/60 py-3 ${ink} ${className}`} data-testid="delivery-note">
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">{info.line}</p>
      <p className="mt-1 text-sm">
        Estimated delivery <span className="font-display text-base italic">{info.window}</span>
      </p>
    </div>
  )
}
