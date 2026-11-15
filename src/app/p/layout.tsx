import type { Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#100e0c",
}

export default function PassportLayout({ children }: { children: React.ReactNode }) {
  return <div className="passport-root min-h-dvh bg-[#100e0c] text-[#f6f1e7] [color-scheme:dark]">{children}</div>
}
