"use client"

import { useEffect, useState } from "react"

export type BasketItem = {
  key: string
  slug: string
  title: string
  artist: string
  image?: string
  materialId: string
  materialName: string
  sizeId: string
  sizeName: string
  editionNumber: number
  editionSize: number
  pricePence: number
  qty: number
}

const KEY = "ochre-basket"
const EVENT = "ochre-basket-change"

export function readBasket(): BasketItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as BasketItem[]
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function write(items: BasketItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(EVENT))
}

export function addToBasket(item: Omit<BasketItem, "key" | "qty">) {
  const key = `${item.slug}:${item.materialId}:${item.sizeId}`
  const items = readBasket()
  const found = items.find((entry) => entry.key === key)
  if (found) found.qty = Math.min(found.qty + 1, Math.max(1, item.editionSize - item.editionNumber + 1))
  else items.push({ ...item, key, qty: 1 })
  write(items)
  window.dispatchEvent(new CustomEvent<{ key: string }>(ADDED, { detail: { key } }))
}

/** Fired after a piece is added. The header shows a small "In your basket" sheet. */
export const ADDED = "ochre-basket-added"

/** The whole basket pays in one go here. */
export const CHECKOUT = "/checkout"

/** Single piece, straight from its page. */
export function checkoutHref(item: Pick<BasketItem, "slug" | "materialId" | "sizeId">) {
  return `/collect/${item.slug}?material=${item.materialId}&size=${item.sizeId}`
}

/** Empties the basket once a basket order has been paid. */
export function clearBasket() {
  write([])
}

export function setQty(key: string, qty: number) {
  write(readBasket().map((item) => (item.key === key ? { ...item, qty: Math.max(1, Math.min(qty, item.editionSize)) } : item)))
}

export function removeItem(key: string) {
  write(readBasket().filter((item) => item.key !== key))
}

export function useBasket() {
  const [items, setItems] = useState<BasketItem[]>([])
  useEffect(() => {
    const sync = () => setItems(readBasket())
    sync()
    window.addEventListener(EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])
  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.pricePence, 0)
  return { items, count, subtotal }
}
