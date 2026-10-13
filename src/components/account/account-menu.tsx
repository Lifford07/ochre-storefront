"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

type Me = { id: string; email: string; firstName: string; lastName: string }
type Mode = "signin" | "register" | "forgot" | null

const sw = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" className="size-[18px] shrink-0" aria-hidden {...sw}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c1.2-4 4-5.6 7.5-5.6s6.3 1.6 7.5 5.6" />
  </svg>
)

export function openAccountModal(mode: "signin" | "register" = "signin") {
  window.dispatchEvent(new CustomEvent("ochre:account", { detail: mode }))
}

export function AccountMenu({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const [me, setMe] = useState<Me | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [google, setGoogle] = useState(false)
  const [mode, setMode] = useState<Mode>(null)
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/account/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user ?? null)
        setGoogle(Boolean(d.google))
      })
      .catch(() => setMe(null))
      .finally(() => setLoaded(true))
    const open = (e: Event) => setMode(((e as CustomEvent).detail as Mode) ?? "signin")
    window.addEventListener("ochre:account", open)
    return () => window.removeEventListener("ochre:account", open)
  }, [])

  useEffect(() => {
    if (!menu) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [menu])

  async function signOut() {
    await fetch("/api/account/logout", { method: "POST" })
    setMe(null)
    setMenu(false)
    if (window.location.pathname.startsWith("/account")) window.location.href = "/"
  }

  const label = me ? (compact ? me.firstName : `My account · ${me.firstName}`) : "Sign in"

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={className}
        aria-haspopup={me ? "menu" : "dialog"}
        aria-expanded={me ? menu : mode !== null}
        onClick={() => (me ? setMenu((v) => !v) : setMode("signin"))}
        data-testid="account-trigger"
      >
        <PersonIcon /> <span className={loaded ? "" : "opacity-0"}>{label}</span>
      </button>
      {me && menu ? (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-56 border border-[var(--navy)]/15 bg-[#F3EFE7] py-2 text-[var(--navy)] shadow-[0_18px_40px_-18px_rgba(11,19,50,0.45)]">
          <p className="px-4 pb-2 font-display text-lg">Hello, {me.firstName}</p>
          <div className="mb-1 h-px bg-[var(--navy)]/10" />
          {[
            ["My account", "/account"],
            ["My images", "/account/images"],
            ["My orders", "/account/orders"],
            ["My details", "/account/details"],
          ].map(([text, href]) => (
            <Link key={href} href={href} role="menuitem" onClick={() => setMenu(false)} className="block px-4 py-2 text-sm hover:bg-[var(--navy)]/5 hover:text-[var(--gold-ink)]">
              {text}
            </Link>
          ))}
          <div className="my-1 h-px bg-[var(--navy)]/10" />
          <button type="button" role="menuitem" onClick={() => void signOut()} className="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--navy)]/5">
            Sign out
          </button>
        </div>
      ) : null}
      {mode ? <AccountModal google={google} mode={mode} setMode={setMode} onDone={(u) => { setMe(u); setMode(null) }} /> : null}
    </div>
  )
}

const input = "mt-1 block w-full border border-[var(--navy)]/20 bg-white px-3 py-2.5 text-[15px] text-[var(--navy)] outline-none focus:border-[#C6B849] focus:ring-2 focus:ring-[#C6B849]/30"
const labelCls = "block text-left text-xs tracking-[0.06em] text-[var(--navy)]/80"
const primary = "mt-5 w-full bg-[var(--navy)] py-3 font-sans text-[12px] font-semibold tracking-[0.2em] text-[#F3EFE7] uppercase hover:bg-[#131d47] disabled:opacity-60"

function AccountModal({ google, mode, setMode, onDone }: { google: boolean; mode: Exclude<Mode, null>; setMode: (m: Mode) => void; onDone: (u: Me) => void }) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMode(null)
    document.addEventListener("keydown", esc)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", esc)
      document.body.style.overflow = prev
    }
  }, [setMode])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    if (mode === "register") {
      const pw = String(data.password ?? "")
      if (pw.length < 8 || !/[a-z]/i.test(pw) || !/[0-9]/.test(pw)) {
        setError("Password needs at least 8 characters, including a letter and a number.")
        return
      }
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/account/${mode === "register" ? "register" : "login"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.")
      onDone(body.user)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  const title = mode === "register" ? "Create your Ochré account" : mode === "forgot" ? "Reset your password" : "Sign in to your Ochré account"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1332]/55 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && setMode(null)}>
      <div role="dialog" aria-modal="true" aria-label={title} className="relative max-h-[92vh] w-full max-w-[420px] overflow-y-auto bg-[#F3EFE7] px-7 pt-8 pb-7 text-center text-[var(--navy)] shadow-2xl sm:px-10">
        <button type="button" aria-label="Close" onClick={() => setMode(null)} className="absolute top-3 right-3 inline-flex size-10 items-center justify-center text-xl text-[var(--navy)]/70 hover:text-[var(--navy)]">
          ×
        </button>
        <p className="font-display text-[28px] leading-none tracking-[0.2em] text-[#C6B849]">OCHRÉ</p>
        <h2 className="font-display mt-4 text-2xl leading-tight">{title}</h2>
        {mode === "forgot" ? (
          <ForgotForm onBack={() => setMode("signin")} onContact={() => setMode(null)} />
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
            {mode === "register" ? (
              <div className="grid grid-cols-2 gap-3">
                <label className={labelCls}>First name*<input name="firstName" required autoComplete="given-name" className={input} /></label>
                <label className={labelCls}>Last name*<input name="lastName" required autoComplete="family-name" className={input} /></label>
              </div>
            ) : null}
            <label className={labelCls}>Email{mode === "register" ? "*" : ""}<input name="email" type="email" required autoComplete="email" className={input} /></label>
            <label className={labelCls}>
              Password{mode === "register" ? "*" : ""}
              <input name="password" type="password" required autoComplete={mode === "register" ? "new-password" : "current-password"} className={input} />
            </label>
            {mode === "register" ? <p className="text-left text-[11px] text-[var(--navy)]/60">At least 8 characters, including one letter and one number.</p> : null}
            {error ? <p role="alert" className="text-left text-sm text-[#a33a2b]">{error}</p> : null}
            <button type="submit" disabled={busy} className={primary}>
              {busy ? "One moment…" : mode === "register" ? "Register now" : "Sign in"}
            </button>
            {mode === "signin" ? (
              <button type="button" onClick={() => setMode("forgot")} className="mt-2 text-sm underline underline-offset-4 hover:text-[var(--gold-ink)]">Forgot password?</button>
            ) : null}
          </form>
        )}
        {mode !== "forgot" ? (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-[var(--navy)]/50">
              <span className="h-px flex-1 bg-[var(--navy)]/15" /> or <span className="h-px flex-1 bg-[var(--navy)]/15" />
            </div>
            {google ? (
              <a href="/api/auth/google" className="mb-4 flex w-full items-center justify-center gap-2 border border-[var(--navy)]/20 bg-white py-2.5 text-sm hover:border-[#C6B849]">
                <span className="font-semibold text-[#4285F4]">G</span> Continue with Google
              </a>
            ) : null}
            {mode === "signin" ? (
              <p className="text-sm">
                New to Ochré?{" "}
                <button type="button" onClick={() => { setError(null); setMode("register") }} className="font-medium text-[var(--gold-ink)] underline underline-offset-4">Register now</button>
              </p>
            ) : (
              <p className="text-sm">
                Already have an account?{" "}
                <button type="button" onClick={() => { setError(null); setMode("signin") }} className="font-medium text-[var(--gold-ink)] underline underline-offset-4">Sign in</button>
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

function ForgotForm({ onBack, onContact }: { onBack: () => void; onContact: () => void }) {
  const [msg, setMsg] = useState<{ text: string; disabled?: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  return (
    <div className="mt-5 text-sm text-[var(--navy)]/80">
      {msg ? (
        <>
          <p role="status">{msg.text}</p>
          {msg.disabled ? (
            <Link href="/contact" onClick={onContact} className={`${primary} block`}>Contact Ochré</Link>
          ) : null}
        </>
      ) : (
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            const email = String(new FormData(e.currentTarget).get("email") ?? "")
            const res = await fetch("/api/account/forgot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) })
            const body = await res.json().catch(() => ({}))
            setBusy(false)
            setMsg({ text: body.message ?? "Please try again shortly.", disabled: body.disabled })
          }}
        >
          <p>Enter your email and we will send a link to choose a new password.</p>
          <label className={labelCls}>Email<input name="email" type="email" required autoComplete="email" className={input} /></label>
          <button type="submit" disabled={busy} className={primary}>{busy ? "One moment…" : "Send reset link"}</button>
        </form>
      )}
      <button type="button" className="mt-4 text-sm underline underline-offset-4" onClick={onBack}>Back to sign in</button>
    </div>
  )
}
