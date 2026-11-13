"use client"

import { useState } from "react"

export function CopyLink({ url }: { url: string }) {
  const [note, setNote] = useState("")

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setNote("Copied.")
    } catch {
      setNote("Select the link and copy it.")
    }
    window.setTimeout(() => setNote(""), 2500)
  }

  return (
    <div>
      <label htmlFor="passport-url" className="font-sans text-[11px] font-semibold tracking-[0.24em] text-[#e4d48a] uppercase">
        Passport link
      </label>
      <input
        id="passport-url"
        readOnly
        value={url}
        onFocus={(event) => event.currentTarget.select()}
        className="mt-2 w-full border border-[#c6b849]/50 bg-transparent px-3 py-3 text-base text-[#f6f1e7]"
      />
      <button
        type="button"
        onClick={() => void copy()}
        className="mt-3 inline-flex min-h-12 items-center border border-[#e4d48a] px-4 font-sans text-[12px] font-semibold tracking-[0.18em] text-[#f6f1e7] uppercase"
      >
        Copy link
      </button>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-[#f1e7b4]">
        {note}
      </p>
    </div>
  )
}
