"use client"

import Link from "next/link"
import { useState } from "react"

export function ResetForm({ token }: { token: string }) {
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  if (state?.ok) {
    return (
      <p className="mt-6">
        {state.text} <Link href="/account" className="underline underline-offset-4">Go to my account</Link>
      </p>
    )
  }
  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        const password = String(new FormData(e.currentTarget).get("password") ?? "")
        const res = await fetch("/api/account/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) })
        const body = await res.json().catch(() => ({}))
        setBusy(false)
        setState(res.ok ? { ok: true, text: "Your password is changed and you are signed in." } : { ok: false, text: body.error ?? "Could not reset." })
      }}
    >
      <label className="block text-xs tracking-[0.06em]">
        New password
        <input name="password" type="password" required autoComplete="new-password" className="mt-1 block w-full border border-[var(--navy)]/20 bg-white px-3 py-2.5" />
      </label>
      <p className="text-[11px] text-[var(--navy)]/60">At least 8 characters, including one letter and one number.</p>
      {state ? <p className="text-sm text-[#a33a2b]">{state.text}</p> : null}
      <button disabled={busy} className="w-full bg-[var(--navy)] py-3 text-[12px] font-semibold tracking-[0.2em] text-[#F3EFE7] uppercase">{busy ? "Saving…" : "Set new password"}</button>
    </form>
  )
}
