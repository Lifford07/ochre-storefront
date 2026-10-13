"use client"

import { useState } from "react"

export function DeleteAccount() {
  const [msg, setMsg] = useState<string | null>(null)
  return (
    <form
      className="mt-12 max-w-xl border-t border-[var(--navy)]/10 pt-8"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!window.confirm("Delete your Ochré account and saved images? This cannot be undone.")) return
        const password = String(new FormData(e.currentTarget).get("password") ?? "")
        const res = await fetch("/api/account", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) })
        const body = await res.json().catch(() => ({}))
        if (res.ok) window.location.assign("/")
        else setMsg(body.error ?? "Could not delete the account.")
      }}
    >
      <p className="font-display text-xl">Delete account</p>
      <p className="mt-1 text-sm text-[var(--navy)]/65">Removes your details and saved images. Paid orders are kept for our records.</p>
      <label className="mt-4 block text-xs tracking-[0.06em]">
        Password
        <input name="password" type="password" required autoComplete="current-password" className="mt-1 block w-full border border-[var(--navy)]/20 bg-white px-3 py-2.5" />
      </label>
      {msg ? <p className="mt-2 text-sm text-[#a33a2b]">{msg}</p> : null}
      <button className="mt-4 border border-[#a33a2b] px-6 py-2.5 text-[11px] font-semibold tracking-[0.2em] text-[#a33a2b] uppercase">Delete my account</button>
    </form>
  )
}
