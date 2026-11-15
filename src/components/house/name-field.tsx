"use client"

import { useEffect, useState } from "react"
import { NAME_KEY } from "@/config/house"

export function NameField() {
  const [name, setName] = useState("")
  useEffect(() => {
    const id = window.setTimeout(() => setName(localStorage.getItem(NAME_KEY) || ""), 0)
    return () => window.clearTimeout(id)
  }, [])
  return (
    <>
      <label className="field rv" htmlFor="nameIn">
        <span className="mono">Your name goes beneath it</span>
        <input
          id="nameIn"
          type="text"
          maxLength={40}
          autoComplete="off"
          placeholder="Type a name"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            localStorage.setItem(NAME_KEY, event.target.value.trim())
          }}
        />
      </label>
      <p className="pers__line rv" aria-live="polite">God loves you, <b id="nameEcho">{name.trim() || "…"}</b></p>
    </>
  )
}
