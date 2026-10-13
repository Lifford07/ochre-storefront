/**
 * Production times are the printer's published standard times (myposter.de, Oct 2026):
 * real glass ("Glasdruck") 5 working days, acrylic glass 4, canvas 3.
 * Courier after hand-over: 1–3 working days (help.myposter.com).
 * Ochré buffer: +2 working days for the hand check of the file and UK cross-border transit.
 */
export const MAKE_DAYS: Record<string, number> = { "real-glass": 5, acrylic: 4, "acrylic-fineart": 4, canvas: 3 }
const COURIER = [1, 3] as const
export const OCHRE_BUFFER_DAYS = 2

function addWorkingDays(from: Date, days: number) {
  const date = new Date(from)
  let left = days
  while (left > 0) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) left -= 1
  }
  return date
}

const fmt = (date: Date) =>
  date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" })

export function deliveryFor(materialId: string, now = new Date()) {
  const make = MAKE_DAYS[materialId]
  if (!make) return null
  const ready = make + OCHRE_BUFFER_DAYS
  const earliest = addWorkingDays(now, ready + COURIER[0])
  const latest = addWorkingDays(now, ready + COURIER[1])
  return {
    makeDays: make,
    readyDays: ready,
    window: `${fmt(earliest)} – ${fmt(latest)}`,
    line: `Made to order in ${make} working days · ready to ship in ${ready}`,
  }
}
