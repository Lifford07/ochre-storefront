"use client"

import { useState } from "react"

export function NewsletterBand() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Please enter a valid email address.")
    setState("sending")
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) })
      const body = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(body.error || "Sign-up failed. Please try again.")
      setState("done")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-up failed. Please try again.")
      setState("idle")
    }
  }

  return (
    <section className="bg-[var(--navy)] text-[#F3EFE7]" aria-label="The Ochré Letter">
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 border-b border-[#C6B849]/60 px-5 py-12 md:grid-cols-[1fr_1.1fr] md:px-10">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] text-[#C6B849] uppercase">Newsletter</p>
          <h2 className="font-display mt-2 text-3xl tracking-[0.06em] md:text-4xl">THE OCHRÉ LETTER: 10% OFF YOUR FIRST PIECE</h2>
          <div className="mt-4 h-px w-16 bg-[#C6B849]" />
        </div>
        <div>
          <p className="text-sm text-[#F3EFE7]/85">Join for early access to numbered editions and private releases.</p>
          {state === "done" ? (
            <div className="mt-4 border border-[#C6B849]/70 px-5 py-4">
              <p className="font-display text-xl italic text-[#C6B849]">Thank you. You’re on the list.</p>
              <p className="mt-2 text-sm">Your code for 10% off your first piece: <span className="ml-1 font-mono tracking-[0.2em] text-[#C6B849]">WELCOME10</span></p>
              <p className="mt-1 text-xs text-[#F3EFE7]/60">Enter it at card checkout.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row" noValidate>
              <label className="sr-only" htmlFor="ochre-letter-email">Email address</label>
              <input
                id="ochre-letter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                className="min-h-12 flex-1 border border-[#C6B849]/60 bg-transparent px-4 text-sm text-[#F3EFE7] outline-none placeholder:text-[#F3EFE7]/45 focus:border-[#C6B849]"
              />
              <button type="submit" disabled={state === "sending"} className="min-h-12 bg-[#C6B849] px-6 font-mono text-[11px] tracking-[0.2em] text-[var(--navy)] uppercase disabled:opacity-60">
                {state === "sending" ? "Joining…" : "Subscribe"}
              </button>
            </form>
          )}
          {error ? <p className="mt-2 text-xs text-[#f0c9b0]">{error}</p> : null}
          <p className="mt-3 font-mono text-[10px] tracking-[0.16em] text-[#F3EFE7]/55 uppercase">Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  )
}
