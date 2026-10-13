/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { AccountShell } from "@/components/account/account-shell"
import { currentUser } from "@/lib/account-auth"
import { getJSON } from "@/lib/account-store"

export const dynamic = "force-dynamic"
export const metadata = { title: "My images · OCHRÉ" }

type AccountImage = { id: string; name: string; width: number; height: number; createdAt: string }

export default async function ImagesPage() {
  const user = await currentUser()
  const images = user ? ((await getJSON<AccountImage[]>(`images/${user.id}/index.json`).catch(() => null)) ?? []) : []
  return (
    <AccountShell user={user} active="/account/images" title="My images">
      {images.length === 0 ? (
        <div className="border border-dashed border-[var(--navy)]/25 p-10 text-center">
          <p className="font-display text-2xl">No images yet</p>
          <p className="mt-2 text-sm text-[var(--navy)]/70">Images you upload while signed in are kept here.</p>
          <Link href="/make" className="mt-6 inline-block bg-[var(--navy)] px-6 py-3 text-[12px] font-semibold tracking-[0.2em] text-[#F3EFE7] uppercase">Upload an image</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--navy)]/70">{images.length} image{images.length === 1 ? "" : "s"} kept in your account.</p>
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {images.map((img) => (
              <li key={img.id} className="bg-white p-2 shadow-sm">
                <div className="aspect-square overflow-hidden bg-[var(--navy)]/5">
                  <img src={`/api/account/images/${img.id}`} alt={img.name} className="size-full object-cover" loading="lazy" />
                </div>
                <p className="mt-2 truncate text-sm">{img.name}</p>
                <p className="text-[11px] text-[var(--navy)]/55">
                  {img.width}×{img.height}px · {new Date(img.createdAt).toLocaleDateString("en-GB")}
                </p>
              </li>
            ))}
          </ul>
          <Link href="/make" className="mt-8 inline-block text-sm text-[var(--gold-ink)] underline underline-offset-4">Upload another image</Link>
        </>
      )}
    </AccountShell>
  )
}
