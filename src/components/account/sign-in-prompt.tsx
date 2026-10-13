"use client"

import { openAccountModal } from "@/components/account/account-menu"

export function SignInPrompt() {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <h1 className="font-display text-4xl">Your Ochré account</h1>
      <p className="mt-4 text-[var(--navy)]/75">Sign in to see your images, orders and details.</p>
      <div className="mt-8 flex flex-col gap-3">
        <button type="button" onClick={() => openAccountModal("signin")} className="bg-[var(--navy)] py-3 text-[12px] font-semibold tracking-[0.2em] text-[#F3EFE7] uppercase">Sign in</button>
        <button type="button" onClick={() => openAccountModal("register")} className="border border-[var(--navy)] py-3 text-[12px] font-semibold tracking-[0.2em] uppercase">Register now</button>
      </div>
    </div>
  )
}
