"use client"

import { useEffect, useState } from "react"
import { Editor } from "@/components/editor/editor"
import { MakeEntry } from "@/components/editor/make-entry"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

/** Shows the material/size entry first; returning visitors mid-flow go straight to the editor. */
export function MakeGate() {
  const [mode, setMode] = useState<"loading" | "entry" | "editor">("loading")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    let inFlow = params.has("start")
    try {
      const raw = sessionStorage.getItem("ochre-editor-meta")
      const meta = raw ? (JSON.parse(raw) as { step?: string }) : null
      if (meta?.step && meta.step !== "upload") inFlow = true
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only session state once on mount
    setMode(inFlow ? "editor" : "entry")
  }, [])

  if (mode === "loading") return <div className="min-h-screen bg-[#F3EFE7]" />
  if (mode === "editor") return <Editor />
  return (
    <>
      <SiteHeader />
      <MakeEntry
        onStart={(choice) => {
          sessionStorage.setItem("ochre-editor-meta", JSON.stringify({ step: "upload", ...choice }))
          window.history.pushState(null, "", "/make?start=1")
          setMode("editor")
          window.scrollTo(0, 0)
        }}
      />
      <SiteFooter />
    </>
  )
}
