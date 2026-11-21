import Link from "next/link"
import type { ReactNode } from "react"

/**
 * Marks a section or page that is not for sale.
 * The top band is the entrance. The bottom band is the exit, with a way back to the shop.
 */
export function PrototypeGate({
  name,
  children,
}: {
  name: string
  children: ReactNode
}) {
  return (
    <div className="prototype-gate" data-prototype={name}>
      <p className="prototype-banner">
        <span>
          <strong>Prototype</strong>
          <span className="ms-3">Entering {name}. Not for sale.</span>
        </span>
        <Link href="/collection">Back to the shop</Link>
      </p>
      {children}
      <p className="prototype-banner prototype-banner-end">
        <span>
          <strong>Prototype</strong>
          <span className="ms-3">Leaving {name}.</span>
        </span>
        <Link href="/">Back to the house</Link>
      </p>
    </div>
  )
}
