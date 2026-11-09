import Link from "next/link"
import { Crest, Wordmark } from "@/components/brand/mark"
import { CopyLink } from "@/components/passport/copy-link"
import {
  eventLabel,
  factDisplay,
  formatRecordDate,
  lineLabel,
  ownerDetail,
  passportEditionLabel,
  passportPath,
  verificationLabel,
  videoType,
  type Passport,
  type PassportMedium,
} from "@/lib/passport"

export function PassportView({ passport, url }: { passport: Passport; url: string }) {
  const edition = passportEditionLabel(passport.editionNumber, passport.editionSize)
  const film = passport.media.find((item) => item.kind === "video")
  const photos = passport.media.filter((item) => item.kind === "photo")
  const holder = ownerDetail(passport)
  const facts = [
    { label: "Maker", ...shown(`${passport.maker} / ${passport.makerName}`) },
    { label: "Line", ...shown(lineLabel(passport.line)) },
    { label: "Date made", ...factDisplay(passport.madeOn, "not yet recorded") },
    { label: "Techniques", ...factDisplay(passport.techniques, "not yet recorded") },
    { label: "Materials", ...factDisplay(passport.materials, "not yet recorded") },
    { label: "Dimensions", ...factDisplay(passport.dimensions, "not yet recorded") },
  ]

  return (
    <article className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" prefetch={false} className="inline-flex min-h-12 items-center gap-3" aria-label="Ochré home">
          <Crest className="size-9 text-[#e4d48a]" />
          <Wordmark tone="on-dark" className="!text-[15px]" />
        </Link>
        <p className="font-sans text-[11px] font-semibold tracking-[0.28em] text-[#e4d48a] uppercase">Provenance</p>
      </header>

      <div className="mt-6 border border-[#c6b849]/55 px-4 py-8 sm:px-7 sm:py-10">
        {passport.status === "draft" ? (
          <p className="border border-[#e4d48a]/45 bg-[#1b1814] px-4 py-3 text-sm leading-relaxed text-[#f6f1e7]">
            Draft. This piece is not yet made. Every line marked Placeholder is waiting for a fact from the studio. Do not treat this page as a finished record.
          </p>
        ) : null}

        <p className={`font-sans text-[11px] font-semibold tracking-[0.28em] text-[#e4d48a] uppercase ${passport.status === "draft" ? "mt-8" : ""}`}>
          {edition}
          {passport.editionSize <= 1 ? " · One of one" : ""}
        </p>
        <h1 className="font-display mt-3 text-5xl text-[#f6f1e7] sm:text-6xl">{passport.title}</h1>
        {passport.dedication ? <p className="font-display mt-3 text-2xl text-[#f1e7b4] italic">{passport.dedication}</p> : null}
        <p className="mt-8 border-y border-[#c6b849]/60 py-3 text-center font-sans text-[12px] font-semibold tracking-[0.24em] text-[#e4d48a] uppercase">
          {verificationLabel(passport.status)}
        </p>

        <dl className="mt-10 space-y-6">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="font-sans text-[11px] font-semibold tracking-[0.24em] text-[#e4d48a] uppercase">{fact.label}</dt>
              <dd className={`mt-1 text-base leading-relaxed ${fact.placeholder ? "text-[#d4cbbd]" : "text-[#f6f1e7]"}`}>{fact.text}</dd>
            </div>
          ))}
        </dl>

        {passport.statement ? (
          <div className="mt-12">
            <h2 className="font-sans text-[11px] font-semibold tracking-[0.24em] text-[#e4d48a] uppercase">Note</h2>
            <p className="mt-3 text-base leading-relaxed text-[#f6f1e7]">{passport.statement}</p>
            {passport.status === "draft" ? (
              <p className="mt-3 text-sm leading-relaxed text-[#d4cbbd]">
                This note is the intention for the piece. It is not a list of finished materials.
              </p>
            ) : null}
          </div>
        ) : null}

        <section className="mt-14">
          <h2 className="font-sans text-[11px] font-semibold tracking-[0.24em] text-[#e4d48a] uppercase">Making</h2>
          <div className="mt-4">{film ? <Film medium={film} title={passport.title} /> : <FilmPlate />}</div>
          {photos.length ? (
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <li key={photo.id}>
                  <Photo medium={photo} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="mt-14">
          <h2 className="font-sans text-[11px] font-semibold tracking-[0.24em] text-[#e4d48a] uppercase">Owner</h2>
          <p className="mt-3 text-base text-[#f6f1e7]">{holder}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#d4cbbd]">{ownerNote(passport, holder)}</p>
        </section>

        <section className="mt-14">
          <h2 className="font-sans text-[11px] font-semibold tracking-[0.24em] text-[#e4d48a] uppercase">Provenance</h2>
          <ol className="mt-6 space-y-7 border-l border-[#c6b849]/45 pl-5">
            {passport.events.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute top-1 -left-[1.45rem] size-2.5 border border-[#e4d48a] bg-[#100e0c]" aria-hidden />
                <p className="font-sans text-[11px] font-semibold tracking-[0.22em] text-[#e4d48a] uppercase">{eventLabel(event.kind)}</p>
                <p className="mt-1 text-sm text-[#f6f1e7]">{event.placeholder ? "Placeholder" : formatRecordDate(event.at)}</p>
                {event.note ? <p className="mt-1 text-sm leading-relaxed text-[#d4cbbd]">{event.note}</p> : null}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="font-sans text-[11px] font-semibold tracking-[0.24em] text-[#e4d48a] uppercase">Share</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#d4cbbd]">
            The link for a bio, a printed QR code, or an NFC tag. The short path is {passportPath(passport.id)}.
          </p>
          <div className="mt-4">
            <CopyLink url={url} />
          </div>
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            {/* The QR is generated on request. The page does not ship a QR library. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/p/${passport.id}/qr`}
              width={160}
              height={160}
              alt={`QR code for ${passport.title}. It opens this passport.`}
              loading="lazy"
              decoding="async"
              className="h-40 w-40 bg-[#f4efe6]"
            />
            <a
              href={`/p/${passport.id}/qr?download=1`}
              className="inline-flex min-h-12 items-center border border-[#e4d48a] px-4 font-sans text-[12px] font-semibold tracking-[0.18em] text-[#f6f1e7] uppercase"
            >
              Download QR
            </a>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#d4cbbd]">
            Write the same link onto an NFC tag. The tag opens this page. This record is not a token.
          </p>
        </section>
      </div>

      <footer className="mt-8 text-sm text-[#d4cbbd]">
        <p>Ochré · Segun Junaid</p>
        <Link href="/" prefetch={false} className="mt-3 inline-flex min-h-12 items-center text-[#f1e7b4] underline underline-offset-4">
          Back to the house
        </Link>
      </footer>
    </article>
  )
}

function shown(text: string) {
  return { placeholder: false as const, text }
}

function ownerNote(passport: Passport, holder: string) {
  if (holder === "Not yet issued") return "No holder yet. The piece has not been issued."
  if (holder === "Ochré studio") return "Held by the studio."
  if (holder === "Private collection") return "The holder asked for the name to stay off this page."
  return "Shown because the holder asked for the name to appear."
}

function Film({ medium, title }: { medium: PassportMedium; title: string }) {
  const type = videoType(medium.src)
  if (!medium.placeholder && medium.src && type) {
    return (
      <figure>
        <video
          controls
          preload="none"
          playsInline
          poster={medium.poster || undefined}
          className="aspect-video w-full bg-[#181610]"
          aria-label={medium.caption || `Making film for ${title}`}
        >
          <source src={medium.src} type={type} />
        </video>
        <figcaption className="mt-2 text-sm text-[#d4cbbd]">{medium.caption || "Making film"}</figcaption>
      </figure>
    )
  }
  if (!medium.placeholder && medium.src) {
    return (
      <figure>
        <FilmPlate />
        <figcaption className="mt-2 text-sm text-[#d4cbbd]">
          {medium.caption || "Making film"}.{" "}
          <a href={medium.src} className="text-[#f1e7b4] underline underline-offset-4" rel="noreferrer">
            Open the film
          </a>
        </figcaption>
      </figure>
    )
  }
  return (
    <figure>
      <FilmPlate />
      <figcaption className="mt-2 text-sm text-[#d4cbbd]">Making film — placeholder. Not yet recorded.</figcaption>
    </figure>
  )
}

function FilmPlate() {
  return (
    <div
      className="flex aspect-video flex-col items-center justify-center border border-[#c6b849]/40 bg-[#181610] px-4 text-center"
      role="img"
      aria-label="Making film placeholder. Not yet recorded."
    >
      <Crest className="size-10 text-[#e4d48a]" />
      <p className="mt-4 font-sans text-[10px] font-semibold tracking-[0.28em] text-[#e4d48a] uppercase">Placeholder</p>
      <p className="font-display mt-2 text-2xl text-[#f6f1e7]">Making film</p>
      <p className="mt-2 text-sm text-[#d4cbbd]">Not yet recorded</p>
    </div>
  )
}

function Photo({ medium }: { medium: PassportMedium }) {
  if (!medium.placeholder && medium.src) {
    return (
      <figure>
        <div className="aspect-[4/5] overflow-hidden border border-[#c6b849]/40 bg-[#181610]">
          {/* Studio URLs are chosen in the desk. They are not known at build time. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={medium.src} alt={medium.caption || "Process photograph"} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
        <figcaption className="mt-1 text-[11px] leading-snug text-[#d4cbbd]">{medium.caption || "Process"}</figcaption>
      </figure>
    )
  }
  return (
    <figure>
      <div
        className="flex aspect-[4/5] flex-col items-center justify-center border border-[#c6b849]/40 bg-[#181610] px-1 text-center"
        role="img"
        aria-label="Process photograph placeholder. Not yet recorded."
      >
        <p className="font-sans text-[9px] font-semibold tracking-[0.18em] text-[#e4d48a] uppercase">Placeholder</p>
        <p className="mt-2 font-sans text-[10px] tracking-[0.14em] text-[#d4cbbd] uppercase">Process</p>
      </div>
      <figcaption className="mt-1 text-[11px] leading-snug text-[#d4cbbd]">Not yet recorded</figcaption>
    </figure>
  )
}
