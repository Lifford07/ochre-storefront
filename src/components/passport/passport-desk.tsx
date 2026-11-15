"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/shell/site-chrome"
import {
  blankPassport,
  isPassportId,
  passportPath,
  type Fact,
  type Passport,
  type PassportLine,
  type PassportMedium,
  type PassportStatus,
  type ProvenanceEvent,
} from "@/lib/passport"

type Gate = "loading" | "locked" | "unconfigured" | "open"

const field = "mt-1 w-full border border-border bg-[#faf6f1] px-3 py-2 text-base text-[var(--ink)]"
const lines: PassportLine[] = ["art", "home", "garms", "jewellery"]

export function PassportDesk() {
  const [passports, setPassports] = useState<Passport[]>([])
  const [piece, setPiece] = useState<Passport | null>(null)
  const [gate, setGate] = useState<Gate>("loading")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [storage, setStorage] = useState<"file" | "redis" | null>(null)
  const [writable, setWritable] = useState(true)
  const [newId, setNewId] = useState("")
  const [holder, setHolder] = useState("")
  const [showName, setShowName] = useState(false)
  const [when, setWhen] = useState("")
  const [transferNote, setTransferNote] = useState("")

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/passports", { cache: "no-store" })
    if (response.status === 401) {
      setGate("locked")
      return
    }
    if (response.status === 503) {
      setGate("unconfigured")
      return
    }
    if (!response.ok) throw new Error("The passport list did not load.")
    const body = (await response.json()) as { passports: Passport[]; storage: "file" | "redis"; writable: boolean }
    setGate("open")
    setPassports(body.passports)
    setStorage(body.storage)
    setWritable(body.writable)
    setPiece((current) => current ?? body.passports.find((item) => item.id === "btc-001") ?? body.passports[0] ?? null)
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load().catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "The passport list did not load.")
      })
    }, 0)
    return () => window.clearTimeout(handle)
  }, [load])

  async function signIn() {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const body = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(body.error || "The desk stayed locked.")
      setPassword("")
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The desk stayed locked.")
    } finally {
      setBusy(false)
    }
  }

  function startNew() {
    const id = newId.trim().toLowerCase()
    if (!isPassportId(id)) {
      setError("Use a short id such as btc-001. Lowercase letters, numbers, and hyphens.")
      return
    }
    const existing = passports.find((item) => item.id === id)
    setPiece(existing ?? blankPassport(id))
    setNewId("")
    setError(null)
    setNote(existing ? "That piece is already on the desk." : "New piece. It is a draft until you save it.")
  }

  async function save() {
    if (!piece) return
    setBusy(true)
    setError(null)
    setNote(null)
    try {
      const response = await fetch(`/api/admin/passports/${piece.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(piece),
      })
      const body = (await response.json()) as { passport?: Passport; error?: string }
      if (!response.ok || !body.passport) throw new Error(body.error || "The passport was not saved.")
      setPiece(body.passport)
      setPassports((current) => {
        const next = current.filter((item) => item.id !== body.passport?.id)
        next.unshift(body.passport as Passport)
        return next.sort((a, b) => a.id.localeCompare(b.id))
      })
      setNote("Saved.")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The passport was not saved.")
    } finally {
      setBusy(false)
    }
  }

  async function transfer() {
    if (!piece) return
    setBusy(true)
    setError(null)
    setNote(null)
    try {
      const response = await fetch(`/api/admin/passports/${piece.id}/transfer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          passport: piece,
          transfer: { name: holder, publicName: showName, at: when, note: transferNote },
        }),
      })
      const body = (await response.json()) as { passport?: Passport; error?: string }
      if (!response.ok || !body.passport) throw new Error(body.error || "The transfer was not saved.")
      setPiece(body.passport)
      setPassports((current) => {
        const next = current.filter((item) => item.id !== body.passport?.id)
        next.unshift(body.passport as Passport)
        return next.sort((a, b) => a.id.localeCompare(b.id))
      })
      setHolder("")
      setShowName(false)
      setWhen("")
      setTransferNote("")
      setNote("Transfer recorded. The public timeline does not show a private name.")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The transfer was not saved.")
    } finally {
      setBusy(false)
    }
  }

  function patch(partial: Partial<Passport>) {
    setPiece((current) => (current ? { ...current, ...partial } : current))
  }

  function patchFact(key: "madeOn" | "techniques" | "materials" | "dimensions", partial: Partial<Fact>) {
    setPiece((current) => (current ? { ...current, [key]: { ...current[key], ...partial } } : current))
  }

  function patchMedium(id: string, partial: Partial<PassportMedium>) {
    setPiece((current) =>
      current
        ? { ...current, media: current.media.map((item) => (item.id === id ? { ...item, ...partial } : item)) }
        : current,
    )
  }

  function patchEvent(id: string, partial: Partial<ProvenanceEvent>) {
    setPiece((current) =>
      current
        ? { ...current, events: current.events.map((item) => (item.id === id ? { ...item, ...partial } : item)) }
        : current,
    )
  }

  const unfinished =
    piece?.status === "verified" &&
    (piece.madeOn.placeholder ||
      piece.materials.placeholder ||
      piece.dimensions.placeholder ||
      piece.media.some((item) => item.kind === "video" && item.placeholder))

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-xs tracking-[0.18em] text-[#5e574e]">OCHRÉ · PASSPORTS</p>
        <h1 className="mt-2 font-serif text-4xl">Provenance desk</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#5e574e]">
          Add a one-of-one piece, correct its record, or note a change of hands. The public page is /p/ and the id. Nothing here is a token.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/admin/orders" className="lnk">
            Order desk
          </Link>
        </p>
        {gate === "unconfigured" ? <p className="mt-6 text-sm text-[#8d3428]">Set ADMIN_PASSWORD before the desk can open.</p> : null}
        {gate === "locked" ? (
          <form
            className="mt-8 max-w-sm space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              void signIn()
            }}
          >
            <label className="block text-sm">
              Desk password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={field}
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="btn-foil" disabled={busy || password.length === 0}>
              {busy ? "Checking…" : "Open the desk"}
            </button>
          </form>
        ) : null}
        {error ? <p className="mt-6 text-sm text-[#8d3428]">{error}</p> : null}
        {note ? <p className="mt-6 text-sm text-[#3d5c45]">{note}</p> : null}
        {gate === "open" ? (
          <>
            <p className="mt-6 text-sm text-[#5e574e]">
              {storage === "redis"
                ? "Saves are kept in Redis, with the orders."
                : "On this machine, saves are kept in data/passports.json. That file is not committed."}
              {writable ? "" : " This live site has no Redis, so a save will not keep."}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block flex-1 text-sm">
                New piece id
                <input value={newId} onChange={(event) => setNewId(event.target.value)} placeholder="btc-001" className={field} />
              </label>
              <button type="button" className="btn-ghost" onClick={startNew}>
                Start a piece
              </button>
            </div>
            <ul className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {passports.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPiece(item)
                      setError(null)
                      setNote(null)
                    }}
                    className="flex min-h-12 w-full items-center justify-between gap-4 py-2 text-left text-sm"
                  >
                    <span>
                      {item.title || "Untitled"} <span className="text-[#5e574e]">/p/{item.id}</span>
                    </span>
                    <span className="text-xs tracking-[0.14em] text-[#5e574e] uppercase">{item.status}</span>
                  </button>
                </li>
              ))}
            </ul>
            {piece ? (
              <form
                className="mt-10 space-y-8"
                onSubmit={(event) => {
                  event.preventDefault()
                  void save()
                }}
              >
                <section className="space-y-4">
                  <h2 className="font-serif text-2xl">The piece</h2>
                  <p className="text-sm text-[#5e574e]">
                    Public page{" "}
                    <a href={passportPath(piece.id)} className="lnk">
                      {passportPath(piece.id)}
                    </a>
                    .{" "}
                    <a href={`${passportPath(piece.id)}/qr?download=1`} className="lnk">
                      Download QR
                    </a>
                    . The QR uses the address you have open, unless PASSPORT_ORIGIN is set. Put that same link on an NFC tag.
                  </p>
                  <label className="block text-sm">
                    Title
                    <input value={piece.title} onChange={(event) => patch({ title: event.target.value })} className={field} />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      Edition number
                      <input
                        type="number"
                        min={1}
                        value={piece.editionNumber}
                        onChange={(event) => patch({ editionNumber: Number(event.target.value) })}
                        className={field}
                      />
                    </label>
                    <label className="block text-sm">
                      Edition size
                      <input
                        type="number"
                        min={1}
                        value={piece.editionSize}
                        onChange={(event) => patch({ editionSize: Number(event.target.value) })}
                        className={field}
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      Line
                      <select value={piece.line} onChange={(event) => patch({ line: event.target.value as PassportLine })} className={field}>
                        {lines.map((line) => (
                          <option key={line} value={line}>
                            {line}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm">
                      Status
                      <select
                        value={piece.status}
                        onChange={(event) => patch({ status: event.target.value as PassportStatus })}
                        className={field}
                      >
                        <option value="draft">draft</option>
                        <option value="verified">verified</option>
                      </select>
                    </label>
                  </div>
                  {unfinished ? (
                    <p className="text-sm text-[#8d3428]">
                      Verified means the piece is made and the facts are true. Leave it as a draft while a date, a material, a dimension, or the film is still a placeholder.
                    </p>
                  ) : null}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      House
                      <input value={piece.maker} onChange={(event) => patch({ maker: event.target.value })} className={field} />
                    </label>
                    <label className="block text-sm">
                      Maker
                      <input value={piece.makerName} onChange={(event) => patch({ makerName: event.target.value })} className={field} />
                    </label>
                  </div>
                  <label className="block text-sm">
                    Dedication
                    <input value={piece.dedication} onChange={(event) => patch({ dedication: event.target.value })} className={field} />
                  </label>
                  <label className="block text-sm">
                    Note
                    <textarea
                      value={piece.statement}
                      onChange={(event) => patch({ statement: event.target.value })}
                      rows={4}
                      className={field}
                    />
                  </label>
                </section>

                <section className="space-y-4">
                  <h2 className="font-serif text-2xl">Facts</h2>
                  <p className="text-sm text-[#5e574e]">
                    Leave the placeholder box ticked until you know the fact. An empty line stays a placeholder. Date made is YYYY-MM-DD.
                  </p>
                  <FactField label="Date made" fact={piece.madeOn} onChange={(partial) => patchFact("madeOn", partial)} />
                  <FactField label="Techniques" fact={piece.techniques} onChange={(partial) => patchFact("techniques", partial)} />
                  <FactField label="Materials" fact={piece.materials} onChange={(partial) => patchFact("materials", partial)} />
                  <FactField label="Dimensions" fact={piece.dimensions} onChange={(partial) => patchFact("dimensions", partial)} />
                </section>

                <section className="space-y-4">
                  <h2 className="font-serif text-2xl">Making record</h2>
                  <p className="text-sm text-[#5e574e]">
                    A film plays on the page only as an mp4 or webm file, and only after play. Put a poster image up first. Other addresses become a link. Photos load when the page reaches them.
                  </p>
                  {piece.media.map((item) => (
                    <fieldset key={item.id} className="space-y-2 border border-[var(--line)] p-3">
                      <legend className="px-1 text-xs tracking-[0.14em] text-[#5e574e] uppercase">{item.kind}</legend>
                      <label className="block text-sm">
                        Address
                        <input value={item.src} onChange={(event) => patchMedium(item.id, { src: event.target.value })} className={field} />
                      </label>
                      {item.kind === "video" ? (
                        <label className="block text-sm">
                          Poster
                          <input
                            value={item.poster}
                            onChange={(event) => patchMedium(item.id, { poster: event.target.value })}
                            className={field}
                          />
                        </label>
                      ) : null}
                      <label className="block text-sm">
                        Caption
                        <input
                          value={item.caption}
                          onChange={(event) => patchMedium(item.id, { caption: event.target.value })}
                          className={field}
                        />
                      </label>
                      <Check
                        label="Placeholder"
                        checked={item.placeholder}
                        onChange={(placeholder) => patchMedium(item.id, { placeholder })}
                      />
                      {item.kind === "photo" ? (
                        <button
                          type="button"
                          className="text-sm underline"
                          onClick={() =>
                            setPiece((current) =>
                              current ? { ...current, media: current.media.filter((medium) => medium.id !== item.id) } : current,
                            )
                          }
                        >
                          Remove photo
                        </button>
                      ) : null}
                    </fieldset>
                  ))}
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() =>
                      setPiece((current) => {
                        if (!current || current.media.length >= 8) return current
                        const id = `photo-${crypto.randomUUID()}`
                        return {
                          ...current,
                          media: [
                            ...current.media,
                            { id, kind: "photo", src: "", poster: "", caption: "Process", placeholder: true },
                          ],
                        }
                      })
                    }
                  >
                    Add a process photo
                  </button>
                </section>

                <section className="space-y-4">
                  <h2 className="font-serif text-2xl">Holder</h2>
                  <p className="text-sm text-[#5e574e]">
                    Leave the name empty while the piece is with the studio, or not yet made. Untick the public box and the page says Private collection. Saving this does not add a timeline line. Use the transfer below for a change of hands.
                  </p>
                  <label className="block text-sm">
                    Name
                    <input value={piece.owner.name} onChange={(event) => patch({ owner: { ...piece.owner, name: event.target.value } })} className={field} />
                  </label>
                  <Check
                    label="Show this name on the public page"
                    checked={piece.owner.public}
                    onChange={(value) => patch({ owner: { ...piece.owner, public: value } })}
                  />
                </section>

                <section className="space-y-4">
                  <h2 className="font-serif text-2xl">Timeline</h2>
                  <p className="text-sm text-[#5e574e]">
                    Notes are public. Do not write a private name in a note. Placeholder lines stay on the draft until the event has happened.
                  </p>
                  {piece.events.map((event) => (
                    <fieldset key={event.id} className="space-y-2 border border-[var(--line)] p-3">
                      <legend className="px-1 text-xs tracking-[0.14em] text-[#5e574e] uppercase">{event.kind}</legend>
                      <label className="block text-sm">
                        Date
                        <input
                          type="date"
                          value={event.at ?? ""}
                          onChange={(input) => patchEvent(event.id, { at: input.target.value || null })}
                          className={field}
                        />
                      </label>
                      <label className="block text-sm">
                        Note
                        <textarea
                          value={event.note}
                          onChange={(input) => patchEvent(event.id, { note: input.target.value })}
                          rows={2}
                          className={field}
                        />
                      </label>
                      <Check
                        label="Placeholder"
                        checked={event.placeholder}
                        onChange={(placeholder) => patchEvent(event.id, { placeholder })}
                      />
                      {event.kind === "transferred" ? (
                        <button
                          type="button"
                          className="text-sm underline"
                          onClick={() =>
                            setPiece((current) =>
                              current ? { ...current, events: current.events.filter((item) => item.id !== event.id) } : current,
                            )
                          }
                        >
                          Remove this transfer
                        </button>
                      ) : null}
                    </fieldset>
                  ))}
                </section>

                <button type="submit" className="btn-foil" disabled={busy}>
                  {busy ? "Saving…" : "Save passport"}
                </button>
              </form>
            ) : null}

            {piece ? (
              <form
                className="mt-12 space-y-4 border-t border-[var(--line)] pt-8"
                onSubmit={(event) => {
                  event.preventDefault()
                  void transfer()
                }}
              >
                <h2 className="font-serif text-2xl">Record a transfer</h2>
                <p className="text-sm leading-relaxed text-[#5e574e]">
                  The first transfer is First sold. A later one is Ownership transferred. If the name stays private, the public line says a private collection, and the note must not contain the name. This also saves the form above.
                </p>
                <label className="block text-sm">
                  New holder
                  <input value={holder} onChange={(event) => setHolder(event.target.value)} className={field} />
                </label>
                <label className="block text-sm">
                  Date
                  <input type="date" value={when} onChange={(event) => setWhen(event.target.value)} className={field} />
                </label>
                <label className="block text-sm">
                  Public note
                  <textarea value={transferNote} onChange={(event) => setTransferNote(event.target.value)} rows={2} className={field} />
                </label>
                <Check label="Show this name on the public page" checked={showName} onChange={setShowName} />
                <button type="submit" className="btn-navy" disabled={busy}>
                  {busy ? "Saving…" : "Record this transfer"}
                </button>
              </form>
            ) : null}
          </>
        ) : null}
      </main>
    </>
  )
}

function FactField({ label, fact, onChange }: { label: string; fact: Fact; onChange: (partial: Partial<Fact>) => void }) {
  return (
    <div>
      <label className="block text-sm">
        {label}
        <input value={fact.value} onChange={(event) => onChange({ value: event.target.value })} className={field} />
      </label>
      <Check label="Placeholder" checked={fact.placeholder} onChange={(placeholder) => onChange({ placeholder })} />
    </div>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="mt-2 flex min-h-11 items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  )
}
