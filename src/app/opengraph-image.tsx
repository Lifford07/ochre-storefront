import { ImageResponse } from "next/og"

export const alt = "Ochré. Your image, made into an object."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0B1332",
          color: "#F4E7C3",
          padding: "80px",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#D9CB7E" }}>OCHRÉ</div>
        <div style={{ fontSize: 72, marginTop: 24, lineHeight: 1.05 }}>Your image, made into an object.</div>
        <div style={{ fontSize: 28, marginTop: 28, color: "#F7F1E6" }}>Numbered. Made to order. Pay in USDC.</div>
      </div>
    ),
    { ...size },
  )
}
