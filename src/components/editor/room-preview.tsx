import type { MaterialId } from "@/config/catalogue"
import { PrintView, type FitMode } from "@/components/editor/print-view"

type RoomPreviewProps = {
  src: string
  imageWidth: number
  imageHeight: number
  widthMm: number
  heightMm: number
  offsetX: number
  offsetY: number
  fit: FitMode
  filter?: string
  materialId: MaterialId
  sizeName: string
}

/** Visible stretch of wall or table, in centimetres, so sizes stay in proportion. */
function sceneCm(materialId: MaterialId) {
  return materialId === "card" ? 40 : 90
}

export function RoomPreview({
  src,
  imageWidth,
  imageHeight,
  widthMm,
  heightMm,
  offsetX,
  offsetY,
  fit,
  filter,
  materialId,
  sizeName,
}: RoomPreviewProps) {
  const isCard = materialId === "card"
  const cm = sceneCm(materialId)
  const widthPct = ((widthMm / 10) / cm) * 100
  const frame = frameClass(materialId)

  return (
    <figure className="space-y-2">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#cfc3b4] sm:aspect-[5/4]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4ebdf_0%,#e6d9c8_62%,#cbbba6_62%,#cbbba6_65%,#b7a38e_100%)]" />
        <div className="pointer-events-none absolute -left-8 top-0 h-48 w-48 rounded-full bg-white/50 blur-3xl" />
        <div
          className="absolute left-1/2"
          style={{
            width: `${widthPct}%`,
            top: isCard ? "70%" : "34%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className={frame}>
            <PrintView
              src={src}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              widthMm={widthMm}
              heightMm={heightMm}
              offsetX={offsetX}
              offsetY={offsetY}
              fit={fit}
              filter={filter}
            />
            {materialId === "acrylic" ? (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_42%,rgba(255,255,255,0.45)_50%,transparent_58%)]" />
            ) : null}
          </div>
        </div>
      </div>
      <figcaption className="text-xs leading-relaxed text-[#5e574e]">
        {sizeName} on {isCard ? "a tabletop" : "the wall"}. The mock-up is {cm} cm across, so a larger
        size really is larger. This is not a photo of your room.
      </figcaption>
    </figure>
  )
}

function frameClass(materialId: MaterialId) {
  switch (materialId) {
    case "real-glass":
      return "relative bg-white p-[7%] shadow-[0_18px_40px_rgba(40,30,20,0.28)] ring-1 ring-black/70"
    case "acrylic":
      return "relative shadow-[0_22px_44px_rgba(40,30,20,0.35)] ring-1 ring-white/80"
    case "gallery-bond":
      return "relative bg-[#141414] p-[3%] pb-[6%] shadow-[0_22px_40px_rgba(40,30,20,0.4)]"
    case "canvas":
      return "relative bg-[#efe6d6] p-[4.5%] shadow-[0_18px_36px_rgba(40,30,20,0.32)]"
    case "porcelain":
      return "relative bg-[#f7f3ec] p-[6%] shadow-[0_16px_30px_rgba(40,30,20,0.25)] ring-1 ring-[#eadfce]"
    case "card":
      return "relative bg-[#fbf8f4] p-[5%] shadow-[0_12px_24px_rgba(40,30,20,0.28)]"
  }
}
