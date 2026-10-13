"use client"

import { useState } from "react"

const input = "mt-1 block w-full border border-[var(--navy)]/20 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-[#C6B849] focus:ring-2 focus:ring-[#C6B849]/30"
const label = "block text-xs tracking-[0.06em] text-[var(--navy)]/80"

export function DetailsForm(props: { firstName: string; lastName: string; email: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const form = e.currentTarget
    const res = await fetch("/api/account/details", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
    })
    const body = await res.json().catch(() => ({}))
    setBusy(false)
    if (res.ok) {
      setMsg({ ok: true, text: "Your details are saved." })
      ;(form.elements.namedItem("currentPassword") as HTMLInputElement).value = ""
      ;(form.elements.namedItem("newPassword") as HTMLInputElement).value = ""
    } else setMsg({ ok: false, text: body.error ?? "Could not save." })
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>First name<input name="firstName" defaultValue={props.firstName} required className={input} /></label>
        <label className={label}>Last name<input name="lastName" defaultValue={props.lastName} required className={input} /></label>
      </div>
      <label className={label}>Email<input name="email" type="email" defaultValue={props.email} required className={input} /></label>
      <div className="h-px bg-[var(--navy)]/10" />
      <p className="font-display text-xl">Change password</p>
      <label className={label}>New password<input name="newPassword" type="password" autoComplete="new-password" className={input} placeholder="Leave blank to keep" /></label>
      <label className={label}>Current password<input name="currentPassword" type="password" autoComplete="current-password" className={input} placeholder="Needed to change email or password" /></label>
      {msg ? <p role="status" className={`text-sm ${msg.ok ? "text-[#2f6b3a]" : "text-[#a33a2b]"}`}>{msg.text}</p> : null}
      <button type="submit" disabled={busy} className="bg-[var(--navy)] px-8 py-3 text-[12px] font-semibold tracking-[0.2em] text-[#F3EFE7] uppercase disabled:opacity-60">
        {busy ? "Saving…" : "Save details"}
      </button>
    </form>
  )
}
