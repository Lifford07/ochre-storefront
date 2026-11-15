"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { PathRail } from "@/components/house/path-rail"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { lines } from "@/config/house"

export default function CommissionLinePage() {
  const params = useParams<{ line: string }>()
  const line = lines.find((item) => item.id === params.line)
  const [picks, setPicks] = useState<Record<string, string[]>>({})
  const [idea, setIdea] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const summary = useMemo(() => Object.entries(picks).map(([label, values]) => `${label}: ${values.join(", ")}`).join(" · "), [picks])

  if (!line) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="page"><h1>That line is not open</h1><Link href="/commission">All commissions</Link></main>
        <SiteFooter />
      </>
    )
  }

  function toggle(label: string, choice: string, many?: boolean) {
    setPicks((current) => {
      const have = current[label] ?? []
      const next = many ? (have.includes(choice) ? have.filter((item) => item !== choice) : [...have, choice]) : [choice]
      return { ...current, [label]: next }
    })
  }

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page">
          <header className="phead">
            <p className="kicker">{line.name} · Idea</p>
            <h1>Send the <em>brief</em></h1>
            <p className="phead__lede">{line.ask}</p>
          </header>
          <PathRail at={0} material={line.material} />
          {sent ? (
            <div className="note note--big">
              <h2>Brief received</h2>
              <p>{name || "You"} · {email}</p>
              <p>{summary}</p>
              <p>{idea}</p>
              <p className="fine">This preview keeps the brief on this page only. Nothing was sent, and nothing was charged.</p>
              {line.id === "jewellery" ? <p><Link href="/jewellery/commission">Or use the stepped jewellery brief</Link></p> : null}
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (!name.trim() || !email.includes("@") || !idea.trim()) return
                setSent(true)
              }}
            >
              {line.picks.map((group) => (
                <div className="opt" key={group.label}>
                  <p className="opt__l mono">{group.label}</p>
                  <div className="chips">
                    {group.choices.map((choice) => {
                      const on = (picks[group.label] ?? []).includes(choice)
                      return (
                        <button key={choice} type="button" className={`chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggle(group.label, choice, group.many)}>
                          <span>{choice}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              <label className="field"><span className="mono">The idea</span><textarea required value={idea} onChange={(event) => setIdea(event.target.value)} /></label>
              <label className="field"><span className="mono">Name</span><input required value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label className="field"><span className="mono">Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              {line.note ? <p className="note">{line.note}</p> : null}
              <button className="btn btn--navy" type="submit">Send your idea</button>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
