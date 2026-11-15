"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type FormEvent } from "react"
import { AccountMenu } from "@/components/account/account-menu"
import { useBasket } from "@/lib/basket"
import { house } from "@/config/house"

const nav = [
  { href: "/collection", label: "Collection" },
  { href: "/verre-eglomise", label: "Verre églomisé" },
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/house", label: "The House" },
]

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function HouseIntro() {
  const [on, setOn] = useState(false)
  const [gone, setGone] = useState(true)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce || sessionStorage.getItem("ochre-intro") === "1") return
    const start = window.setTimeout(() => {
      setGone(false)
      setOn(true)
    }, 30)
    const end = window.setTimeout(() => {
      setGone(true)
      sessionStorage.setItem("ochre-intro", "1")
    }, 1400)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(end)
    }
  }, [])

  if (gone) return null
  return (
    <div className={`intro${on ? " go" : ""}`} role="dialog" aria-label="Ochré">
      <div className="intro__in">
        <span className="intro__word">OCHR<span className="e">É</span></span>
        <i className="intro__rule" />
      </div>
      <button
        type="button"
        className="intro__skip"
        onClick={() => {
          sessionStorage.setItem("ochre-intro", "1")
          setGone(true)
        }}
      >
        Skip
      </button>
    </div>
  )
}

export function HouseHeader() {
  const pathname = usePathname()
  const { count } = useBasket()
  const [openPath, setOpenPath] = useState<string | null>(null)
  const open = openPath === pathname
  const home = pathname === "/"

  useEffect(() => {
    document.documentElement.classList.toggle("menu", open)
    return () => document.documentElement.classList.remove("menu")
  }, [open])

  return (
    <>
      <HouseIntro />
      <a className="skip" href="#main">Skip to content</a>
      <header className={`hdr${home ? " hdr--over" : ""}`}>
        <button type="button" className="hdr__menu" aria-label="Menu" aria-expanded={open} aria-controls="drawer" onClick={() => setOpenPath(open ? null : pathname)}>
          <span /><span />
        </button>
        <nav className="hdr__nav hdr__nav--l" aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={active(pathname, item.href) ? "at" : ""}>{item.label}</Link>
          ))}
        </nav>
        <Link href="/" className="hdr__mark" aria-label="Ochré, home">
          <span className="wordmark">OCHR<span className="e">É</span></span>
        </Link>
        <nav className="hdr__nav hdr__nav--r" aria-label="Secondary">
          <Link href="/begin" className={active(pathname, "/begin") ? "at" : ""}>Begin a piece</Link>
          <Link href="/make" className={active(pathname, "/make") ? "at" : ""}>Make yours</Link>
          <AccountMenu className="hdr__account" compact />
          <Link href="/basket" className={`hdr__bag${count ? " has" : ""}`} aria-label={`Bag, ${count}`}>
            Bag <span id="bagCount" className="mono">{count}</span>
          </Link>
        </nav>
      </header>
      <div className={`drawer${open ? " on" : ""}`} id="drawer" hidden={!open}>
        <nav aria-label="Menu">
          <Link href="/begin"><i>I</i>Begin a piece</Link>
          <Link href="/collection"><i>II</i>Collection</Link>
          <Link href="/verre-eglomise"><i>III</i>Verre églomisé</Link>
          <Link href="/make"><i>IV</i>Make yours</Link>
          <Link href="/exhibitions"><i>V</i>Exhibitions</Link>
          <Link href="/house"><i>VI</i>The House</Link>
        </nav>
        <div className="drawer__lines mono">
          <Link href="/collection">Art</Link>
          <Link href="/lines/jewellery">Jewellery</Link>
          <Link href="/lines/home">Home</Link>
          <Link href="/lines/garms">Garms</Link>
          <Link href="/account">Account</Link>
        </div>
      </div>
    </>
  )
}

export function HouseFooter() {
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState("")

  async function subscribe(event: FormEvent) {
    event.preventDefault()
    setMsg("")
    const response = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) })
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    setMsg(response.ok ? "You are on the list." : body.error || "Sign-up is paused for a moment.")
    if (response.ok) setEmail("")
  }

  return (
    <footer className="ftr dark">
      <div className="endband" />
      <div className="ftr__top">
        <div className="ftr__letter">
          <p className="kicker">The Ochré Letter</p>
          <p className="ftr__lede">New editions, the first gilded panels, and where the house shows next.</p>
          <form className="letter" onSubmit={(event) => void subscribe(event)} noValidate>
            <label className="sr" htmlFor="letterEmail">Email address</label>
            <input id="letterEmail" type="email" placeholder="Email address" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <button type="submit">Subscribe</button>
          </form>
          <p className="letter__msg mono" role="status">{msg}</p>
        </div>
        <div className="ftr__cols">
          <div><p className="kicker">The house</p><Link href="/house">The story</Link><Link href="/verre-eglomise">Gold on glass</Link><Link href="/exhibitions">Exhibitions</Link><Link href="/orders/preview">Provenance</Link><Link href="/commission">Commission</Link></div>
          <div><p className="kicker">Lines</p><Link href="/collection">Art</Link><Link href="/lines/jewellery">Jewellery</Link><Link href="/lines/home">Home</Link><Link href="/lines/garms">Garms</Link></div>
          <div><p className="kicker">Care</p><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link><Link href="/guide">Image guide</Link><Link href="/contact">Contact</Link></div>
        </div>
      </div>
      <div className="ftr__mark" aria-hidden>OCHR<span className="e">É</span></div>
      <div className="ftr__base mono"><span>{house.legal}</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span></div>
    </footer>
  )
}
