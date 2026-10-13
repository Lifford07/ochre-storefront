import type { ShippingZone } from "./landed-price.ts"

export type CountryOption = { code: string; name: string; zone: ShippingZone }

/** UK, a short EU list on one zone rate, and the US. Other countries are not priced yet. */
export const COUNTRIES: CountryOption[] = [
  { code: "GB", name: "United Kingdom", zone: "UK" },
  { code: "IE", name: "Ireland", zone: "EU" },
  { code: "FR", name: "France", zone: "EU" },
  { code: "DE", name: "Germany", zone: "EU" },
  { code: "NL", name: "Netherlands", zone: "EU" },
  { code: "ES", name: "Spain", zone: "EU" },
  { code: "IT", name: "Italy", zone: "EU" },
  { code: "BE", name: "Belgium", zone: "EU" },
  { code: "PT", name: "Portugal", zone: "EU" },
  { code: "AT", name: "Austria", zone: "EU" },
  { code: "SE", name: "Sweden", zone: "EU" },
  { code: "DK", name: "Denmark", zone: "EU" },
  { code: "US", name: "United States", zone: "US" },
]

export function countryByCode(code: string | undefined) {
  const trimmed = code?.trim().toUpperCase()
  return COUNTRIES.find((item) => item.code === trimmed) ?? null
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UNUSUAL = /[<>]|[\u0000-\u001f]/

export type ContactInput = {
  email?: string
  fullName?: string
  address?: string
  city?: string
  postcode?: string
  country?: string
  phone?: string
}

export type Contact = {
  email: string
  fullName: string
  address: string
  city: string
  postcode: string
  country: string
  zone: ShippingZone
  phone?: string
}

export function parseContact(input: ContactInput): { contact: Contact } | { error: string } {
  const email = input.email?.trim() ?? ""
  const fullName = input.fullName?.trim() ?? ""
  const address = input.address?.trim() ?? ""
  const city = input.city?.trim() ?? ""
  const postcode = input.postcode?.trim() ?? ""
  const phone = input.phone?.trim() ?? ""
  const country = countryByCode(input.country)
  if ([email, fullName, address, city, postcode, phone].some((value) => UNUSUAL.test(value))) {
    return { error: "Remove unusual characters from the contact details." }
  }
  if (!EMAIL.test(email) || email.length > 160) return { error: "A real email address is required." }
  if (fullName.length < 2 || fullName.length > 160) return { error: "A full name is required." }
  if (address.length < 4 || address.length > 240) return { error: "A street address is required." }
  if (city.length < 2 || city.length > 80) return { error: "A city is required." }
  if (postcode.length < 2 || postcode.length > 24) return { error: "A postcode is required." }
  if (!country) return { error: "Choose a country we currently ship to." }
  if (phone.length > 40) return { error: "That phone number is too long." }
  return {
    contact: {
      email,
      fullName,
      address,
      city,
      postcode,
      country: country.code,
      zone: country.zone,
      phone: phone || undefined,
    },
  }
}
